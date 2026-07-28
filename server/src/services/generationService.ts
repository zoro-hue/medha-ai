/**
 * AI Generation Service
 *
 * Orchestrates the AI call pipeline:
 * 1. Build prompt from user content
 * 2. Call primary provider (Gemini)
 * 3. Fall back to secondary provider (Groq) on failure
 * 4. Parse and validate JSON response with Zod
 * 5. Retry on validation failure with exponential backoff
 * 6. Handle race conditions via AbortController
 */

import { StudyMaterialSchema, type StudyMaterial, type AIProvider, type GenerateRequest } from '../types/schemas.js';
import { buildGenerationPrompt, getSystemPrompt } from '../prompts/studyPrompt.js';

// ─── Error Types ──────────────────────────────────────────────────────────────

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string,
    public readonly retryable: boolean,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

// ─── Configuration ────────────────────────────────────────────────────────────

interface GenerationConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: GenerationConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  timeoutMs: 60000,
};

// ─── JSON Extraction Utility ──────────────────────────────────────────────────

/**
 * Attempts to extract valid JSON from potentially messy AI output.
 * Handles common issues: markdown code fences, leading/trailing text,
 * partial JSON, and BOM characters.
 */
function extractJSON(raw: string): string {
  // Remove BOM and trim
  let cleaned = raw.replace(/^\uFEFF/, '').trim();

  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find the first { and last } to extract the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No valid JSON object found in response');
  }

  return cleaned.substring(firstBrace, lastBrace + 1);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class GenerationService {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;
  private config: GenerationConfig;

  constructor(primary: AIProvider, fallback: AIProvider, config?: Partial<GenerationConfig>) {
    this.primaryProvider = primary;
    this.fallbackProvider = fallback;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate study materials from user content.
   * Implements the full retry + fallback pipeline.
   */
  async generate(
    request: GenerateRequest,
    signal?: AbortSignal
  ): Promise<{ data: StudyMaterial; meta: { provider: string; latencyMs: number; retries: number } }> {
    const startTime = Date.now();
    const prompt = buildGenerationPrompt(request.content, request.options);
    const systemPrompt = getSystemPrompt();

    let lastError: Error | null = null;
    let totalRetries = 0;

    // Try primary provider with retries
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new AIGenerationError('Request cancelled', 'ABORTED', 'none', false, 499);
      }

      try {
        const raw = await this.callWithTimeout(this.primaryProvider, prompt, systemPrompt, signal);
        const data = this.parseAndValidate(raw);
        return {
          data,
          meta: {
            provider: this.primaryProvider.name,
            latencyMs: Date.now() - startTime,
            retries: totalRetries,
          },
        };
      } catch (error) {
        lastError = error as Error;
        totalRetries++;

        // Don't retry on abort
        if ((error as Error).name === 'AbortError') {
          throw new AIGenerationError('Request cancelled', 'ABORTED', this.primaryProvider.name, false, 499);
        }

        // Don't retry on validation errors for the last attempt before fallback
        if (attempt < this.config.maxRetries) {
          await this.backoff(attempt);
        }
      }
    }

    // Try fallback provider with retries
    console.warn(`Primary provider failed after ${totalRetries} attempts, trying fallback. Last error: ${lastError?.message}`);

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new AIGenerationError('Request cancelled', 'ABORTED', 'none', false, 499);
      }

      try {
        const raw = await this.callWithTimeout(this.fallbackProvider, prompt, systemPrompt, signal);
        const data = this.parseAndValidate(raw);
        return {
          data,
          meta: {
            provider: this.fallbackProvider.name,
            latencyMs: Date.now() - startTime,
            retries: totalRetries,
          },
        };
      } catch (error) {
        lastError = error as Error;
        totalRetries++;

        if ((error as Error).name === 'AbortError') {
          throw new AIGenerationError('Request cancelled', 'ABORTED', this.fallbackProvider.name, false, 499);
        }

        if (attempt < this.config.maxRetries) {
          await this.backoff(attempt);
        }
      }
    }

    // All attempts exhausted
    throw new AIGenerationError(
      `All providers failed after ${totalRetries} attempts. Last error: ${lastError?.message}`,
      'ALL_PROVIDERS_FAILED',
      'all',
      true,
      502
    );
  }

  /**
   * Call a provider with a timeout via AbortController.
   */
  private async callWithTimeout(
    provider: AIProvider,
    prompt: string,
    systemPrompt: string,
    externalSignal?: AbortSignal
  ): Promise<string> {
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), this.config.timeoutMs);

    // Combine external signal with timeout signal
    const onExternalAbort = () => timeoutController.abort();
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

    try {
      return await provider.generate(prompt, systemPrompt, timeoutController.signal);
    } catch (error) {
      if (timeoutController.signal.aborted && !externalSignal?.aborted) {
        throw new AIGenerationError(
          `Provider ${provider.name} timed out after ${this.config.timeoutMs}ms`,
          'TIMEOUT',
          provider.name,
          true,
          504
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    }
  }

  /**
   * Parse raw AI text into validated StudyMaterial.
   * Handles malformed JSON, wrong shape, and partial data.
   */
  private parseAndValidate(raw: string): StudyMaterial {
    let jsonString: string;

    try {
      jsonString = extractJSON(raw);
    } catch {
      throw new AIGenerationError(
        'Could not extract JSON from AI response',
        'INVALID_JSON_STRUCTURE',
        'unknown',
        true
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      throw new AIGenerationError(
        `JSON parsing failed: ${(parseError as Error).message}`,
        'JSON_PARSE_ERROR',
        'unknown',
        true
      );
    }

    const result = StudyMaterialSchema.safeParse(parsed);

    if (!result.success) {
      const issues = result.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');

      throw new AIGenerationError(
        `Schema validation failed: ${issues}`,
        'VALIDATION_ERROR',
        'unknown',
        true
      );
    }

    return result.data;
  }

  /**
   * Exponential backoff with jitter.
   */
  private backoff(attempt: number): Promise<void> {
    const delay = Math.min(
      this.config.baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
      this.config.maxDelayMs
    );
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
