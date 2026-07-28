import { describe, it, expect } from 'vitest';
import { StudyMaterialSchema, GenerateRequestSchema } from './schemas';

describe('Backend Zod Schemas Validation', () => {
  it('validates a correct GenerateRequest', () => {
    const validPayload = {
      content: 'This is a test content that meets the minimum length requirement.',
      options: {
        flashcardCount: 5,
        quizCount: 5,
        difficulty: 'mixed',
      },
    };

    const result = GenerateRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects short content in GenerateRequest', () => {
    const invalidPayload = {
      content: 'Too short',
    };

    const result = GenerateRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('validates a complete StudyMaterial schema', () => {
    const validMaterial = {
      title: 'Sorting Algorithms',
      summary: 'An overview of common sorting algorithms including QuickSort and MergeSort.',
      flashcards: [
        {
          id: 'fc_1',
          question: 'What is the average time complexity of QuickSort?',
          answer: 'O(n log n)',
          difficulty: 'medium',
          hint: 'Divide and conquer',
          tags: ['algorithms'],
        },
      ],
      quiz: [
        {
          id: 'q_1',
          question: 'Which sort is stable by default?',
          options: ['QuickSort', 'MergeSort', 'HeapSort', 'SelectionSort'],
          correctAnswer: 'MergeSort',
          explanation: 'MergeSort maintains relative order of equal elements.',
          difficulty: 'medium',
        },
      ],
      mindmap: [
        { id: 'mm_1', parent: null, label: 'Sorting' },
        { id: 'mm_2', parent: 'mm_1', label: 'Comparison Sorts' },
      ],
      keyPoints: ['QuickSort is in-place', 'MergeSort requires O(n) space'],
      mistakes: ['Confusing average and worst-case time complexity'],
      revisionTips: ['Implement both algorithms from memory'],
    };

    const result = StudyMaterialSchema.safeParse(validMaterial);
    expect(result.success).toBe(true);
  });
});
