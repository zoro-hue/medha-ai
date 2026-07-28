import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Layers,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  PlusCircle,
  History as HistoryIcon,
  BookOpen,
} from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { useSessionStore } from '@/store/useSessionStore';
import { formatRelativeTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

export const HomeDashboard = memo(function HomeDashboard() {
  const { setViewMode } = useStudyStore();
  const { sessions, restoreSession } = useSessionStore();

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Calculate streak & stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const sessionDays = new Set(sessions.map((s) => new Date(s.createdAt).toDateString()));
    let streak = sessionDays.has(today) ? 1 : 0;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    while (sessionDays.has(date.toDateString())) {
      streak++;
      date.setDate(date.getDate() - 1);
    }

    const totalCards = sessions.reduce((sum, s) => sum + s.material.flashcards.length, 0);

    return { streak, totalCards, totalSessions: sessions.length };
  }, [sessions]);

  const recentSessions = useMemo(() => sessions.slice(0, 3), [sessions]);
  const lastSession = recentSessions[0];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 md:px-0 space-y-10"
    >
      {/* Hero Header — Minimal Linear/Vercel Style */}
      <motion.div variants={staggerItem} className="relative space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-500 tracking-wide uppercase">
            <Sparkles size={14} /> Medhā AI Workspace
          </div>
          <span className="text-xs text-text-tertiary font-mono">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
              {greeting} 👋
            </h1>
            <p className="text-sm text-text-secondary mt-1 max-w-lg">
              Ready to master another topic today? Continue where you left off.
            </p>
          </div>

          <motion.button
            onClick={() => setViewMode('input')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-sm transition-all shrink-0 self-start sm:self-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircle size={16} />
            Create Study Set
          </motion.button>
        </div>
      </motion.div>

      {/* Subtle Separator */}
      <div className="h-px bg-surface-border/60" />

      {/* Minimal Metric Strip (Borderless, Raycast/Linear design) */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Zap size={14} className="text-rose-500" />
            <span>Streak</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{stats.streak} Days</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Layers size={14} className="text-primary-500" />
            <span>Cards Built</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{stats.totalCards}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Target size={14} className="text-emerald-500" />
            <span>Daily Goal</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{stats.totalSessions > 0 ? '100%' : '0%'}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <TrendingUp size={14} className="text-amber-500" />
            <span>Total Sets</span>
          </div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{stats.totalSessions}</p>
        </div>
      </motion.div>

      {/* Subtle Separator */}
      <div className="h-px bg-surface-border/60" />

      {/* Compact Horizontal "Continue Learning" Section */}
      {lastSession && (
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-tertiary font-medium">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Clock size={13} /> Continue Learning
            </span>
            <span>{formatRelativeTime(lastSession.createdAt)}</span>
          </div>

          <div
            onClick={() => {
              restoreSession(lastSession.id);
              setViewMode('flashcards');
            }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50/70 hover:bg-surface-100/80 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 border border-primary-300/60 dark:border-primary-700/60 shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary-500 transition-colors">
                  {lastSession.title}
                </h3>
                <p className="text-xs text-text-tertiary truncate">
                  {lastSession.material.flashcards.length} cards · {lastSession.material.quiz.length} quiz items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-primary-500 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
              Resume <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Compact Quick Action Pills / Buttons */}
      <motion.div variants={staggerItem} className="space-y-3">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider text-[11px]">
          Quick Navigation
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('input')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-100 text-xs font-medium text-text-primary transition-colors"
          >
            <PlusCircle size={15} className="text-primary-500" />
            Paste Notes
          </button>

          <button
            onClick={() => setViewMode('history')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-100 text-xs font-medium text-text-primary transition-colors"
          >
            <HistoryIcon size={15} className="text-emerald-500" />
            Study History
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-100 text-xs font-medium text-text-primary transition-colors"
          >
            <TrendingUp size={15} className="text-purple-500" />
            Analytics
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
