import { memo, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  PenLine,
  Layers,
  Brain,
  FileText,
  History,
  BarChart3,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { ViewMode } from '@/types';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  requiresMaterial: boolean;
  shortcut: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={20} />, requiresMaterial: false, shortcut: 'Alt+1' },
  { id: 'input', label: 'Create Set', icon: <PenLine size={20} />, requiresMaterial: false, shortcut: 'Alt+2' },
  { id: 'flashcards', label: 'Flashcards', icon: <Layers size={20} />, requiresMaterial: true, shortcut: 'Alt+3' },
  { id: 'quiz', label: 'Quiz', icon: <Brain size={20} />, requiresMaterial: true, shortcut: 'Alt+4' },
  { id: 'summary', label: 'Summary', icon: <FileText size={20} />, requiresMaterial: true, shortcut: 'Alt+5' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, requiresMaterial: false, shortcut: 'Alt+6' },
  { id: 'history', label: 'History', icon: <History size={20} />, requiresMaterial: false, shortcut: 'Alt+7' },
];

interface SidebarProps {
  onOpenSearch?: () => void;
}

export const Sidebar = memo(function Sidebar({ onOpenSearch }: SidebarProps) {
  const { viewMode, setViewMode, material } = useStudyStore();
  const { sessions, loadSessions } = useSessionStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Editable Student Name state
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('medha_user_name') || 'Student';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSaveName = () => {
    const trimmed = tempName.trim() || 'Student';
    setUserName(trimmed);
    localStorage.setItem('medha_user_name', trimmed);
    setIsEditingName(false);
  };

  const initialLetter = userName.charAt(0).toUpperCase() || 'S';

  const streak = useMemo(() => {
    const today = new Date().toDateString();
    const sessionDays = new Set(sessions.map((s) => new Date(s.createdAt).toDateString()));
    let count = sessionDays.has(today) ? 1 : 0;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    while (sessionDays.has(date.toDateString())) {
      count++;
      date.setDate(date.getDate() - 1);
    }
    return count;
  }, [sessions]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'relative hidden md:flex flex-col bg-surface-50 dark:bg-surface-50 border-r border-surface-border py-4 h-screen sticky top-0 transition-all duration-300 z-40',
          isCollapsed ? 'w-20 px-2' : 'w-64 px-3'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Floating border collapse/expand toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-surface-0 border border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-100 flex items-center justify-center shadow-md transition-all z-50 hover:scale-110 cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={cn('mb-5 flex items-center px-2', isCollapsed && 'justify-center px-0')}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-bold text-text-primary tracking-tight truncate">
                Medhā
              </span>
            )}
          </div>
        </div>

        {/* Global Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className={cn(
              'flex items-center gap-2.5 mb-4 p-2.5 rounded-xl border border-surface-border bg-surface-0 hover:bg-surface-100 transition-all text-left text-xs font-medium text-text-tertiary',
              isCollapsed && 'justify-center'
            )}
          >
            <Search size={16} className="text-text-secondary shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">Search...</span>
                <span className="px-1.5 py-0.5 rounded bg-surface-200 text-[10px] font-mono">⌘K</span>
              </>
            )}
          </button>
        )}

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            const isDisabled = item.requiresMaterial && !material;

            return (
              <motion.button
                key={item.id}
                onClick={() => !isDisabled && setViewMode(item.id)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-text-secondary hover:text-text-primary',
                  isDisabled && 'opacity-35 cursor-not-allowed',
                  !isDisabled && !isActive && 'hover:bg-surface-200/60',
                  isCollapsed && 'justify-center'
                )}
                whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                disabled={isDisabled}
                aria-label={`${item.label} (${item.shortcut})`}
                title={`${item.label} — ${item.shortcut}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-900/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}

                <span className="relative z-10 flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="relative z-10">{item.label}</span>}
                {!isCollapsed && (
                  <span className="relative z-10 ml-auto text-[10px] font-mono text-text-tertiary">
                    {item.shortcut.replace('Alt+', '⌥')}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile Banner at Bottom */}
        <div
          className={cn(
            'mt-auto p-2.5 rounded-2xl bg-surface-0 border border-surface-border flex items-center gap-2.5 transition-all shadow-sm',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 font-bold flex items-center justify-center text-xs border border-primary-500/20 shrink-0">
            {initialLetter}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="w-full text-xs font-bold bg-surface-100 border border-primary-400 rounded px-1.5 py-0.5 text-text-primary focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-emerald-500 hover:text-emerald-600 shrink-0"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                  className="group flex items-center justify-between cursor-pointer"
                  title="Click to edit name"
                >
                  <p className="text-xs font-bold text-text-primary truncate group-hover:text-primary-500 transition-colors">
                    {userName}
                  </p>
                  <Edit2 size={12} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold mt-0.5">
                <Zap size={12} /> {streak} Day Streak
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-0/90 backdrop-blur-xl border-t border-surface-border flex items-center justify-around px-2 py-2 safe-area-inset-bottom"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const isActive = viewMode === item.id;
          const isDisabled = item.requiresMaterial && !material;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setViewMode(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-medium transition-colors',
                isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-text-tertiary',
                isDisabled && 'opacity-30 cursor-not-allowed'
              )}
              disabled={isDisabled}
              aria-label={item.label}
            >
              {item.icon}
              <span className="truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
});
