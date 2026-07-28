/**
 * Smart Notes Input
 *
 * Rich text input with character/word counting, token estimation,
 * drag & drop support, auto-resize, and generation controls.
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  X,
  Zap,
  Hash,
  Type,
  ChevronDown,
} from 'lucide-react';
import { cn, countWords, estimateTokens } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { useGenerate } from '@/hooks/useGenerate';
import { staggerContainer, staggerItem } from '@/animations/variants';

const MAX_CHARS = 15000;
const MIN_CHARS = 10;

export const SmartNotesInput = memo(function SmartNotesInput() {
  const { inputContent, setInputContent, isGenerating, error, setError } = useStudyStore();
  const { generate, cancel } = useGenerate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [showOptions, setShowOptions] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [quizCount, setQuizCount] = useState(5);

  const charCount = inputContent.length;
  const wordCount = countWords(inputContent);
  const tokenEstimate = estimateTokens(inputContent);
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const charPercentage = Math.min((charCount / MAX_CHARS) * 100, 100);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [inputContent]);

  // Handle file drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        setInputContent(text.slice(0, MAX_CHARS));
      } else {
        setError('Please drop a .txt or .md file');
      }
    },
    [setInputContent, setError]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      setInputContent(text.slice(0, MAX_CHARS));
      e.target.value = '';
    },
    [setInputContent]
  );

  const handleGenerate = () => {
    if (!isValid || isGenerating) return;
    generate({
      content: inputContent,
      options: { difficulty, flashcardCount, quizCount },
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-3">
          Create Study Set
        </h1>
        <p className="text-base text-text-secondary leading-relaxed max-w-xl">
          Paste your notes, a paragraph, or any study material. The AI will generate
          interactive flashcards, quizzes, and summaries.
        </p>
      </motion.div>

      {/* Text Input Area */}
      <motion.div
        variants={staggerItem}
        className={cn(
          'relative rounded-2xl border-2 transition-all duration-300',
          isDragOver
            ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/20 shadow-glow'
            : 'border-surface-border bg-surface-0 hover:border-surface-300',
          isGenerating && 'opacity-60 pointer-events-none'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-primary-50/80 dark:bg-primary-900/40 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2 text-primary-600 dark:text-primary-400">
                <Upload size={32} />
                <span className="text-sm font-medium">Drop your file here</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste your study notes, lecture content, textbook chapter, or describe a topic you want to learn..."
          className={cn(
            'w-full min-h-[200px] max-h-[500px] p-5 pb-3',
            'bg-transparent resize-none',
            'text-text-primary placeholder:text-text-tertiary',
            'text-[15px] leading-relaxed',
            'focus:outline-none',
            'rounded-2xl'
          )}
          disabled={isGenerating}
          aria-label="Study notes input"
          id="notes-input"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-border/50">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Type size={13} />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5">
              <Hash size={13} />
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5" title="Estimated tokens for AI processing">
              <Zap size={13} />
              ~{tokenEstimate} tokens
            </span>
          </div>

          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'text-xs font-medium text-text-secondary',
              'hover:bg-surface-200/60 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
            aria-label="Upload text file"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Character progress bar */}
        <div className="h-0.5 bg-surface-100 rounded-b-2xl overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              charPercentage > 90 ? 'bg-rose-500' : charPercentage > 70 ? 'bg-amber-500' : 'bg-primary-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${charPercentage}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </motion.div>

      {/* Generation Options */}
      <motion.div variants={staggerItem} className="mt-4">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronDown
            size={16}
            className={cn('transition-transform', showOptions && 'rotate-180')}
          />
          Generation Options
        </button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 p-4 rounded-xl bg-surface-50 border border-surface-border">
                {/* Difficulty */}
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Flashcard Count */}
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                    Flashcards ({flashcardCount})
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    value={flashcardCount}
                    onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>

                {/* Quiz Count */}
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                    Quiz Questions ({quizCount})
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    value={quizCount}
                    onChange={(e) => setQuizCount(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50"
            role="alert"
          >
            <AlertCircle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <motion.div variants={staggerItem} className="mt-6 flex items-center gap-3">
        <motion.button
          onClick={handleGenerate}
          disabled={!isValid || isGenerating}
          className={cn(
            'relative flex items-center gap-2.5 px-6 py-3 rounded-xl',
            'text-sm font-semibold text-white',
            'bg-primary-500 hover:bg-primary-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'shadow-md hover:shadow-lg'
          )}
          whileHover={isValid && !isGenerating ? { scale: 1.02 } : undefined}
          whileTap={isValid && !isGenerating ? { scale: 0.98 } : undefined}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Study Set
            </>
          )}
        </motion.button>

        {isGenerating && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={cancel}
            className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary border border-surface-border hover:bg-surface-100 transition-colors"
          >
            Cancel
          </motion.button>
        )}

        {!isValid && charCount > 0 && charCount < MIN_CHARS && (
          <p className="text-xs text-text-tertiary">
            At least {MIN_CHARS} characters required
          </p>
        )}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8"
          >
            <div className="flex flex-col items-center gap-4 py-12">
              {/* Animated dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary-500"
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">
                  Analyzing your content
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Generating flashcards, quiz questions, and study materials...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
