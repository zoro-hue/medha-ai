/**
 * Generation Controller
 *
 * Handles the /api/generate endpoint.
 * Manages request lifecycle including AbortController for client disconnects
 * and race condition prevention.
 */

import type { Request, Response } from 'express';
import { GenerationService, AIGenerationError } from '../services/generationService.js';
import type { GenerateRequest, ApiResponse, StudyMaterial } from '../types/schemas.js';

// Track active requests per IP to prevent duplicate concurrent requests
const activeRequests = new Map<string, AbortController>();

export function createGenerateController(service: GenerationService) {
  return async (req: Request, res: Response): Promise<void> => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const body = req.body as GenerateRequest;

    // ─── Race Condition Prevention ──────────────────────────────────
    // Cancel any existing request from this client (latest-wins strategy)
    const existingController = activeRequests.get(clientId);
    if (existingController) {
      existingController.abort();
      console.log(`[GENERATE] Cancelled previous request for client: ${clientId}`);
    }

    const controller = new AbortController();
    activeRequests.set(clientId, controller);

    // Cancel on client disconnect
    res.on('close', () => {
      if (!res.writableEnded) {
        controller.abort();
        console.log(`[GENERATE] Client disconnected: ${clientId}`);
      }
    });

    try {
      const result = await service.generate(body, controller.signal);

      // Don't send response if client disconnected
      if (controller.signal.aborted) return;

      const response: ApiResponse<StudyMaterial> = {
        success: true,
        data: result.data,
        meta: {
          ...result.meta,
          cached: false,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      // Don't send response if client disconnected
      if (controller.signal.aborted && !res.headersSent) return;

      if (error instanceof AIGenerationError) {
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
        res.status(error.statusCode).json(response);
        return;
      }

      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during generation',
        },
      };
      res.status(500).json(response);
    } finally {
      // Clean up active request tracking
      if (activeRequests.get(clientId) === controller) {
        activeRequests.delete(clientId);
      }
    }
  };
}
