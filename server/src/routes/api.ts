/**
 * API Routes
 *
 * Defines all API endpoints with their middleware chains.
 */

import { Router } from 'express';
import { GenerateRequestSchema } from '../types/schemas.js';
import { validateBody, rateLimit } from '../middleware/index.js';
import { createGenerateController } from '../controllers/generateController.js';
import type { GenerationService } from '../services/generationService.js';

export function createApiRouter(generationService: GenerationService): Router {
  const router = Router();

  // Health check
  router.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // Generate study materials
  router.post(
    '/generate',
    rateLimit({ windowMs: 60000, maxRequests: 10 }),
    validateBody(GenerateRequestSchema),
    createGenerateController(generationService)
  );

  return router;
}
