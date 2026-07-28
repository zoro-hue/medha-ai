import { memo, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  Target,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Brain,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
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

    const totalTimeMs = sessions.reduce((sum, s) => sum + (s.timeSpentMs || 0), 0);

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
      sessionDays,
    };
  }, [material, flashcard.mastered, quizScore, sessions]);

  // Heatmap data for last 28 days (4 weeks)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const hasActivity = stats.sessionDays.has(dateStr);
      days.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hasActivity,
      });
    }
    return days;
  }, [stats.sessionDays]);

  // Topic mastery indicators
  const topicMastery = useMemo(() => {
    if (!material) return [];
    const topicMap: Record<string, { total: number; mastered: number }> = {};
    material.flashcards.forEach((card) => {
      const tag = card.tags?.[0] || 'Core Concepts';
      if (!topicMap[tag]) topicMap[tag] = { total: 0, mastered: 0 };
      topicMap[tag].total++;
      if (flashcard.mastered.has(card.id)) topicMap[tag].mastered++;
    });

    return Object.entries(topicMap).map(([topic, counts]) => ({
      topic,
      total: counts.total,
      mastered: counts.mastered,
      pct: Math.round((counts.mastered / counts.total) * 100),
    }));
  }, [material, flashcard.mastered]);

  const dailyStudyData = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    sessions.forEach((s) => {
      const date = new Date(s.createdAt);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const minutes = Math.round((s.timeSpentMs || 120000) / 60000);
      if (dayMap[dayName] !== undefined) {
        dayMap[dayName] += Math.max(2, minutes);
      }
    });

    return daysOfWeek.map((day) => ({
      day,
      minutes: dayMap[day] > 0 ? dayMap[day] : 5,
    }));
  }, [sessions]);

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
      className="relative max-w-4xl mx-auto px-4 md:px-0 space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-4">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Analytics & Insights</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track your mastery, streak velocity, and weekly engagement
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Weekly Study Heatmap & Streak Target Bar */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heatmap */}
        <div className="p-5 rounded-2xl bg-surface-50 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Weekly Activity Heatmap
            </h3>
            <span className="text-xs text-text-tertiary">Last 28 Days</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {heatmapDays.map((day, idx) => (
              <div
                key={idx}
                title={`${day.dateStr}: ${day.hasActivity ? 'Studied' : 'No Activity'}`}
                className={cn(
                  'w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all',
                  day.hasActivity
                    ? 'bg-emerald-500 text-white shadow-sm scale-105'
                    : 'bg-surface-200/50 text-text-tertiary'
                )}
              >
                <span className="text-[9px] font-mono">{day.date.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-[11px] text-text-tertiary">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-surface-200/50" />
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        {/* Streak Milestone */}
        <div className="p-5 rounded-2xl bg-surface-50 border border-surface-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Flame size={16} className="text-rose-500" /> Streak Milestone Progress
              </h3>
              <span className="text-xs font-bold text-rose-500">{stats.streak} Days Active</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Maintain daily study consistency to unlock mastery badges and preserve your momentum.
            </p>

            {/* Streak Target Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>7-Day Goal</span>
                <span>{Math.min(stats.streak, 7)} / 7 Days</span>
              </div>
              <div className="h-2 bg-surface-200/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500 rounded-full"
                  animate={{ width: `${Math.min((stats.streak / 7) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-text-tertiary">
            <span>Next Badge: 7-Day Scholar</span>
            <span className="font-semibold text-text-primary">{7 - Math.min(stats.streak, 7)} days remaining</span>
          </div>
        </div>
      </motion.div>

      {/* Topic Mastery Indicators */}
      {topicMastery.length > 0 && (
        <motion.div variants={staggerItem} className="p-5 rounded-2xl bg-surface-50 border border-surface-border space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Brain size={16} className="text-primary-500" /> Topic Mastery Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topicMastery.map((item) => (
              <div key={item.topic} className="space-y-1.5 p-3 rounded-xl bg-surface-0 border border-surface-border">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-text-primary truncate">{item.topic}</span>
                  <span className="text-text-tertiary">{item.mastered} / {item.total} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Section: Study Time Bar Chart & Session History Area Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Study Time Bar Chart */}
        <motion.div
          variants={staggerItem}
          className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Clock size={16} className="text-primary-500" /> Daily Study Time (Mins)
            </h3>
            <span className="text-xs text-text-tertiary">Mon — Sun</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dailyStudyData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-0)',
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                formatter={(val: any) => [`${val} mins`, 'Study Time']}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="var(--color-primary-500)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Session History Area Chart */}
        {historyData.length > 0 && (
          <motion.div
            variants={staggerItem}
            className="p-5 rounded-2xl bg-surface-50 border border-surface-border"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Cards Studied Trend</h3>
            <ResponsiveContainer width="100%" height={210}>
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
    </motion.div>
  );
});

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-50 border border-surface-border flex flex-col justify-between">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', bgColor, color)}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-text-primary tracking-tight">{value}</p>
        <p className="text-xs text-text-tertiary truncate mt-0.5">{label}</p>
      </div>
    </div>
  );
}
