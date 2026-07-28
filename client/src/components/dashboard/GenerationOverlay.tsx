import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Brain, Layers, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Analyzing Notes', description: 'Parsing keywords and formatting text structure', icon: <FileText size={18} /> },
  { id: 2, title: 'Extracting Concepts', description: 'Identifying key principles and difficult concepts', icon: <Brain size={18} /> },
  { id: 3, title: 'Generating Flashcards', description: 'Writing question-and-answer pairs with hints', icon: <Layers size={18} /> },
  { id: 4, title: 'Building Interactive Quiz', description: 'Formulating multiple-choice items and explanations', icon: <Sparkles size={18} /> },
  { id: 5, title: 'Finishing', description: 'Validating JSON payload and organizing layout', icon: <Check size={18} /> },
];

interface GenerationOverlayProps {
  isGenerating: boolean;
  onCancel?: () => void;
}

export const GenerationOverlay = memo(function GenerationOverlay({ isGenerating, onCancel }: GenerationOverlayProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="w-full max-w-lg bg-surface-0 border border-surface-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold animate-pulse">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Forging Study Set</h3>
              <p className="text-xs text-text-tertiary">AI model is generating structured learning materials</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-tertiary font-medium">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Step List */}
          <div className="space-y-3">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200',
                    isCurrent && 'bg-primary-100 dark:bg-primary-950 border-primary-300 dark:border-primary-700 shadow-sm',
                    isCompleted && 'bg-surface-50 border-surface-border opacity-80',
                    step.id > currentStep && 'border-transparent opacity-40'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold',
                      isCompleted && 'bg-emerald-500 text-white',
                      isCurrent && 'bg-primary-500 text-white',
                      step.id > currentStep && 'bg-surface-100 text-text-tertiary'
                    )}
                  >
                    {isCompleted ? <Check size={14} /> : isCurrent ? <Loader2 size={14} className="animate-spin" /> : step.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-text-primary')}>
                      {step.title}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <div className="pt-2 text-center">
              <button
                onClick={onCancel}
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                Cancel Generation
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
