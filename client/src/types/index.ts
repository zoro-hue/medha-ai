/**
 * Shared Type Definitions
 *
 * All types used across the frontend application.
 * Mirrors the backend Zod schemas for type safety.
 */

// ─── AI Response Types ────────────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  tags?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MindMapNode {
  id: string;
  parent: string | null;
  label: string;
}

export interface StudyMaterial {
  title: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  mindmap: MindMapNode[];
  keyPoints: string[];
  mistakes: string[];
  revisionTips: string[];
}

// ─── API Types ────────────────────────────────────────────────────────────────

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

export interface GenerateRequest {
  content: string;
  options?: {
    flashcardCount?: number;
    quizCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    language?: string;
  };
}

// ─── Flashcard State Types ────────────────────────────────────────────────────

export interface FlashcardState {
  currentIndex: number;
  isFlipped: boolean;
  bookmarked: Set<string>;
  mastered: Set<string>;
  filterDifficulty: 'all' | 'easy' | 'medium' | 'hard';
  searchQuery: string;
  isShuffled: boolean;
  shuffledOrder: number[];
}

// ─── Quiz State Types ─────────────────────────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export type QuizMode = 'taking' | 'review' | 'results' | 'retrying';

export interface QuizState {
  currentIndex: number;
  answers: QuizAnswer[];
  mode: QuizMode;
  startedAt: number | null;
  timePerQuestion: number[];
  showExplanation: boolean;
  retryQuestionIds?: string[];
}

// ─── Session Types ────────────────────────────────────────────────────────────

export interface StudySession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  inputContent: string;
  material: StudyMaterial;
  quizResults: QuizAnswer[];
  masteredCards: string[];
  bookmarkedCards: string[];
  timeSpentMs: number;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface AnalyticsData {
  totalCards: number;
  masteredCards: number;
  totalQuizzes: number;
  averageAccuracy: number;
  studyStreak: number;
  totalTimeMs: number;
  topicDifficulty: { topic: string; difficulty: number }[];
  sessionsHistory: { date: string; cardsStudied: number; accuracy: number }[];
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export type ViewMode = 'home' | 'input' | 'flashcards' | 'quiz' | 'summary' | 'analytics' | 'history';
