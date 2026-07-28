/**
 * Analytics Dashboard
 *
 * Displays study statistics with visual charts.
 * Data is derived from the current session and historical sessions.
 */

import { memo, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  Target,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn, formatDuration } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { useSessionStore } from '@/store/useSessionStore';
import { staggerContainer, staggerItem } from '@/animations/variants';

export const AnalyticsDashboard = memo(function AnalyticsDashboard() {
  const { material, flashcard, getQuizScore } = useStudyStore();
  const { sessions, loadSessions } = useSessionStore();
  const quizScore = getQuizScore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const stats = useMemo(() => {
    const totalCards = material?.flashcards.length || 0;
    const masteredCount = flashcard.mastered.size;
    const completionPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

    // Calculate total time from sessions
    const totalTimeMs = sessions.reduce((sum, s) => sum + (s.timeSpentMs || 0), 0);

    // Learning streak (consecutive days with sessions)
    const today = new Date().toDateString();
    const sessionDays = new Set(sessions.map((s) => new Date(s.createdAt).toDateString()));
    let streak = sessionDays.has(today) ? 1 : 0;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    while (sessionDays.has(date.toDateString())) {
      streak++;
      date.setDate(date.getDate() - 1);
    }

    return {
      totalCards,
      masteredCount,
      completionPct,
      quizAccuracy: quizScore.percentage,
      totalSessions: sessions.length,
      streak,
      totalTimeMs,
    };
  }, [material, flashcard.mastered, quizScore, sessions]);

  // Radar chart data — topic difficulty distribution
  const radarData = useMemo(() => {
    if (!material) return [];
    const difficultyMap: Record<string, { easy: number; medium: number; hard: number }> = {};

    material.flashcards.forEach((card) => {
      const tag = card.tags?.[0] || 'General';
      if (!difficultyMap[tag]) difficultyMap[tag] = { easy: 0, medium: 0, hard: 0 };
      difficultyMap[tag][card.difficulty]++;
    });

    return Object.entries(difficultyMap).slice(0, 6).map(([topic, counts]) => ({
      topic,
      difficulty: counts.hard * 3 + counts.medium * 2 + counts.easy,
      fullMark: 10,
    }));
  }, [material]);

  // Session history chart data
  const historyData = useMemo(() => {
    return sessions
      .slice(0, 7)
      .reverse()
      .map((s) => ({
        date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cards: s.material.flashcards.length,
        accuracy: s.quizResults.length > 0
          ? Math.round(
              (s.quizResults.filter((r) => r.isCorrect).length / s.quizResults.length) * 100
            )
          : 0,
      }));
  }, [sessions]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Analytics</h2>
        <p className="text-sm text-text-secondary mt-1">
          Your learning progress and performance metrics
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard
          icon={<Layers size={18} />}
          label="Total Cards"
          value={stats.totalCards}
          color="text-primary-500"
          bgColor="bg-primary-50 dark:bg-primary-900/30"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Mastered"
          value={stats.masteredCount}
          color="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-900/30"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Quiz Accuracy"
          value={`${stats.quizAccuracy}%`}
          color="text-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Completion"
          value={`${stats.completionPct}%`}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard
          icon={<Award size={18} />}
          label="Streak"
          value={`${stats.streak}d`}
          color="text-rose-500"
          bgColor="bg-rose-50 dark:bg-rose-900/30"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Time"
          value={formatDuration(stats.totalTimeMs)}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/30"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        {radarData.length > 2 && (
          <motion.div
            variants={staggerItem}
            className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Topic Difficulty</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-surface-200)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }} />
                <Radar
                  dataKey="difficulty"
                  stroke="var(--color-primary-500)"
                  fill="var(--color-primary-500)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Progress Chart */}
        {historyData.length > 0 && (
          <motion.div
            variants={staggerItem}
            className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Session History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-0)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cards"
                  stroke="var(--color-primary-500)"
                  fill="url(#colorCards)"
                  strokeWidth={2}
                  name="Cards Studied"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {!material && sessions.length === 0 && (
        <motion.div variants={staggerItem} className="text-center py-16">
          <TrendingUp size={48} className="mx-auto mb-4 text-text-tertiary opacity-30" />
          <p className="text-lg font-medium text-text-secondary">No data yet</p>
          <p className="text-sm text-text-tertiary mt-1">Generate your first study set to see analytics</p>
        </motion.div>
      )}
    </motion.div>
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-50 border border-surface-border">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', bgColor)}>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
    </div>
  );
}
