import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Clock,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  BookOpen,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn, getDifficultyColor, formatDuration } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';
import type { QuizQuestion as QuizQuestionType } from '@/types';

export const QuizEngine = memo(function QuizEngine() {
  const {
    material,
    quiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    setShowExplanation,
  } = useStudyStore();

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
        <p className="text-lg font-semibold text-text-primary mt-2">No Quiz Available</p>
        <p className="text-sm mt-1">Paste study notes to generate custom quizzes!</p>
      </div>
    );
  }

  if (quiz.mode === 'results') {
    return <QuizResults />;
  }

  if (!quiz.startedAt) {
    return <QuizStart onStart={startQuiz} questionCount={material.quiz.length} />;
  }

  const questions = quiz.mode === 'retrying' && quiz.retryQuestionIds && quiz.retryQuestionIds.length > 0
    ? material.quiz.filter((q) => quiz.retryQuestionIds?.includes(q.id))
    : material.quiz;

  const currentQuestion = questions[quiz.currentIndex];
  if (!currentQuestion) return null;

  return (
    <QuizQuestion
      question={currentQuestion}
      questionIndex={quiz.currentIndex}
      totalQuestions={questions.length}
      onAnswer={answerQuestion}
      onNext={nextQuestion}
      showExplanation={quiz.showExplanation}
      setShowExplanation={setShowExplanation}
      startedAt={quiz.startedAt || Date.now()}
      answers={quiz.answers}
    />
  );
});

// ─── Quiz Start Screen ─────────────────────────────────────────────────────────

