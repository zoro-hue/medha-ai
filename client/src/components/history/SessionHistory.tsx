/**
 * Session History
 *
 * Displays saved study sessions with restore, delete, duplicate,
 * rename, export, and import capabilities.
 */

import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Copy,
  Download,
  Upload,
  Edit3,
  Check,
  X,
  MoreHorizontal,
  FileJson,
  Clock,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useSessionStore } from '@/store/useSessionStore';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';

export const SessionHistory = memo(function SessionHistory() {
  const {
    sessions,
    loadSessions,
    deleteSession,
    duplicateSession,
    renameSession,
    restoreSession,
    exportSession,
    exportAllSessions,
    importSessions,
  } = useSessionStore();
  const { setMaterial, setInputContent, setViewMode } = useStudyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRestore = (id: string) => {
    const session = restoreSession(id);
    if (session) {
      setMaterial(session.material);
      setInputContent(session.inputContent);
      setViewMode('flashcards');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = importSessions(text);
    setImportStatus(
      result.errors.length > 0
        ? `Imported ${result.imported}, ${result.errors.length} errors`
        : `Successfully imported ${result.imported} session${result.imported !== 1 ? 's' : ''}`
    );

    setTimeout(() => setImportStatus(null), 3000);
    e.target.value = '';
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">History</h2>
          <p className="text-sm text-text-secondary mt-1">
            {sessions.length} saved session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg',
              'text-xs font-medium text-text-secondary',
              'border border-surface-border hover:bg-surface-50',
              'transition-colors'
            )}
          >
            <Upload size={14} />
            Import
          </button>

          {sessions.length > 0 && (
            <button
              onClick={exportAllSessions}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg',
                'text-xs font-medium text-text-secondary',
                'border border-surface-border hover:bg-surface-50',
                'transition-colors'
              )}
            >
              <Download size={14} />
              Export All
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Import Status */}
      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-300"
          >
            {importStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session List */}
      {sessions.length === 0 ? (
        <motion.div variants={staggerItem} className="text-center py-12 flex flex-col items-center justify-center">
          <p className="text-lg font-medium text-text-secondary mt-2">No study sessions saved yet</p>
          <p className="text-sm text-text-tertiary mt-1">
            Generate flashcards, quizzes, or summaries to view them in your history!
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRestore={() => handleRestore(session.id)}
              onDelete={() => deleteSession(session.id)}
              onDuplicate={() => duplicateSession(session.id)}
              onRename={(title) => renameSession(session.id, title)}
              onExport={() => exportSession(session.id)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
});

// ─── Session Card ─────────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    createdAt: string;
    material: { flashcards: { id: string }[]; quiz: { id: string }[] };
    quizResults: { isCorrect: boolean }[];
  };
  onRestore: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (title: string) => void;
  onExport: () => void;
}

function getTopicEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('bio') || lower.includes('cell') || lower.includes('gene')) return '🧬';
  if (lower.includes('code') || lower.includes('binary') || lower.includes('data') || lower.includes('algo') || lower.includes('computer')) return '💻';
  if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra') || lower.includes('stat')) return '📐';
  if (lower.includes('physic') || lower.includes('chem') || lower.includes('atom') || lower.includes('quantum')) return '⚡';
  if (lower.includes('histor') || lower.includes('lit') || lower.includes('book') || lower.includes('read')) return '📖';
  return '🧠';
}

function SessionCard({ session, onRestore, onDelete, onDuplicate, onRename, onExport }: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const accuracy = session.quizResults.length > 0
    ? Math.round((session.quizResults.filter((r) => r.isCorrect).length / session.quizResults.length) * 100)
    : null;

  const topicEmoji = getTopicEmoji(session.title);

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        'group relative p-4 rounded-2xl',
        'bg-surface-50 border border-surface-border',
        'hover:border-primary-300 hover:shadow-md transition-all duration-200',
        'cursor-pointer',
        showMenu && 'z-30'
      )}
      onClick={onRestore}
      whileHover={{ y: -1 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Topic Icon Avatar */}
          <div className="w-11 h-11 rounded-2xl bg-surface-0 border border-surface-border shadow-xs flex items-center justify-center text-xl shrink-0">
            {topicEmoji}
          </div>

          <div className="min-w-0 flex-1">
            {/* Title */}
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="flex-1 px-2.5 py-1 rounded-xl bg-surface-0 border border-primary-300 text-sm text-text-primary focus:outline-none"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="p-1 text-emerald-500">
                  <Check size={16} />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-text-tertiary">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                {session.title}
              </h3>
            )}

            {/* Meta Tags: Status | Date | Score | Cards */}
            <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                Completed
              </span>

              <span className="text-text-tertiary flex items-center gap-1 text-[11px]">
                <Clock size={11} />
                {formatRelativeTime(session.createdAt)}
              </span>

              {accuracy !== null ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                  Score {accuracy}%
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-surface-200/50 text-text-tertiary text-[11px]">
                  Score --
                </span>
              )}

              <span className="text-text-tertiary text-[11px]">
                • {session.material.flashcards.length} cards
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              'p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-200/60 transition-all',
              showMenu ? 'opacity-100 bg-surface-200/60 text-text-primary' : 'opacity-80 group-hover:opacity-100'
            )}
            aria-label="Session actions"
          >
            <MoreHorizontal size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute right-0 top-10 z-50 w-44',
                  'bg-surface-0 border border-surface-border',
                  'rounded-xl shadow-xl overflow-hidden py-1'
                )}
              >
                <button
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-100 transition-colors"
                >
                  <Edit3 size={14} /> Rename
                </button>
                <button
                  onClick={() => { onDuplicate(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-100 transition-colors"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={() => { onExport(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-100 transition-colors"
                >
                  <FileJson size={14} /> Export JSON
                </button>
                <div className="my-1 border-t border-surface-border" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
