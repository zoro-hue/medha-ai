/**
 * useKeyboardShortcuts Hook
 *
 * Global keyboard shortcuts for the application.
 * Supports modifier keys and prevents conflicts with input fields.
 */

import { useEffect, useCallback } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { useThemeStore } from '@/store/useThemeStore';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const { viewMode, setViewMode, flipCard, nextCard, prevCard, material } = useStudyStore();
  const { toggleTheme } = useThemeStore();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: '1', alt: true, action: () => setViewMode('input'), description: 'Go to Input' },
    { key: '2', alt: true, action: () => { if (material) setViewMode('flashcards'); }, description: 'Go to Flashcards' },
    { key: '3', alt: true, action: () => { if (material) setViewMode('quiz'); }, description: 'Go to Quiz' },
    { key: '4', alt: true, action: () => { if (material) setViewMode('summary'); }, description: 'Go to Summary' },
    { key: '5', alt: true, action: () => setViewMode('history'), description: 'Go to History' },

    // Flashcard controls
    { key: ' ', action: () => { if (viewMode === 'flashcards') flipCard(); }, description: 'Flip Card' },
    { key: 'ArrowRight', action: () => { if (viewMode === 'flashcards') nextCard(); }, description: 'Next Card' },
    { key: 'ArrowLeft', action: () => { if (viewMode === 'flashcards') prevCard(); }, description: 'Previous Card' },

    // Theme
    { key: 'd', ctrl: true, shift: true, action: toggleTheme, description: 'Toggle Dark Mode' },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow only modifier-key shortcuts in input fields
        if (!e.ctrlKey && !e.altKey && !e.metaKey) return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key === shortcut.key;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewMode, material]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}