function QuizStart({ onStart, questionCount }: { onStart: () => void; questionCount: number }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-lg mx-auto px-4 md:px-0 py-12"
    >
      <motion.div variants={staggerItem} className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Target size={32} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Interactive Knowledge Assessment</h2>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          {questionCount} multiple-choice items tailored to your material. Instant feedback with detailed explanations.
        </p>

        <motion.button
          onClick={onStart}
          className={cn(
            'inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl',
            'text-sm font-semibold text-white',
            'bg-primary-500 hover:bg-primary-600',
            'shadow-md hover:shadow-lg',
            'transition-all duration-200'
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Zap size={18} />
          Start Quiz
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Individual Question ────────────────────────────────────────────────────────

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: { questionId: string; selectedAnswer: string; isCorrect: boolean; timeSpentMs: number }) => void;
  onNext: () => void;
  showExplanation: boolean;
  setShowExplanation: (show: boolean) => void;
  startedAt: number;
  answers: { questionId: string }[];
}

function QuizQuestion({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  showExplanation,
  setShowExplanation,
  startedAt,
  answers,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questionStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const isAnswered = answers.some((a) => a.questionId === question.id);

  // Timer
  useEffect(() => {
    if (isAnswered) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isAnswered]);

  // Reset state on new question
  useEffect(() => {
    setSelectedOption(null);
    setIsShaking(false);
  }, [question.id]);

  const handleSelect = useCallback(
    (option: string) => {
      if (isAnswered) return;
      setSelectedOption(option);
      const isCorrect = option === question.correctAnswer;

      if (isCorrect) {
        // Trigger tiny confetti burst
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b'],
        });
      } else {
        // Trigger container shake & subtle vibration
        setIsShaking(true);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(100);
        }
      }

      onAnswer({
        questionId: question.id,
        selectedAnswer: option,
        isCorrect,
        timeSpentMs: Date.now() - questionStartTime,
      });
    },
    [isAnswered, onAnswer, question, questionStartTime]
  );

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Quiz Assessment</h2>
          <p className="text-sm text-text-secondary mt-1">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary font-mono bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-border">
          <Clock size={16} />
          {formatDuration(elapsed)}
        </div>
      </motion.div>

      {/* Animated Progress Bar */}
      <motion.div variants={staggerItem} className="mb-8">
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          />
        </div>
      </motion.div>

      {/* Main Question Box (Shakes on Incorrect) */}
      <motion.div
        variants={staggerItem}
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-6 rounded-2xl bg-surface-50 border border-surface-border"
      >
        <div className="flex items-start gap-3 mb-3">
          <span
            className={cn(
              'inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0',
              getDifficultyColor(question.difficulty)
            )}
          >
            {question.difficulty}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-text-primary leading-relaxed whitespace-normal break-words">
          {question.question}
        </h3>
      </motion.div>

      {/* Options */}
      <motion.div variants={staggerContainer} className="space-y-3.5 mb-8">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          const showResult = isAnswered;

          return (
            <motion.button
              key={option}
              variants={staggerItem}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={cn(
                'w-full flex items-start gap-3.5 p-4 rounded-2xl text-left text-sm font-medium border-2 transition-all duration-200 min-h-[56px] overflow-visible',
                !showResult && [
                  'border-surface-border bg-surface-0 text-text-primary',
                  'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/40',
                  isSelected && 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-950 dark:text-primary-100',
                ],
                showResult && isCorrect && [
                  'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
                  'shadow-sm',
                ],
                showResult && isSelected && !isCorrect && [
                  'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950 dark:text-rose-100',
                  'shadow-sm',
                ],
                showResult && !isSelected && !isCorrect && 'border-surface-border opacity-50 bg-surface-0 text-text-secondary'
              )}
              whileHover={!isAnswered ? { scale: 1.005 } : undefined}
              whileTap={!isAnswered ? { scale: 0.995 } : undefined}
            >
              {/* Option Letter Badge */}
              <span
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-transform duration-200',
                  !showResult && 'bg-surface-100 text-text-secondary border border-surface-border',
                  showResult && isCorrect && 'bg-emerald-600 text-white shadow-sm',
                  showResult && isSelected && !isCorrect && 'bg-rose-600 text-white shadow-sm',
                )}
              >
                {showResult && isCorrect ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                    <Check size={15} />
                  </motion.div>
                ) : showResult && isSelected && !isCorrect ? (
                  <XCircle size={15} />
                ) : (
                  letter
                )}
              </span>

              {/* Full Option Text — Inherits exact contrast color */}
              <span className="flex-1 font-medium whitespace-normal break-words leading-relaxed text-inherit text-sm pt-0.5">
                {option}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Explanation (Slides Upward) */}
      <AnimatePresence>
        {isAnswered && showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="p-5 rounded-2xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-primary-950 dark:text-primary-100 leading-relaxed font-medium">{question.explanation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>

          <motion.button
            onClick={onNext}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-primary-500 hover:bg-primary-600',
              'transition-colors shadow-md'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {questionIndex === totalQuestions - 1 ? 'See Assessment Results' : 'Next Question'}
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Quiz Results ────────────────────────────────────────────────────────────────

function QuizResults() {
  const { getQuizScore, getWrongAnswers, retryWrongAnswers, resetQuiz, setViewMode } = useStudyStore();
  const score = getQuizScore();
  const wrongAnswers = getWrongAnswers();

  const grade = useMemo(() => {
    if (score.percentage >= 90) return { label: 'Mastery Achieved!', icon: <Trophy size={48} className="text-amber-400 mx-auto" />, color: 'text-emerald-500' };
    if (score.percentage >= 70) return { label: 'Great Performance!', icon: <Target size={48} className="text-primary-500 mx-auto" />, color: 'text-primary-500' };
    if (score.percentage >= 50) return { label: 'Solid Effort!', icon: <Sparkles size={48} className="text-amber-500 mx-auto" />, color: 'text-amber-500' };
    return { label: 'Practice Recommended', icon: <BookOpen size={48} className="text-rose-500 mx-auto" />, color: 'text-rose-500' };
  }, [score.percentage]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-lg mx-auto px-4 md:px-0 py-8"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="mb-4">{grade.icon}</div>
        <h2 className={cn('text-2xl font-bold mb-2', grade.color)}>{grade.label}</h2>

        <div className="relative w-40 h-40 mx-auto my-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-surface-100"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={grade.color}
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 42 * (1 - score.percentage / 100),
              }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{score.percentage}%</span>
            <span className="text-xs text-text-tertiary">
              {score.correct}/{score.total} correct
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        {wrongAnswers.length > 0 && (
          <motion.button
            onClick={retryWrongAnswers}
            className={cn(
              'flex items-center justify-center gap-2.5 w-full px-6 py-3 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-primary-500 hover:bg-primary-600',
              'transition-colors shadow-md'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={18} />
            Retry {wrongAnswers.length} Incorrect Item{wrongAnswers.length > 1 ? 's' : ''}
          </motion.button>
        )}

        <button
          onClick={resetQuiz}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-medium text-text-secondary border border-surface-border hover:bg-surface-50 transition-colors"
        >
          Retake Full Assessment
        </button>

        <button
          onClick={() => setViewMode('flashcards')}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Review Flashcards
        </button>
      </motion.div>
    </motion.div>
  );
}
