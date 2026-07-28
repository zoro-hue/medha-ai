/**
 * Gemini AI Provider
 *
 * Uses the Google Generative AI SDK (@google/genai) to call Gemini 2.5 Flash.
 * Configured with JSON-optimized parameters for reliable structured output.
 */

import { GoogleGenAI } from '@google/genai';
import type { AIProvider } from '../types/schemas.js';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini-2.5-flash';
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is required');
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string, systemPrompt: string, signal?: AbortSignal): Promise<string> {
    // Check if already aborted before making the request
    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }

    let response;
    try {
      response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });
    } catch {
      response = await this.client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });
    }

    // Handle abort during generation
    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response');
    }

    return text;
  }
}
