/**
 * StudyForge Backend Server
 *
 * Express API server with:
 * - Helmet for security headers
 * - CORS for cross-origin requests
 * - Compression for response optimization
 * - Morgan for request logging
 * - Rate limiting on AI endpoints
 * - Provider abstraction (Gemini + Groq fallback)
 * - Zod validation on all inputs/outputs
 * - Global error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './utils/env.js';
import { GeminiProvider, GroqProvider } from './providers/index.js';
import { GenerationService } from './services/generationService.js';
import { createApiRouter } from './routes/api.js';
import { errorHandler } from './middleware/index.js';

// ─── Initialize Providers ─────────────────────────────────────────────────────
const gemini = new GeminiProvider(env.GEMINI_API_KEY);
const groq = new GroqProvider(env.GROQ_API_KEY);

// ─── Initialize Services ─────────────────────────────────────────────────────
const generationService = new GenerationService(gemini, groq);

// ─── Create Express App ───────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', createApiRouter(generationService));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10);
app.listen(PORT, () => {
  console.log(`\n🚀 StudyForge API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS Origin: ${env.CORS_ORIGIN}`);
  console.log(`   Primary AI:  ${gemini.name}`);
  console.log(`   Fallback AI: ${groq.name}\n`);
});

export default app;
