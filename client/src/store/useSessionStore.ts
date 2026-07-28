/**
 * Session History Store
 *
 * Manages saving, loading, and manipulating study sessions in localStorage.
 * Supports export/import for session portability.
 */

import { create } from 'zustand';
import type { StudySession, StudyMaterial, QuizAnswer } from '@/types';
import { generateId, storage } from '@/lib/utils';

import { useStudyStore } from './useStudyStore';

const STORAGE_KEY = 'studyforge_sessions';

interface SessionStore {
  sessions: StudySession[];

  // ─── Actions ────────────────────────────────────────────────────────────
  loadSessions: () => void;
  saveSession: (params: {
    title: string;
    inputContent: string;
    material: StudyMaterial;
    quizResults: QuizAnswer[];
    masteredCards: string[];
    bookmarkedCards: string[];
    timeSpentMs: number;
  }) => string;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  restoreSession: (id: string) => StudySession | null;
  exportSession: (id: string) => void;
  exportAllSessions: () => void;
  importSessions: (json: string) => { imported: number; errors: string[] };
  clearAll: () => void;
}

function persistSessions(sessions: StudySession[]): void {
  // Convert to a serializable format (sets don't serialize)
  storage.set(STORAGE_KEY, sessions);
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],

  loadSessions: () => {
    const loaded = storage.get<StudySession[]>(STORAGE_KEY, []);
    // Sort by most recent
    const sorted = loaded.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    set({ sessions: sorted });
  },

  saveSession: ({ title, inputContent, material, quizResults, masteredCards, bookmarkedCards, timeSpentMs }) => {
    const id = generateId();
    const now = new Date().toISOString();
    const session: StudySession = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      inputContent,
      material,
      quizResults,
      masteredCards,
      bookmarkedCards,
      timeSpentMs,
    };

    const sessions = [session, ...get().sessions];
    set({ sessions });
    persistSessions(sessions);
    return id;
  },

  deleteSession: (id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    set({ sessions });
    persistSessions(sessions);
  },

  duplicateSession: (id) => {
    const original = get().sessions.find((s) => s.id === id);
    if (!original) return;

    const newId = generateId();
    const now = new Date().toISOString();
    const duplicate: StudySession = {
      ...original,
      id: newId,
      title: `${original.title} (copy)`,
      createdAt: now,
      updatedAt: now,
    };

    const sessions = [duplicate, ...get().sessions];
    set({ sessions });
    persistSessions(sessions);
  },

  renameSession: (id, title) => {
    const sessions = get().sessions.map((s) =>
      s.id === id ? { ...s, title, updatedAt: new Date().toISOString() } : s
    );
    set({ sessions });
    persistSessions(sessions);
  },

  restoreSession: (id) => {
    const session = get().sessions.find((s) => s.id === id) || null;
    if (session) {
      useStudyStore.getState().setMaterial(session.material);
      useStudyStore.getState().setInputContent(session.inputContent);
    }
    return session;
  },

  exportSession: (id) => {
    const session = get().sessions.find((s) => s.id === id);
    if (!session) return;

    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyforge-${session.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportAllSessions: () => {
    const sessions = get().sessions;
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyforge-all-sessions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importSessions: (json) => {
    const errors: string[] = [];
    let imported = 0;

    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const newSessions: StudySession[] = [];

      for (const item of items) {
        if (!item.id || !item.title || !item.material) {
          errors.push(`Invalid session format: missing required fields`);
          continue;
        }

        // Avoid duplicates
        if (get().sessions.some((s) => s.id === item.id)) {
          item.id = generateId();
        }

        newSessions.push(item as StudySession);
        imported++;
      }

      const sessions = [...newSessions, ...get().sessions];
      set({ sessions });
      persistSessions(sessions);
    } catch {
      errors.push('Failed to parse JSON file');
    }

    return { imported, errors };
  },

  clearAll: () => {
    set({ sessions: [] });
    storage.remove(STORAGE_KEY);
  },
}));
