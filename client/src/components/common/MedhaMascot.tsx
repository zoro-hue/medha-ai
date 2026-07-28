import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MascotPose =
  | 'home_fullbody'
  | 'waving'
  | 'createset_sitting'
  | 'sitting_pencil'
  | 'flashcards_peeking'
  | 'pointing_left'
  | 'celebrating'
  | 'encouraging'
  | 'summary_reading'
  | 'standing_tablet'
  | 'analytics_leaning'
  | 'history_peeking'
  | 'sitting_books';

interface MedhaMascotProps {
  pose: MascotPose;
  speechBubble?: string;
  className?: string;
  height?: number | string;
  animateIdle?: boolean;
  trackCursor?: boolean;
}

const POSE_ASSETS: Record<MascotPose, string> = {
  home_fullbody: '/assets/mascot/waving.png',
  waving: '/assets/mascot/waving.png',
  createset_sitting: '/assets/mascot/createset_sitting.png',
  sitting_pencil: '/assets/mascot/sitting_pencil.png',
  flashcards_peeking: '/assets/mascot/flashcards_peeking.png',
  pointing_left: '/assets/mascot/pointing_left.png',
  celebrating: '/assets/mascot/celebrating.png',
  encouraging: '/assets/mascot/encouraging.png',
  summary_reading: '/assets/mascot/summary_reading.png',
  standing_tablet: '/assets/mascot/standing_tablet.png',
  analytics_leaning: '/assets/mascot/analytics_leaning.png',
  history_peeking: '/assets/mascot/flashcards_peeking.png',
  sitting_books: '/assets/mascot/sitting_books.png',
};

export const MedhaMascot = memo(function MedhaMascot({
  pose,
  speechBubble,
  className,
  height,
  animateIdle = true,
  trackCursor = true,
}: MedhaMascotProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Mouse cursor tracking for subtle gaze/head movement
  useEffect(() => {
    if (!trackCursor) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 8;
      const y = (e.clientY / innerHeight - 0.5) * 6;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trackCursor]);

  // Periodic blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Default height logic: Home page full-body gets ~260px, half-body cutouts get ~210px
  const defaultHeight = pose === 'home_fullbody' || pose === 'waving' ? 260 : 210;
  const resolvedHeight = height ?? defaultHeight;
  const imageSrc = POSE_ASSETS[pose] || POSE_ASSETS.waving;

  return (
    <div className={cn('relative inline-flex flex-col items-center pointer-events-none select-none z-20', className)}>
      {/* Speech Bubble if present */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="mb-2 px-3.5 py-2 rounded-2xl bg-surface-0/95 backdrop-blur-md border border-primary-500/30 text-text-primary text-xs font-semibold shadow-xl shadow-primary-500/10 flex items-center gap-1.5 whitespace-nowrap relative pointer-events-auto"
          >
            <span>{speechBubble}</span>
            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-0/95 border-r border-b border-primary-500/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Render with Idle Breathing, Cursor Tracking, and Blinking */}
      <motion.div
        animate={
          animateIdle
            ? {
                y: [0, -5, 0],
                rotate: [0, 0.8, 0, -0.8, 0],
                x: mouseOffset.x,
              }
            : {}
        }
        transition={
          animateIdle
            ? {
                y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
                x: { type: 'spring', stiffness: 120, damping: 15 },
              }
            : {}
        }
        className="relative shrink-0"
      >
        <img
          src={imageSrc}
          alt="Medhā AI Tutor Mascot"
          style={{ height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight }}
          className="w-auto object-contain max-h-[320px] drop-shadow-lg transition-all duration-300"
          loading="eager"
        />

        {/* Blink Overlay Effect */}
        {isBlinking && (
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-primary-900/10 rounded-full blur-sm" />
        )}
      </motion.div>
    </div>
  );
});
