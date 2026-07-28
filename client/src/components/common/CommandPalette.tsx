import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layers, Brain, FileText, History as HistoryIcon, X, ArrowRight } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { useSessionStore } from '@/store/useSessionStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette = memo(function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { material, setViewMode } = useStudyStore();
  const { sessions, restoreSession } = useSessionStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: { type: 'flashcard' | 'quiz' | 'session' | 'keypoint'; title: string; subtitle: string; action: () => void }[] = [];

    // Search current flashcards
    material?.flashcards.forEach((card) => {
      if (card.question.toLowerCase().includes(q) || card.answer.toLowerCase().includes(q)) {
        results.push({
          type: 'flashcard',
          title: card.question,
          subtitle: `Answer: ${card.answer.slice(0, 60)}...`,
          action: () => {
            setViewMode('flashcards');
            onClose();
          },
        });
      }
    });

    // Search current quiz questions
    material?.quiz.forEach((question) => {
      if (question.question.toLowerCase().includes(q)) {
        results.push({
          type: 'quiz',
          title: question.question,
          subtitle: `Difficulty: ${question.difficulty}`,
          action: () => {
            setViewMode('quiz');
            onClose();
          },
        });
      }
    });

    // Search saved sessions
    sessions.forEach((session) => {
      if (session.title.toLowerCase().includes(q)) {
        results.push({
          type: 'session',
          title: session.title,
          subtitle: `${session.material.flashcards.length} cards · ${new Date(session.createdAt).toLocaleDateString()}`,
          action: () => {
            restoreSession(session.id);
            setViewMode('flashcards');
            onClose();
          },
        });
      }
    });

    return results.slice(0, 8);
  }, [query, material, sessions, setViewMode, restoreSession, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl bg-surface-0 border border-surface-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Header */}
          <div className="relative flex items-center px-4 border-b border-surface-border">
            <Search size={18} className="text-text-tertiary mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search flashcards, quizzes, topics, sessions... (Esc to close)"
              className="w-full py-4 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0 focus:border-none border-0 outline-none ring-0 text-sm shadow-none"
              autoFocus
            />
            <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {query.trim() === '' ? (
              <div className="p-6 text-center text-xs text-text-tertiary">
                Type keywords to search across your current study material and historical sessions.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-tertiary">
                No matching results found for "{query}".
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((res, index) => (
                  <button
                    key={index}
                    onClick={res.action}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-surface-100 text-text-secondary group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500 transition-colors">
                        {res.type === 'flashcard' && <Layers size={16} />}
                        {res.type === 'quiz' && <Brain size={16} />}
                        {res.type === 'session' && <HistoryIcon size={16} />}
                        {res.type === 'keypoint' && <FileText size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{res.title}</p>
                        <p className="text-xs text-text-tertiary truncate">{res.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
