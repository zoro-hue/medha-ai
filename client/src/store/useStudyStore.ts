/**
 * Study Store
 *
 * Central state management for study materials using Zustand.
 * Manages the current study session, flashcard state, and quiz state.
 */

import { create } from 'zustand';
import type { StudyMaterial, FlashcardState, QuizState, QuizAnswer, ViewMode } from '@/types';
import { shuffleArray } from '@/lib/utils';

interface StudyStore {
  // ─── Core State ─────────────────────────────────────────────────────────
  material: StudyMaterial | null;
  inputContent: string;
  viewMode: ViewMode;
  isGenerating: boolean;
  error: string | null;
  generationMeta: { provider: string; latencyMs: number; retries: number } | null;

  // ─── Flashcard State ────────────────────────────────────────────────────
  flashcard: FlashcardState;

  // ─── Quiz State ─────────────────────────────────────────────────────────
  quiz: QuizState;

  // ─── Actions ────────────────────────────────────────────────────────────
  setMaterial: (material: StudyMaterial) => void;
  setInputContent: (content: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGenerationMeta: (meta: { provider: string; latencyMs: number; retries: number } | null) => void;
  reset: () => void;

  // ─── Flashcard Actions ──────────────────────────────────────────────────
  nextCard: () => void;
  prevCard: () => void;
  flipCard: () => void;
  toggleBookmark: (id: string) => void;
  toggleMastered: (id: string) => void;
  shuffleCards: () => void;
  setFilterDifficulty: (filter: 'all' | 'easy' | 'medium' | 'hard') => void;
  setSearchQuery: (query: string) => void;
  getFilteredCards: () => StudyMaterial['flashcards'];

  // ─── Quiz Actions ──────────────────────────────────────────────────────
  answerQuestion: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  startQuiz: () => void;
  retryWrongAnswers: () => void;
  resetQuiz: () => void;
  setShowExplanation: (show: boolean) => void;
  getQuizScore: () => { correct: number; total: number; percentage: number };
  getWrongAnswers: () => QuizAnswer[];
}

const initialFlashcardState: FlashcardState = {
  currentIndex: 0,
  isFlipped: false,
  bookmarked: new Set(),
  mastered: new Set(),
  filterDifficulty: 'all',
  searchQuery: '',
  isShuffled: false,
  shuffledOrder: [],
};

const initialQuizState: QuizState = {
  currentIndex: 0,
  answers: [],
  mode: 'taking',
  startedAt: null,
  timePerQuestion: [],
  showExplanation: false,
};

export const useStudyStore = create<StudyStore>((set, get) => ({
  // ─── Initial State ──────────────────────────────────────────────────────
  material: null,
  inputContent: '',
  viewMode: 'home',
  isGenerating: false,
  error: null,
  generationMeta: null,
  flashcard: { ...initialFlashcardState },
  quiz: { ...initialQuizState },

  // ─── Core Actions ───────────────────────────────────────────────────────
  setMaterial: (material) =>
    set({
      material,
      viewMode: 'flashcards',
      error: null,
      flashcard: { ...initialFlashcardState },
      quiz: { ...initialQuizState },
    }),

  setInputContent: (content) => set({ inputContent: content }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  setError: (error) => set({ error }),
  setGenerationMeta: (meta) => set({ generationMeta: meta }),

  reset: () =>
    set({
      material: null,
      inputContent: '',
      viewMode: 'input',
      isGenerating: false,
      error: null,
      generationMeta: null,
      flashcard: { ...initialFlashcardState },
      quiz: { ...initialQuizState },
    }),

  // ─── Flashcard Actions ──────────────────────────────────────────────────
  nextCard: () => {
    const { flashcard, material } = get();
    if (!material) return;
    const filteredCards = get().getFilteredCards();
    const nextIndex = (flashcard.currentIndex + 1) % filteredCards.length;
    set({ flashcard: { ...flashcard, currentIndex: nextIndex, isFlipped: false } });
  },

  prevCard: () => {
    const { flashcard } = get();
    const filteredCards = get().getFilteredCards();
    const prevIndex = flashcard.currentIndex === 0 ? filteredCards.length - 1 : flashcard.currentIndex - 1;
    set({ flashcard: { ...flashcard, currentIndex: prevIndex, isFlipped: false } });
  },

  flipCard: () => {
    const { flashcard } = get();
    set({ flashcard: { ...flashcard, isFlipped: !flashcard.isFlipped } });
  },

  toggleBookmark: (id) => {
    const { flashcard } = get();
    const bookmarked = new Set(flashcard.bookmarked);
    if (bookmarked.has(id)) {
      bookmarked.delete(id);
    } else {
      bookmarked.add(id);
    }
    set({ flashcard: { ...flashcard, bookmarked } });
  },

  toggleMastered: (id) => {
    const { flashcard } = get();
    const mastered = new Set(flashcard.mastered);
    if (mastered.has(id)) {
      mastered.delete(id);
    } else {
      mastered.add(id);
    }
    set({ flashcard: { ...flashcard, mastered } });
  },

  shuffleCards: () => {
    const { flashcard, material } = get();
    if (!material) return;
    const shuffledOrder = shuffleArray(
      Array.from({ length: material.flashcards.length }, (_, i) => i)
    );
    set({
      flashcard: {
        ...flashcard,
        isShuffled: !flashcard.isShuffled,
        shuffledOrder,
        currentIndex: 0,
        isFlipped: false,
      },
    });
  },

  setFilterDifficulty: (filter) => {
    const { flashcard } = get();
    set({ flashcard: { ...flashcard, filterDifficulty: filter, currentIndex: 0, isFlipped: false } });
  },

  setSearchQuery: (query) => {
    const { flashcard } = get();
    set({ flashcard: { ...flashcard, searchQuery: query, currentIndex: 0, isFlipped: false } });
  },

  getFilteredCards: () => {
    const { material, flashcard } = get();
    if (!material) return [];

    let cards = [...material.flashcards];

    // Apply shuffle order
    if (flashcard.isShuffled && flashcard.shuffledOrder.length > 0) {
      cards = flashcard.shuffledOrder.map((i) => material.flashcards[i]);
    }

    // Apply difficulty filter
    if (flashcard.filterDifficulty !== 'all') {
      cards = cards.filter((c) => c.difficulty === flashcard.filterDifficulty);
    }

    // Apply search filter
    if (flashcard.searchQuery.trim()) {
      const query = flashcard.searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.question.toLowerCase().includes(query) ||
          c.answer.toLowerCase().includes(query)
      );
    }

    return cards;
  },

  // ─── Quiz Actions ──────────────────────────────────────────────────────
  startQuiz: () => {
    set({
      quiz: { ...initialQuizState, mode: 'taking', startedAt: Date.now() },
      viewMode: 'quiz',
    });
  },

  answerQuestion: (answer) => {
    const { quiz } = get();
    set({
      quiz: {
        ...quiz,
        answers: [...quiz.answers, answer],
        showExplanation: true,
      },
    });
  },

  nextQuestion: () => {
    const { quiz, material } = get();
    if (!material) return;

    const isLast = quiz.currentIndex >= material.quiz.length - 1;

    if (isLast) {
      set({
        quiz: { ...quiz, mode: 'results', showExplanation: false },
      });
    } else {
      set({
        quiz: {
          ...quiz,
          currentIndex: quiz.currentIndex + 1,
          showExplanation: false,
        },
      });
    }
  },

  retryWrongAnswers: () => {
    const { quiz } = get();
    const wrongIds = quiz.answers.filter((a) => !a.isCorrect).map((a) => a.questionId);
    set({
      quiz: {
        ...initialQuizState,
        mode: 'retrying',
        retryQuestionIds: wrongIds,
        startedAt: Date.now(),
        currentIndex: 0,
      },
      viewMode: 'quiz',
    });
  },

  resetQuiz: () => {
    set({
      quiz: {
        ...initialQuizState,
        mode: 'taking',
        startedAt: Date.now(),
      },
      viewMode: 'quiz',
    });
  },

  setShowExplanation: (show) => {
    const { quiz } = get();
    set({ quiz: { ...quiz, showExplanation: show } });
  },

  getQuizScore: () => {
    const { quiz } = get();
    const correct = quiz.answers.filter((a) => a.isCorrect).length;
    const total = quiz.answers.length;
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  },

  getWrongAnswers: () => {
    const { quiz } = get();
    return quiz.answers.filter((a) => !a.isCorrect);
  },
}));
