/**
 * Flashcard Viewer
 *
 * Interactive flashcard component with 3D physical deck stack effect,
 * 500ms card flip animation, 300ms directional slide transitions,
 * search, filtering, bookmarking, and mastery tracking.
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
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
import { useToastStore } from '@/store/useToastStore';
import { staggerContainer, staggerItem } from '@/animations/variants';

const cardVariants = {
  initial: (dir: number) => ({
    x: dir > 0 ? 220 : -220,
    y: 15,
    rotateY: dir > 0 ? 42 : -42,
    rotateX: -8,
    scale: 0.82,
    opacity: 0,
  }),
  animate: {
    x: 0,
    y: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -220 : 220,
    y: -15,
    rotateY: dir > 0 ? -42 : 42,
    rotateX: 8,
    scale: 0.82,
    opacity: 0,
  }),
};

export const FlashcardViewer = memo(function FlashcardViewer() {
  const {
    flashcard,
    getFilteredCards,
    flipCard,
    nextCard: storeNextCard,
    prevCard: storePrevCard,
    toggleBookmark,
    toggleMastered,
    shuffleCards,
    setFilterDifficulty,
    setSearchQuery,
    material,
  } = useStudyStore();
  const { showToast } = useToastStore();

  const [direction, setDirection] = useState<number>(1); // 1 = Next, -1 = Prev

  const filteredCards = useMemo(() => getFilteredCards(), [
    material?.flashcards,
    flashcard.isShuffled,
    flashcard.shuffledOrder,
    flashcard.filterDifficulty,
    flashcard.searchQuery,
    getFilteredCards,
  ]);

  const handleNextCard = useCallback(() => {
    setDirection(1);
    storeNextCard();
  }, [storeNextCard]);

  const handlePrevCard = useCallback(() => {
    setDirection(-1);
    storePrevCard();
  }, [storePrevCard]);

  if (!material || filteredCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
        <p className="text-lg font-semibold text-text-primary mt-2">No flashcards available</p>
        <p className="text-sm mt-1">
          {flashcard.searchQuery || flashcard.filterDifficulty !== 'all'
            ? 'Try adjusting your search or difficulty filters'
            : 'Paste your notes to generate an interactive flashcard set!'}
        </p>
      </div>
    );
  }

  const currentIndex = flashcard.currentIndex;
  const currentCard = filteredCards[currentIndex];
  if (!currentCard) return null;

  // Deck stack cards behind current card
  const nextDeckCard = filteredCards[(currentIndex + 1) % filteredCards.length];
  const prevDeckCard = filteredCards[(currentIndex - 1 + filteredCards.length) % filteredCards.length];

  const isBookmarked = flashcard.bookmarked.has(currentCard.id);
  const isMastered = flashcard.mastered.has(currentCard.id);
  const progress = ((currentIndex + 1) / filteredCards.length) * 100;

  // Handle swipe left/right for mobile & touch devices
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) {
      handleNextCard();
    } else if (info.offset.x > 60) {
      handlePrevCard();
    }
  };

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
            {currentIndex + 1} of {filteredCards.length}
            {flashcard.mastered.size > 0 && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
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
              flashcard.isShuffled && 'text-primary-600 dark:text-primary-300 bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700'
            )}
            aria-label={flashcard.isShuffled ? 'Unshuffle cards' : 'Shuffle cards'}
            title="Shuffle deck"
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
                  ? 'bg-surface-0 shadow-sm text-text-primary font-semibold'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Animated Progress Bar */}
      <motion.div variants={staggerItem} className="mb-6">
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Physical Stacked 3D Breathy Carousel Deck Layout */}
      <motion.div variants={staggerItem} className="relative mb-8 pt-4 pb-4 overflow-visible">
        <div
          className="relative w-full max-w-4xl mx-auto flex items-center justify-center min-h-[340px] md:min-h-[380px]"
          style={{ perspective: 1200, perspectiveOrigin: '50% 50%' }}
        >
          {/* Deck Background Card 2 (Bottom vertical depth stack) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-12 max-w-2xl mx-auto h-[280px] md:h-[320px] rounded-3xl bg-surface-100/80 border border-surface-border/60 shadow-[0_20px_50px_rgba(0,0,0,0.12)] scale-[0.94] translate-y-3 pointer-events-none z-0 transition-all duration-500"
          />

          {/* Deck Background Card 3 (Deeper vertical depth stack) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-16 max-w-2xl mx-auto h-[280px] md:h-[320px] rounded-3xl bg-surface-200/50 border border-surface-border/40 shadow-[0_15px_35px_rgba(0,0,0,0.08)] scale-[0.88] translate-y-6 pointer-events-none -z-10 transition-all duration-500"
          />

          {/* Far Left Faded Card (Edge Depth) */}
          <motion.div
            aria-hidden="true"
            animate={{
              y: [-3, 5, -3],
              rotateY: [32, 24, 32],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="hidden xl:block absolute -left-36 w-36 h-[250px] rounded-2xl bg-surface-100/30 border border-surface-border/40 shadow-sm pointer-events-none opacity-20 transform scale-75"
          >
            <div className="p-4 opacity-40">
              <div className="w-12 h-2.5 bg-surface-300 rounded mb-3" />
              <div className="w-full h-2 bg-surface-300 rounded mb-1.5" />
              <div className="w-4/5 h-2 bg-surface-300 rounded" />
            </div>
          </motion.div>

          {/* Side 3D Deck Interactive Preview - Left Card (Breathy Swaying Motion) */}
          <motion.div
            onClick={handlePrevCard}
            title="Click to go to previous card"
            animate={{
              y: [-6, 6, -6],
              rotateY: [22, 14, 22],
              scale: [0.86, 0.89, 0.86],
            }}
            transition={{
              duration: 9.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 0.92, opacity: 0.9 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="hidden md:flex absolute left-0 lg:left-4 w-44 lg:w-48 h-[270px] md:h-[300px] rounded-2xl bg-surface-0/95 border border-surface-border shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.18)] cursor-pointer z-10 flex-col justify-between p-5 backdrop-blur-md transition-all duration-500"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">
                PREVIOUS
              </span>
              <p className="text-xs font-semibold text-text-secondary line-clamp-4 mt-3 leading-relaxed">
                {prevDeckCard?.question}
              </p>
            </div>
            <div className="w-full h-8 rounded-xl bg-surface-100/80 border border-surface-border flex items-center justify-center text-[10px] font-bold text-text-tertiary">
              Click to view
            </div>
          </motion.div>

          {/* Active Card Container with Hardware-Accelerated 3D Motion */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCard.id}
              custom={direction}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
              className="relative w-full max-w-lg md:max-w-xl cursor-pointer select-none z-20 mx-auto"
              onClick={flipCard}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && flipCard()}
              role="button"
              tabIndex={0}
              aria-label={flashcard.isFlipped ? 'Show question' : 'Show answer'}
            >
              {/* 3D Flip Container */}
              <motion.div
                animate={{ rotateY: flashcard.isFlipped ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                className="relative w-full min-h-[280px] md:min-h-[320px]"
              >
                {/* FRONT SIDE (Question Side) */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  className={cn(
                    'absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-surface-0 border border-surface-border shadow-xl hover:shadow-2xl transition-all duration-300',
                    isMastered && 'ring-2 ring-emerald-500/50 shadow-emerald-500/10'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-5 left-5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide',
                      getDifficultyColor(currentCard.difficulty)
                    )}
                  >
                    {currentCard.difficulty}
                  </span>

                  <span className="absolute top-5 right-5 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                    Question
                  </span>

                  <p className="text-center text-lg md:text-xl font-medium text-text-primary leading-relaxed max-w-lg">
                    {currentCard.question}
                  </p>

                  {currentCard.hint && (
                    <p className="mt-4 text-xs text-text-tertiary italic flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                      <Lightbulb size={14} className="text-amber-500 shrink-0" />
                      <span>Hint: {currentCard.hint}</span>
                    </p>
                  )}

                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="absolute bottom-5 left-5 flex gap-1.5">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] font-medium text-text-tertiary border border-surface-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="absolute bottom-5 right-5 flex items-center gap-1 text-xs text-text-tertiary opacity-50">
                    <RotateCcw size={14} />
                    <span className="text-[11px] font-medium">Flip</span>
                  </div>
                </div>

                {/* BACK SIDE (Answer Side - Deep Shadow & Upward Fade) */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className={cn(
                    'absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-surface-0 border border-primary-500/30 shadow-2xl shadow-primary-500/10 transition-all duration-300',
                    isMastered && 'ring-2 ring-emerald-500/50 shadow-emerald-500/15'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-5 left-5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide',
                      getDifficultyColor(currentCard.difficulty)
                    )}
                  >
                    {currentCard.difficulty}
                  </span>

                  <span className="absolute top-5 right-5 text-xs font-bold uppercase tracking-wider text-primary-500">
                    Answer
                  </span>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={flashcard.isFlipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="text-center text-base md:text-lg text-text-secondary leading-relaxed max-w-lg font-medium"
                  >
                    {currentCard.answer}
                  </motion.p>

                  <div className="absolute bottom-5 right-5 flex items-center gap-1 text-xs text-text-tertiary opacity-50">
                    <RotateCcw size={14} />
                    <span className="text-[11px] font-medium">Flip back</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Side 3D Deck Interactive Preview - Right Card */}
          <motion.div
            onClick={handleNextCard}
            title="Click to go to next card"
            whileHover={{ scale: 0.92, opacity: 0.95 }}
            style={{ transform: 'rotateY(-18deg) scale(0.88)', transformStyle: 'preserve-3d' }}
            className="hidden md:flex absolute right-0 lg:right-4 w-44 lg:w-48 h-[270px] md:h-[300px] rounded-2xl bg-surface-0 border border-surface-border shadow-xl hover:shadow-2xl cursor-pointer z-10 flex-col justify-between p-5 backdrop-blur-md transition-all duration-300"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">
                NEXT
              </span>
              <p className="text-xs font-semibold text-text-secondary line-clamp-4 mt-3 leading-relaxed">
                {nextDeckCard?.question}
              </p>
            </div>
            <div className="w-full h-8 rounded-xl bg-surface-100/80 border border-surface-border flex items-center justify-center text-[10px] font-bold text-text-tertiary">
              Click to view
            </div>
          </motion.div>

          {/* Far Right Faded Card (Edge Depth) */}
          <div
            aria-hidden="true"
            style={{ transform: 'rotateY(-28deg) scale(0.75)' }}
            className="hidden xl:block absolute -right-36 w-36 h-[250px] rounded-2xl bg-surface-100/30 border border-surface-border/40 shadow-sm pointer-events-none opacity-20"
          >
            <div className="p-4 opacity-40">
              <div className="w-12 h-2.5 bg-surface-300 rounded mb-3" />
              <div className="w-full h-2 bg-surface-300 rounded mb-1.5" />
              <div className="w-4/5 h-2 bg-surface-300 rounded" />
            </div>
          </div>
        </div>

        {/* Dynamic Ground Reflection Shadow */}
        <div className="w-full max-w-md mx-auto h-5 rounded-full bg-primary-500/15 blur-xl -mt-2 pointer-events-none" />

        {/* Interaction hints */}
        <p className="text-center text-xs text-text-tertiary mt-4 md:hidden">
          Tap to flip · Swipe left/right to navigate
        </p>
        <p className="text-center text-xs text-text-tertiary mt-4 hidden md:block">
          Click to flip · Use Arrow keys or Space to navigate deck
        </p>
      </motion.div>

      {/* Navigation & Action Buttons */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        {/* Previous Button */}
        <motion.button
          onClick={handlePrevCard}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'text-sm font-medium text-text-secondary',
            'border border-surface-border bg-surface-0 hover:bg-surface-50',
            'transition-colors shadow-sm'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Action Buttons (Bookmark & Mastered) */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              toggleBookmark(currentCard.id);
              showToast(
                isBookmarked ? 'Bookmark removed' : 'Flashcard bookmarked',
                'info'
              );
            }}
            className={cn(
              'p-2.5 rounded-xl transition-colors border',
              isBookmarked
                ? 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700'
                : 'text-text-tertiary border-transparent hover:text-amber-500 hover:bg-surface-50'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            animate={isBookmarked ? { scale: [1, 1.25, 1] } : {}}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark card'}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </motion.button>

          <motion.button
            onClick={() => {
              toggleMastered(currentCard.id);
              showToast(
                isMastered ? 'Marked as unmastered' : 'Card marked as mastered!',
                'success'
              );
            }}
            className={cn(
              'p-2.5 rounded-xl transition-colors border',
              isMastered
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700'
                : 'text-text-tertiary border-transparent hover:text-emerald-500 hover:bg-surface-50'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            animate={isMastered ? { scale: [1, 1.25, 1], boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 15px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)'] } : {}}
            aria-label={isMastered ? 'Unmark as mastered' : 'Mark as mastered'}
          >
            <CheckCircle2 size={20} />
          </motion.button>
        </div>

        {/* Next Button */}
        <motion.button
          onClick={handleNextCard}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl',
            'text-sm font-semibold text-white',
            'bg-primary-500 hover:bg-primary-600',
            'transition-colors shadow-md'
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
