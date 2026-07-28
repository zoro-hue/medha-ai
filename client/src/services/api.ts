/**
 * API Service
 *
 * Centralized HTTP client for all backend communication.
 * Handles AbortController for request cancellation,
 * race condition prevention (latest-wins), and typed responses.
 */

import type { ApiResponse, StudyMaterial, GenerateRequest } from '@/types';
import { generateLocalStudyMaterial } from './localGenerator';

const API_BASE = '/api';

// Track the latest request to implement latest-wins strategy
let currentAbortController: AbortController | null = null;

class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Generic fetch wrapper with error handling and typed responses.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || `Request failed with status ${response.status}`,
      data.error?.code || 'UNKNOWN_ERROR',
      response.status,
      data.error?.details
    );
  }

  return data;
}

/**
 * Generate study materials from user content.
 *
 * Implements latest-wins strategy: if a new request is made while
 * a previous one is in-flight, the previous request is cancelled.
 * Falls back to local smart generation if backend is unavailable.
 */
export async function generateStudyMaterial(
  payload: GenerateRequest
): Promise<ApiResponse<StudyMaterial>> {
  // Cancel any in-flight request (latest-wins)
  if (currentAbortController) {
    currentAbortController.abort();
  }

  const controller = new AbortController();
  currentAbortController = controller;

  try {
    const result = await request<StudyMaterial>('/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    return result;
  } catch (error) {
    // Re-throw abort errors with a clean message (user cancelled)
    if (
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof ApiError && error.code === 'ABORTED')
    ) {
      throw new ApiError('Request was cancelled', 'ABORTED', 0);
    }

    // Network error (server offline/unreachable) or backend error -> fall back to local smart generator
    console.warn('Backend server unreachable or returned error. Falling back to local smart study generator:', error);

    const localMaterial = generateLocalStudyMaterial(payload.content, payload.options);

    return {
      success: true,
      data: localMaterial,
      meta: {
        provider: 'Medhā Engine (Offline Mode)',
        latencyMs: 350,
        retries: 0,
        cached: false,
      },
    };
  } finally {
    // Only clear if this is still the current controller
    if (currentAbortController === controller) {
      currentAbortController = null;
    }
  }
}

/**
 * Cancel the current in-flight generation request.
 */
export function cancelGeneration(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export { ApiError };

