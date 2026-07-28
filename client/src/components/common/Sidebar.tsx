/**
 * Sidebar Navigation
 *
 * Main application navigation with view mode switching.
 * Adapts to mobile with a bottom navigation bar.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  PenLine,
  Layers,
  Brain,
  FileText,
  History,
  BarChart3,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { useThemeStore } from '@/store/useThemeStore';
import type { ViewMode } from '@/types';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  requiresMaterial: boolean;
  shortcut: string;
}

const navItems: NavItem[] = [
  { id: 'input', label: 'Create', icon: <PenLine size={20} />, requiresMaterial: false, shortcut: 'Alt+1' },
  { id: 'flashcards', label: 'Flashcards', icon: <Layers size={20} />, requiresMaterial: true, shortcut: 'Alt+2' },
  { id: 'quiz', label: 'Quiz', icon: <Brain size={20} />, requiresMaterial: true, shortcut: 'Alt+3' },
  { id: 'summary', label: 'Summary', icon: <FileText size={20} />, requiresMaterial: true, shortcut: 'Alt+4' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, requiresMaterial: false, shortcut: 'Alt+5' },
  { id: 'history', label: 'History', icon: <History size={20} />, requiresMaterial: false, shortcut: 'Alt+6' },
];

export const Sidebar = memo(function Sidebar() {
  const { viewMode, setViewMode, material } = useStudyStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col w-[72px] lg:w-56',
          'bg-surface-50 dark:bg-surface-50 border-r border-surface-border',
          'py-4 px-2 lg:px-3 h-screen sticky top-0',
          'transition-colors duration-300'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 lg:px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="hidden lg:block text-base font-semibold text-text-primary tracking-tight">
            StudyForge
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            const isDisabled = item.requiresMaterial && !material;

            return (
              <motion.button
                key={item.id}
                onClick={() => !isDisabled && setViewMode(item.id)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-text-secondary hover:text-text-primary',
                  isDisabled && 'opacity-40 cursor-not-allowed',
                  !isDisabled && !isActive && 'hover:bg-surface-200/60 dark:hover:bg-surface-200/60'
                )}
                whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                disabled={isDisabled}
                aria-label={`${item.label} (${item.shortcut})`}
                title={`${item.label} — ${item.shortcut}`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-900/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}

                <span className="relative z-10 flex-shrink-0">{item.icon}</span>
                <span className="relative z-10 hidden lg:block">{item.label}</span>
                <span className="relative z-10 hidden lg:block ml-auto text-xs text-text-tertiary">
                  {item.shortcut.replace('Alt+', '⌥')}
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-sm font-medium text-text-secondary',
            'hover:bg-surface-200/60 dark:hover:bg-surface-200/60',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          title="Toggle theme — Ctrl+Shift+D"
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden lg:block">
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          'bg-surface-0/80 dark:bg-surface-0/80 backdrop-blur-xl',
          'border-t border-surface-border',
          'flex items-center justify-around px-2 py-2',
          'safe-area-inset-bottom'
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = viewMode === item.id;
          const isDisabled = item.requiresMaterial && !material;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setViewMode(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl',
                'text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-text-tertiary',
                isDisabled && 'opacity-30 cursor-not-allowed'
              )}
              disabled={isDisabled}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
});
