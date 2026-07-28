import { z } from 'zod';

// ─── Flashcard Schema ─────────────────────────────────────────────────────────
export const FlashcardSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Quiz Question Schema ─────────────────────────────────────────────────────
export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// ─── Mind Map Node Schema ─────────────────────────────────────────────────────
export const MindMapNodeSchema = z.object({
  id: z.string().min(1),
  parent: z.string().nullable(),
  label: z.string().min(1),
});

// ─── Complete Study Material Schema ───────────────────────────────────────────
export const StudyMaterialSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(10),
  flashcards: z.array(FlashcardSchema).min(1).max(30),
  quiz: z.array(QuizQuestionSchema).min(1).max(20),
  mindmap: z.array(MindMapNodeSchema).min(1).max(30),
  keyPoints: z.array(z.string().min(1)).min(1).max(15),
  mistakes: z.array(z.string().min(1)).min(1).max(10),
  revisionTips: z.array(z.string().min(1)).min(1).max(10),
});

// ─── Request Schema ───────────────────────────────────────────────────────────
export const GenerateRequestSchema = z.object({
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(15000, 'Content must be at most 15,000 characters'),
  options: z
    .object({
      flashcardCount: z.number().int().min(3).max(30).optional(),
      quizCount: z.number().int().min(3).max(20).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
      language: z.string().optional(),
    })
    .optional(),
});

// ─── TypeScript Types (inferred from Zod) ─────────────────────────────────────
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type MindMapNode = z.infer<typeof MindMapNodeSchema>;
export type StudyMaterial = z.infer<typeof StudyMaterialSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ─── Provider Types ───────────────────────────────────────────────────────────
export interface AIProvider {
  name: string;
  generate(prompt: string, systemPrompt: string, signal?: AbortSignal): Promise<string>;
}

export interface ProviderConfig {
  primary: AIProvider;
  fallback: AIProvider;
}

// ─── API Response Envelope ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    provider: string;
    latencyMs: number;
    retries: number;
    cached: boolean;
  };
}
