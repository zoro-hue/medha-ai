/**
 * Groq AI Provider (Fallback)
 *
 * Uses the Groq SDK to call Llama/Mixtral models as a fallback
 * when Gemini is unavailable or returns errors.
 */

import Groq from 'groq-sdk';
import type { AIProvider } from '../types/schemas.js';

export class GroqProvider implements AIProvider {
  public readonly name = 'groq-llama';
  private client: Groq;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GROQ_API_KEY is required');
    this.client = new Groq({ apiKey });
  }

  async generate(prompt: string, systemPrompt: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8192,
      top_p: 0.8,
      response_format: { type: 'json_object' },
    });

    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error('Groq returned an empty response');
    }

    return text;
  }
}
