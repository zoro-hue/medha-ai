import { describe, it, expect, beforeEach } from 'vitest';
import { useStudyStore } from '../store/useStudyStore';
import type { StudyMaterial } from '../types';

const mockMaterial: StudyMaterial = {
  title: 'Test Topic',
  summary: 'Test summary overview',
  flashcards: [
    { id: 'fc_1', question: 'Q1', answer: 'A1', difficulty: 'easy', hint: 'H1' },
    { id: 'fc_2', question: 'Q2', answer: 'A2', difficulty: 'hard', hint: 'H2' },
  ],
  quiz: [
    {
      id: 'q_1',
      question: 'Quiz Q1?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'Because A is right',
      difficulty: 'easy',
    },
  ],
  mindmap: [{ id: 'mm_1', parent: null, label: 'Root' }],
  keyPoints: ['Point 1'],
  mistakes: ['Mistake 1'],
  revisionTips: ['Tip 1'],
};

describe('useStudyStore', () => {
  beforeEach(() => {
    useStudyStore.getState().reset();
  });

  it('initializes with default values', () => {
    const state = useStudyStore.getState();
    expect(state.material).toBeNull();
    expect(state.viewMode).toBe('input');
    expect(state.isGenerating).toBe(false);
  });

  it('sets study material correctly', () => {
    useStudyStore.getState().setMaterial(mockMaterial);
    const state = useStudyStore.getState();
    expect(state.material).toEqual(mockMaterial);
    expect(state.viewMode).toBe('flashcards');
  });

  it('navigates flashcards accurately', () => {
    useStudyStore.getState().setMaterial(mockMaterial);
    expect(useStudyStore.getState().flashcard.currentIndex).toBe(0);

    useStudyStore.getState().nextCard();
    expect(useStudyStore.getState().flashcard.currentIndex).toBe(1);

    useStudyStore.getState().prevCard();
    expect(useStudyStore.getState().flashcard.currentIndex).toBe(0);
  });

  it('toggles flashcard bookmark and mastered state', () => {
    useStudyStore.getState().setMaterial(mockMaterial);

    useStudyStore.getState().toggleBookmark('fc_1');
    expect(useStudyStore.getState().flashcard.bookmarked.has('fc_1')).toBe(true);

    useStudyStore.getState().toggleMastered('fc_1');
    expect(useStudyStore.getState().flashcard.mastered.has('fc_1')).toBe(true);
  });

  it('filters flashcards by difficulty', () => {
    useStudyStore.getState().setMaterial(mockMaterial);
    useStudyStore.getState().setFilterDifficulty('easy');

    const filtered = useStudyStore.getState().getFilteredCards();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('fc_1');
  });
});
