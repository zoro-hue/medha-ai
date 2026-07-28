/**
 * Flashcard Viewer
 *
 * Interactive flashcard component with 3D flip animation,
 * navigation, bookmarking, mastery tracking, search, and filtering.
 */

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Search,
  Filter,
  Lightbulb,
} from 'lucide-react';
import { cn, getDifficultyColor } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';

export const FlashcardViewer = memo(function FlashcardViewer() {
  const {
    flashcard,
    getFilteredCards,
    flipCard,
    nextCard,
    prevCard,
    toggleBookmark,
    toggleMastered,
    shuffleCards,
    setFilterDifficulty,
    setSearchQuery,
    material,
  } = useStudyStore();

  const filteredCards = useMemo(() => getFilteredCards(), [
    material?.flashcards,
    flashcard.isShuffled,
    flashcard.shuffledOrder,
    flashcard.filterDifficulty,
    flashcard.searchQuery,
    getFilteredCards,
  ]);

  if (!material || filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
        <Lightbulb size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-medium">No flashcards to show</p>
        <p className="text-sm mt-1">
          {flashcard.searchQuery || flashcard.filterDifficulty !== 'all'
            ? 'Try adjusting your filters'
            : 'Generate study materials to get started'}
        </p>
      </div>
    );
  }

  const currentCard = filteredCards[flashcard.currentIndex];
  if (!currentCard) return null;

  const isBookmarked = flashcard.bookmarked.has(currentCard.id);
  const isMastered = flashcard.mastered.has(currentCard.id);
  const progress = ((flashcard.currentIndex + 1) / filteredCards.length) * 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Flashcards</h2>
          <p className="text-sm text-text-secondary mt-1">
            {flashcard.currentIndex + 1} of {filteredCards.length}
            {flashcard.mastered.size > 0 && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                · {flashcard.mastered.size} mastered
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={shuffleCards}
            className={cn(
              'p-2 rounded-lg text-text-secondary transition-colors',
              'hover:bg-surface-200/60 hover:text-text-primary',
              flashcard.isShuffled && 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
            )}
            aria-label={flashcard.isShuffled ? 'Unshuffle cards' : 'Shuffle cards'}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={flashcard.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flashcards..."
            className={cn(
              'w-full pl-9 pr-4 py-2.5 rounded-xl',
              'bg-surface-50 border border-surface-border',
              'text-sm text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all'
            )}
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-50 rounded-xl border border-surface-border">
          <Filter size={14} className="mx-2 text-text-tertiary" />
          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterDifficulty(level)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                flashcard.filterDifficulty === level
                  ? 'bg-surface-0 shadow-sm text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={staggerItem} className="mb-6">
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </motion.div>

      {/* Flashcard */}
      <motion.div variants={staggerItem} className="mb-8">
        <div
          className="relative w-full cursor-pointer"
          style={{ perspective: 1200 }}
          onClick={flipCard}
          onKeyDown={(e) => e.key === 'Enter' && flipCard()}
          role="button"
          tabIndex={0}
          aria-label={flashcard.isFlipped ? 'Show question' : 'Show answer'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard.id}-${flashcard.isFlipped}`}
              initial={{ rotateY: flashcard.isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flashcard.isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
              className={cn(
                'relative w-full min-h-[280px] md:min-h-[320px]',
                'flex flex-col items-center justify-center',
                'p-8 md:p-12 rounded-2xl',
                'bg-surface-0 border border-surface-border',
                'shadow-lg hover:shadow-xl transition-shadow',
                isMastered && 'ring-2 ring-emerald-500/30'
              )}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Difficulty badge */}
              <span
                className={cn(
                  'absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-semibold',
                  getDifficultyColor(currentCard.difficulty)
                )}
              >
                {currentCard.difficulty}
              </span>

              {/* Side indicator */}
              <span className="absolute top-4 right-4 text-xs font-medium text-text-tertiary">
                {flashcard.isFlipped ? 'Answer' : 'Question'}
              </span>

              {/* Content */}
              <p className={cn(
                'text-center leading-relaxed max-w-lg',
                flashcard.isFlipped
                  ? 'text-base md:text-lg text-text-secondary'
                  : 'text-lg md:text-xl font-medium text-text-primary'
              )}>
                {flashcard.isFlipped ? currentCard.answer : currentCard.question}
              </p>

              {/* Hint */}
              {!flashcard.isFlipped && currentCard.hint && (
                <p className="mt-4 text-xs text-text-tertiary italic">
                  💡 Hint: {currentCard.hint}
                </p>
              )}

              {/* Tags */}
              {currentCard.tags && currentCard.tags.length > 0 && (
                <div className="absolute bottom-4 left-4 flex gap-1.5">
                  {currentCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] font-medium text-text-tertiary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Click hint */}
              <div className="absolute bottom-4 right-4">
                <RotateCcw size={14} className="text-text-tertiary opacity-40" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tap hint for mobile */}
        <p className="text-center text-xs text-text-tertiary mt-3 md:hidden">
          Tap card to flip · Swipe to navigate
        </p>
        <p className="text-center text-xs text-text-tertiary mt-3 hidden md:block">
          Click to flip · Use arrow keys or Space to navigate
        </p>
      </motion.div>

      {/* Navigation & Action Buttons */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        {/* Previous */}
        <motion.button
          onClick={prevCard}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'text-sm font-medium text-text-secondary',
            'border border-surface-border',
            'hover:bg-surface-50 transition-colors'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => toggleBookmark(currentCard.id)}
            className={cn(
              'p-2.5 rounded-xl transition-colors',
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                : 'text-text-tertiary hover:text-amber-500 hover:bg-surface-50'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark card'}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </motion.button>

          <motion.button
            onClick={() => toggleMastered(currentCard.id)}
            className={cn(
              'p-2.5 rounded-xl transition-colors',
              isMastered
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                : 'text-text-tertiary hover:text-emerald-500 hover:bg-surface-50'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isMastered ? 'Unmark as mastered' : 'Mark as mastered'}
          >
            <CheckCircle2 size={20} />
          </motion.button>
        </div>

        {/* Next */}
        <motion.button
          onClick={nextCard}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'text-sm font-medium text-white',
            'bg-primary-500 hover:bg-primary-600',
            'transition-colors shadow-sm'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Next card"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
});
