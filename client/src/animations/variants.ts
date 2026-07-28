/**
 * Framer Motion Animation Variants
 *
 * Centralized animation presets for consistent motion throughout the app.
 * Uses spring physics for natural feel and supports reduced motion.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Spring Presets ───────────────────────────────────────────────────────────

export const springs = {
  gentle: { type: 'spring', stiffness: 120, damping: 14, mass: 0.8 } as Transition,
  snappy: { type: 'spring', stiffness: 300, damping: 20, mass: 0.6 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 10, mass: 0.5 } as Transition,
  smooth: { type: 'spring', stiffness: 200, damping: 25, mass: 1 } as Transition,
};

// ─── Page Transitions ─────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
};

export const pageTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 0.8,
};

// ─── Card Variants ────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -8 },
  hover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
  tap: { scale: 0.98 },
};

// ─── Flashcard Flip ───────────────────────────────────────────────────────────

export const flipVariants: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

// ─── Stagger Children ────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

// ─── Sidebar Navigation ──────────────────────────────────────────────────────

export const navItemVariants: Variants = {
  idle: { scale: 1, backgroundColor: 'transparent' },
  hover: { scale: 1.02 },
  active: { scale: 1 },
  tap: { scale: 0.97 },
};

// ─── Toast / Alert ────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

// ─── Modal / Overlay ──────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (percentage: number) => ({
    scaleX: percentage / 100,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  }),
};

// ─── Slide Variants ───────────────────────────────────────────────────────────

export const slideInFromRight: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const slideInFromLeft: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};
