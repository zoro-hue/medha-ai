/**
 * useGenerate Hook
 *
 * TanStack Query mutation hook for AI content generation.
 * Orchestrates the generation flow: loading states, error handling,
 * and store updates.
 */

import { useMutation } from '@tanstack/react-query';
import { generateStudyMaterial, cancelGeneration, ApiError } from '@/services/api';
import { useStudyStore } from '@/store/useStudyStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { GenerateRequest } from '@/types';

export function useGenerate() {
  const {
    setMaterial,
    setIsGenerating,
    setError,
    setGenerationMeta,
    inputContent,
  } = useStudyStore();
  const { saveSession } = useSessionStore();

  const mutation = useMutation({
    mutationFn: (payload: GenerateRequest) => generateStudyMaterial(payload),

    onMutate: () => {
      setIsGenerating(true);
      setError(null);
      setGenerationMeta(null);
    },

    onSuccess: (response) => {
      if (response.data) {
        setMaterial(response.data);

        // Auto-save the session
        saveSession({
          title: response.data.title,
          inputContent,
          material: response.data,
          quizResults: [],
          masteredCards: [],
          bookmarkedCards: [],
          timeSpentMs: response.meta?.latencyMs || 0,
        });

        if (response.meta) {
          setGenerationMeta({
            provider: response.meta.provider,
            latencyMs: response.meta.latencyMs,
            retries: response.meta.retries,
          });
        }
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        if (error.code === 'ABORTED') return; // Don't show error for cancelled requests

        switch (error.code) {
          case 'RATE_LIMITED':
            setError('You\'re making requests too quickly. Please wait a moment and try again.');
            break;
          case 'VALIDATION_ERROR':
            setError('Your input doesn\'t meet the requirements. Please check and try again.');
            break;
          case 'NETWORK_ERROR':
            setError('Unable to connect to the server. Please check your connection.');
            break;
          default:
            setError(error.message || 'An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    },

    onSettled: () => {
      setIsGenerating(false);
    },
  });

  return {
    generate: mutation.mutate,
    cancel: cancelGeneration,
    isGenerating: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
