import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  ChevronDown,
} from 'lucide-react';

interface LandingHeroProps {
  onLaunch: () => void;
}

export const LandingHero = memo(function LandingHero({ onLaunch }: LandingHeroProps) {
  return (
    <div className="relative min-h-screen w-full bg-surface-0 text-text-primary selection:bg-primary-500 selection:text-white overflow-x-hidden">
      {/* ================= Z-LAYER 0: AMBIENT AI ENVIRONMENT ================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Gradient Orb 1 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary-500/15 via-indigo-500/10 to-transparent blur-[100px] rounded-full pointer-events-none" />

        {/* Soft Radial Gradient Orb 2 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-t from-purple-500/10 via-emerald-500/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Micro Floating Energy Nodes (Subtle AI Presence) */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.03] dark:opacity-[0.06]" />
      </div>

      {/* ================= PAGE 1: SPATIAL HERO VIEWPORT (100vh) ================= */}
      <section className="h-screen w-full flex flex-col justify-between items-center px-6 pt-8 pb-6 relative z-10">
        {/* Z-LAYER 20: Animated Brand Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-7xl mx-auto flex items-center justify-center pt-2 sm:pt-4 z-20"
        >
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 border border-white/20"
            >
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={28} className="text-white" />
              </motion.div>
            </motion.div>

            <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary">
              Medhā{' '}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 ml-2 border border-primary-500/20 align-middle">
                AI 2.0
              </span>
            </span>
          </motion.div>
        </motion.header>

        {/* Z-LAYER 30 & 40: Main Intelligent Workspace Entrance */}
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center my-auto py-4 z-30">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Z-LAYER 10: Ambient Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold shadow-sm backdrop-blur-md"
              >
                <Sparkles size={13} className="animate-pulse text-primary-500" />
                <span>Next-Generation Intelligent Learning Workspace</span>
              </motion.div>
            </motion.div>

            {/* Z-LAYER 30: Line-By-Line Monumental Headline Entrance */}
            <div className="space-y-1 sm:space-y-2 max-w-3xl">
              {/* Line 1 */}
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-text-primary leading-tight"
              >
                Master Any Topic
              </motion.h1>

              {/* Line 2 */}
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent"
              >
                10x Faster
              </motion.h1>

              {/* Line 3 */}
              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-tight"
              >
                with Medhā AI
              </motion.h1>
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs sm:text-base text-text-secondary leading-relaxed max-w-xl font-normal"
            >
              Step into a calm, motion-first spatial workspace. Turn raw notes, PDFs, and lectures into interactive 3D flashcards, smart quizzes, and executive breakdowns.
            </motion.p>

            {/* Z-LAYER 40: Living CTA Button with Breathy Pulse */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2 flex flex-col items-center space-y-3"
            >
              <motion.button
                onClick={onLaunch}
                animate={{
                  boxShadow: [
                    '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                    '0 20px 50px -5px rgba(99, 102, 241, 0.5)',
                    '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.04,
                  y: -3,
                }}
                whileTap={{ scale: 0.96 }}
                className="px-10 py-4.5 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-purple-600 text-white font-bold text-base tracking-wide flex items-center gap-3.5 group cursor-pointer border border-white/25"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </motion.button>

              <div className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                <ShieldCheck size={15} className="text-emerald-500" />
                <span>Free Instant Access · No Setup Required</span>
              </div>
            </motion.div>

            {/* Z-LAYER 40: Sequential Sliding Feature Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
              className="pt-2"
            >
              <div className="px-6 py-3 rounded-2xl bg-surface-50/70 dark:bg-surface-100/50 backdrop-blur-xl border border-surface-border flex flex-wrap items-center justify-center gap-6 shadow-sm">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  className="flex items-center gap-2 text-xs font-semibold text-text-secondary select-none"
                >
                  <CheckCircle2 size={14} className="text-primary-500" /> 3D Physical Flashcards
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.76 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  className="flex items-center gap-2 text-xs font-semibold text-text-secondary select-none"
                >
                  <CheckCircle2 size={14} className="text-primary-500" /> Adaptive AI Quizzes
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.84 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  className="flex items-center gap-2 text-xs font-semibold text-text-secondary select-none"
                >
                  <CheckCircle2 size={14} className="text-primary-500" /> Voice Tutor Synthesis
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Z-LAYER 20: Floating Ambient Scroll Indicator */}
        <motion.div
          animate={{
            y: [0, 8, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
          }}
          className="pb-2 flex flex-col items-center gap-1.5 text-xs font-semibold text-text-tertiary select-none z-20"
        >
          <span>Scroll down to explore features</span>
          <ChevronDown size={18} className="text-primary-500 animate-bounce" />
        </motion.div>
      </section>

      {/* ================= PAGE 2: SPATIAL SHOWCASE — GLASSMORPHISM CARDS ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 py-28 border-t border-surface-border/40 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Engineered for Deep Active Recall & Mastery
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Medhā combines physical motion physics, cognitive science, and natural voice interaction into one unified learning operating system.
          </p>
        </div>

        {/* Spacious Glassmorphism Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-surface-50/70 dark:bg-surface-100/40 backdrop-blur-3xl border border-surface-border hover:border-primary-500/40 shadow-xl hover:shadow-2xl transition-all space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold shadow-inner">
              <Layers size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-500 transition-colors">
              3D Physical Flashcards Engine
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Experience tactile 3D Y-axis card flips, side-stack depth previews, and synchronized breathing physics designed to mimic physical study cards with high spatial realism.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-surface-50/70 dark:bg-surface-100/40 backdrop-blur-3xl border border-surface-border hover:border-indigo-500/40 shadow-xl hover:shadow-2xl transition-all space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shadow-inner">
              <Brain size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-indigo-500 transition-colors">
              Adaptive Quizzes & Voice Feedback
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Test your retention with instant answer evaluation, step-by-step reasoning explanations, and natural female speech synthesis for encouraging verbal audio feedback.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-surface-50/70 dark:bg-surface-100/40 backdrop-blur-3xl border border-surface-border hover:border-purple-500/40 shadow-xl hover:shadow-2xl transition-all space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold shadow-inner">
              <FileText size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-purple-500 transition-colors">
              Executive Summaries & Concept Maps
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Digest complex topics in seconds with automated mind map concept trees, key principles, executive breakdowns, and actionable revision notes.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-surface-50/70 dark:bg-surface-100/40 backdrop-blur-3xl border border-surface-border hover:border-emerald-500/40 shadow-xl hover:shadow-2xl transition-all space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shadow-inner">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-emerald-500 transition-colors">
              Real-Time Mastery Analytics
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Track session history, performance metrics, retention speed, study streaks, and topic mastery levels through clean data visualizations.
            </p>
          </motion.div>
        </div>

        {/* Bottom Call to Action Banner */}
        <div className="mt-20 p-10 rounded-3xl bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-purple-500/10 border border-primary-500/20 text-center flex flex-col items-center space-y-5 backdrop-blur-2xl">
          <h3 className="text-2xl font-extrabold text-text-primary">
            Ready to step into your intelligent workspace?
          </h3>
          <motion.button
            onClick={onLaunch}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-9 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-xl shadow-primary-500/30 flex items-center gap-2.5 cursor-pointer"
          >
            <span>Launch Medhā Workspace</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-tertiary relative z-10">
        <span>© {new Date().getFullYear()} Medhā AI. All rights reserved.</span>
        <span>Empowering intelligent active recall</span>
      </footer>
    </div>
  );
});
