/**
 * MedhaCharacterMaster — Permanent UI Companion matching official Medhā AI Tutor
 * character rules (Poses 1–10).
 *
 * Uses transparent PNG assets with responsive clamp sizing:
 * - Home: clamp(280px, 26vw, 380px)
 * - Default: clamp(220px, 22vw, 340px)
 * - Celebrate: clamp(260px, 25vw, 360px)
 * - Peek: clamp(210px, 20vw, 300px)
 * - 100% transparent background, filter: drop-shadow(0 16px 32px rgba(0,0,0,0.18))
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

export type MedhaPoseID =
  | 'wave'
  | 'point_left'
  | 'point_down'
  | 'reading_book'
  | 'writing'
  | 'thinking'
  | 'celebrate'
  | 'thumbs_up'
  | 'peek_right'
  | 'sitting_reading'
  | 'look_at_chart'
  | 'holding_flashcards'
  | 'quiz_perfect'
  | 'quiz_outstanding'
  | 'quiz_average'
  | 'quiz_keepgoing';

interface MedhaCharacterMasterProps {
  pose?: MedhaPoseID;
  sizeVariant?: 'home' | 'default' | 'celebrate' | 'peek';
  className?: string;
}

const POSE_IMAGES: Record<MedhaPoseID, string> = {
  wave: '/mascot/pose_1_wave.png',
  point_left: '/mascot/pose_2_point_left.png',
  point_down: '/mascot/pose_3_point_down.png',
  reading_book: '/mascot/pose_4_reading_book.png',
  writing: '/mascot/pose_5_writing.png',
  thinking: '/mascot/pose_6_thinking.png',
  celebrate: '/mascot/pose_7_celebrate.png',
  thumbs_up: '/mascot/pose_8_thumbs_up.png',
  peek_right: '/mascot/pose_9_peek_right.png',
  sitting_reading: '/mascot/pose_10_sitting_reading.png',
  look_at_chart: '/mascot/pose_11_look_at_chart.png',
  holding_flashcards: '/mascot/pose_12_holding_flashcards.png',
  quiz_perfect: '/mascot/quiz_result_perfect.png',
  quiz_outstanding: '/mascot/quiz_result_outstanding.png',
  quiz_average: '/mascot/quiz_result_average.png',
  quiz_keepgoing: '/mascot/quiz_result_keepgoing.png',
};

export const MedhaCharacterMaster = memo(function MedhaCharacterMaster({
  pose = 'wave',
  sizeVariant = 'default',
  className = '',
}: MedhaCharacterMasterProps) {
  const imgSrc = POSE_IMAGES[pose] || POSE_IMAGES.wave;

  const sizeClass =
    sizeVariant === 'home'
      ? 'medha-tutor-home'
      : sizeVariant === 'celebrate'
      ? 'medha-tutor-celebrate'
      : sizeVariant === 'peek'
      ? 'medha-tutor-peek'
      : 'medha-tutor-default';

  return (
    <motion.img
      key={imgSrc}
      src={imgSrc}
      alt="Medhā AI Tutor"
      className={`medha-tutor ${sizeClass} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      draggable={false}
    />
  );
});
