/**
 * Global Error Handler Middleware
 *
 * Catches all unhandled errors and returns consistent API responses.
 * Maps known error types to appropriate HTTP status codes.
 */

import type { Request, Response, NextFunction } from 'express';
import { AIGenerationError } from '../services/generationService.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof AIGenerationError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle Zod validation errors that slip through
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err,
      },
    });
    return;
  }

  // Default 500 error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
}
