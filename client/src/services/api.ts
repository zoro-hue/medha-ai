/**
 * API Service
 *
 * Centralized HTTP client for all backend communication.
 * Handles AbortController for request cancellation,
 * race condition prevention (latest-wins), and typed responses.
 */

import type { ApiResponse, StudyMaterial, GenerateRequest } from '@/types';

const API_BASE = '/api';

// Track the latest request to implement latest-wins strategy
let currentAbortController: AbortController | null = null;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
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
    // Re-throw abort errors with a clean message
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request was cancelled', 'ABORTED', 0);
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to the server. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    throw error;
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
