/**
 * Theme Store
 *
 * Manages light/dark/system theme with localStorage persistence.
 * Applies the correct class to the document root.
 */

import { create } from 'zustand';
import type { Theme } from '@/types';
import { storage } from '@/lib/utils';

const STORAGE_KEY = 'studyforge_theme';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

export const useThemeStore = create<ThemeStore>((set) => {
  const savedTheme = storage.get<Theme>(STORAGE_KEY, 'dark');
  const resolved = resolveTheme(savedTheme);

  // Apply on initialization
  if (typeof document !== 'undefined') {
    applyTheme(resolved);
  }

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const state = useThemeStore.getState();
      if (state.theme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    });
  }

  return {
    theme: savedTheme,
    resolvedTheme: resolved,

    setTheme: (theme) => {
      const resolved = resolveTheme(theme);
      applyTheme(resolved);
      storage.set(STORAGE_KEY, theme);
      set({ theme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const current = useThemeStore.getState();
      const next = current.resolvedTheme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storage.set(STORAGE_KEY, next);
      set({ theme: next, resolvedTheme: next });
    },
  };
});
