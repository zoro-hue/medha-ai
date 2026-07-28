import { memo } from 'react';

export const EmptyStateIllustration = memo(function EmptyStateIllustration({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="120" r="100" className="fill-primary-500/5 dark:fill-primary-500/10" />
      <rect x="60" y="70" width="120" height="100" rx="16" className="fill-surface-0 stroke-surface-border" strokeWidth="2" />
      <path d="M85 105H155" stroke="currentColor" className="text-surface-300 dark:text-surface-700" strokeWidth="3" strokeLinecap="round" />
      <path d="M85 125H135" stroke="currentColor" className="text-surface-300 dark:text-surface-700" strokeWidth="3" strokeLinecap="round" />
      <circle cx="170" cy="70" r="16" className="fill-primary-500 text-white" />
      <path d="M165 70L169 74L176 66" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const QuizCompleteIllustration = memo(function QuizCompleteIllustration({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="120" r="90" className="fill-emerald-500/10" />
      <path d="M120 50L135 85L170 88L143 112L151 147L120 128L89 147L97 112L70 88L105 85L120 50Z" className="fill-amber-400 stroke-amber-500" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="120" cy="190" r="6" className="fill-emerald-500" />
      <circle cx="60" cy="120" r="4" className="fill-primary-500" />
      <circle cx="180" cy="120" r="4" className="fill-purple-500" />
    </svg>
  );
});

export const SearchEmptyIllustration = memo(function SearchEmptyIllustration({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="110" r="60" className="stroke-surface-300 dark:stroke-surface-700 fill-surface-50 dark:fill-surface-900" strokeWidth="4" />
      <path d="M155 155L195 195" stroke="currentColor" className="text-primary-500" strokeWidth="6" strokeLinecap="round" />
      <path d="M90 100H130" stroke="currentColor" className="text-surface-300 dark:text-surface-700" strokeWidth="3" strokeLinecap="round" />
      <path d="M95 120H125" stroke="currentColor" className="text-surface-300 dark:text-surface-700" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
});
