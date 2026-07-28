/**
 * Quiz Engine
 *
 * Interactive quiz component with multiple-choice questions,
 * instant feedback, explanations, timer, progress tracking,
 * retry wrong answers, and final results.
 */

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  BookOpen,
} from 'lucide-react';
import { cn, getDifficultyColor, formatDuration } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { staggerContainer, staggerItem } from '@/animations/variants';
import type { QuizQuestion } from '@/types';

export const QuizEngine = memo(function QuizEngine() {
  const {
    material,
    quiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    retryWrongAnswers,
    resetQuiz,
    setShowExplanation,
    getQuizScore,
    getWrongAnswers,
    setViewMode,
  } = useStudyStore();

  // If quiz hasn't started yet, show the start screen
  if (!material) return null;

  if (quiz.mode === 'results') {
    return <QuizResults />;
  }

  if (!quiz.startedAt) {
    return <QuizStart onStart={startQuiz} questionCount={material.quiz.length} />;
  }

  const questions = quiz.mode === 'retrying'
    ? material.quiz.filter((q) => getWrongAnswers().some((a) => a.questionId === q.id))
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
      startedAt={quiz.startedAt}
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
      <motion.div
        variants={staggerItem}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
          <Target size={32} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to Test Your Knowledge?</h2>
        <p className="text-text-secondary mb-8">
          {questionCount} multiple-choice questions based on your study material.
          Answer carefully — you can retry wrong answers later.
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
  question: QuizQuestion;
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
  const isAnswered = answers.some((a) => a.questionId === question.id);

  // Timer
  useEffect(() => {
    if (isAnswered) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isAnswered]);

  // Reset selected option on new question
  useEffect(() => {
    setSelectedOption(null);
  }, [question.id]);

  const handleSelect = useCallback(
    (option: string) => {
      if (isAnswered) return;
      setSelectedOption(option);
      onAnswer({
        questionId: question.id,
        selectedAnswer: option,
        isCorrect: option === question.correctAnswer,
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
      className="max-w-3xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Quiz</h2>
          <p className="text-sm text-text-secondary mt-1">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Clock size={16} />
          {formatDuration(elapsed)}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={staggerItem} className="mb-8">
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          />
        </div>
      </motion.div>

      {/* Question */}
      <motion.div variants={staggerItem} className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <span
            className={cn(
              'inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0',
              getDifficultyColor(question.difficulty)
            )}
          >
            {question.difficulty}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-relaxed">
          {question.question}
        </h3>
      </motion.div>

      {/* Options */}
      <motion.div variants={staggerContainer} className="space-y-3 mb-8">
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
                'w-full flex items-center gap-4 p-4 rounded-xl',
                'text-left text-sm font-medium',
                'border-2 transition-all duration-200',
                !showResult && [
                  'border-surface-border bg-surface-0',
                  'hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-900/10',
                  isSelected && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
                ],
                showResult && isCorrect && 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
                showResult && isSelected && !isCorrect && 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
                showResult && !isSelected && !isCorrect && 'border-surface-border opacity-50',
              )}
              whileHover={!isAnswered ? { scale: 1.01 } : undefined}
              whileTap={!isAnswered ? { scale: 0.99 } : undefined}
            >
              {/* Letter Badge */}
              <span
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  !showResult && 'bg-surface-100 text-text-secondary',
                  showResult && isCorrect && 'bg-emerald-500 text-white',
                  showResult && isSelected && !isCorrect && 'bg-rose-500 text-white',
                )}
              >
                {showResult && isCorrect ? (
                  <CheckCircle2 size={16} />
                ) : showResult && isSelected && !isCorrect ? (
                  <XCircle size={16} />
                ) : (
                  letter
                )}
              </span>

              <span className="flex-1 text-text-primary">{option}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Explanation */}
      <AnimatePresence>
        {isAnswered && showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">Explanation</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{question.explanation}</p>
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
              'flex items-center gap-2 px-5 py-2.5 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-primary-500 hover:bg-primary-600',
              'transition-colors shadow-sm'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {questionIndex === totalQuestions - 1 ? 'See Results' : 'Next Question'}
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
    if (score.percentage >= 90) return { label: 'Excellent!', emoji: '🏆', color: 'text-emerald-500' };
    if (score.percentage >= 70) return { label: 'Great Job!', emoji: '🎯', color: 'text-primary-500' };
    if (score.percentage >= 50) return { label: 'Good Effort!', emoji: '💪', color: 'text-amber-500' };
    return { label: 'Keep Practicing!', emoji: '📚', color: 'text-rose-500' };
  }, [score.percentage]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-lg mx-auto px-4 md:px-0 py-8"
    >
      {/* Score Circle */}
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="text-5xl mb-3">{grade.emoji}</div>
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

      {/* Action Buttons */}
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
            Retry {wrongAnswers.length} Wrong Answer{wrongAnswers.length > 1 ? 's' : ''}
          </motion.button>
        )}

        <button
          onClick={resetQuiz}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-medium text-text-secondary border border-surface-border hover:bg-surface-50 transition-colors"
        >
          <Trophy size={18} />
          Retake Full Quiz
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
