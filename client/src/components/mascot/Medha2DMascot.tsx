/**
 * Medha2DMascot — Premium 2D Illustrated Vector Mascot for Medhā AI.
 * Built with layered SVGs and Framer Motion for smooth, organic micro-animations:
 * - Natural breathing loop (torso/shoulders)
 * - Periodic eye blinking (eyelid path overlay)
 * - Head tilt & gaze tracking
 * - Hair & ponytail sway
 * - Pose library: waving, reading, thinking, writing, peeking, pointing, celebrating, sitting, thumbs_up
 */

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type MascotPose =
  | 'standing_waving'
  | 'reading_notes'
  | 'writing_clipboard'
  | 'thinking'
  | 'peeking'
  | 'pointing_left'
  | 'pointing_charts'
  | 'celebrating'
  | 'thumbs_up'
  | 'sitting_reading'
  | 'holding_flashcards'
  | 'encouraging';

interface Medha2DMascotProps {
  pose?: MascotPose;
  className?: string;
  isBlinking?: boolean;
}

export const Medha2DMascot = memo(function Medha2DMascot({
  pose = 'standing_waving',
  className = '',
}: Medha2DMascotProps) {
  const [blink, setBlink] = useState(false);

  // Periodic natural blinking
  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 3500 + Math.random() * 4000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        timerId = schedule();
      }, delay);
    };
    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <motion.div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        width: 240,
        height: 'auto',
        maxHeight: 360,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.svg
        viewBox="0 0 240 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5D0B5" />
            <stop offset="100%" stopColor="#E2AD8A" />
          </linearGradient>

          <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="hoodiePocketGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A2E1B" />
            <stop offset="100%" stopColor="#2A160A" />
          </linearGradient>

          <linearGradient id="jeansGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <linearGradient id="shoeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* ── BASE SHADOW ON GROUND (Standing poses) ── */}
        {pose !== 'peeking' && (
          <ellipse cx="120" cy="326" rx="55" ry="7" fill="#0F172A" fillOpacity="0.08" />
        )}

        {/* ── PONYTAIL (Back layer) ── */}
        <motion.g
          animate={{ rotate: [0, 1.5, -1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '148px 105px' }}
        >
          <path
            d="M148 105 C175 110, 185 135, 172 165 C160 190, 145 185, 142 160 C140 140, 144 118, 148 105 Z"
            fill="url(#hairGrad)"
          />
          {/* Hair tie */}
          <ellipse cx="148" cy="108" rx="6" ry="4" fill="#3B82F6" />
        </motion.g>

        {/* ── LEGS & SNEAKERS (Full Body Poses) ── */}
        {pose !== 'peeking' && pose !== 'sitting_reading' && (
          <g id="legs">
            {/* Left Leg */}
            <path d="M102 210 L98 285 L116 285 L118 210 Z" fill="url(#jeansGrad)" />
            {/* Right Leg */}
            <path d="M122 210 L124 285 L142 285 L138 210 Z" fill="url(#jeansGrad)" />
            {/* Knee Seams */}
            <line x1="100" y1="245" x2="114" y2="246" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="126" y1="246" x2="140" y2="245" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Left Shoe */}
            <path d="M92 285 C92 280, 102 278, 116 278 C120 278, 120 292, 116 292 L94 292 C92 292, 92 288, 92 285 Z" fill="url(#shoeGrad)" />
            <path d="M92 290 L118 290 L118 293 L92 293 Z" fill="#CBD5E1" />
            <rect x="100" y="280" width="10" height="3" rx="1.5" fill="#3B82F6" />

            {/* Right Shoe */}
            <path d="M124 278 C138 278, 148 280, 148 285 C148 288, 148 292, 146 292 L124 292 C120 292, 120 278, 124 278 Z" fill="url(#shoeGrad)" />
            <path d="M122 290 L148 290 L148 293 L122 293 Z" fill="#CBD5E1" />
            <rect x="130" y="280" width="10" height="3" rx="1.5" fill="#3B82F6" />
          </g>
        )}

        {/* ── SITTING LEGS (Summary pose) ── */}
        {pose === 'sitting_reading' && (
          <g id="sittingLegs">
            {/* Crossed Legs */}
            <path d="M96 210 C90 235, 115 255, 145 245 C150 230, 130 215, 124 210 Z" fill="url(#jeansGrad)" />
            <path d="M124 210 C130 235, 105 255, 75 245 C70 230, 90 215, 96 210 Z" fill="url(#jeansGrad)" />
            <ellipse cx="140" cy="245" rx="12" ry="7" fill="url(#shoeGrad)" />
            <ellipse cx="80" cy="245" rx="12" ry="7" fill="url(#shoeGrad)" />
          </g>
        )}

        {/* ── TORSO & HOODIE ── */}
        <motion.g
          animate={{ scaleY: [1, 1.012, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '120px 200px' }}
        >
          {/* Main Hoodie Body */}
          <path
            d="M92 120 C92 110, 148 110, 148 120 L152 205 C152 215, 88 215, 88 205 Z"
            fill="url(#hoodieGrad)"
            filter="url(#softShadow)"
          />

          {/* Hoodie Bottom Ribbing */}
          <path d="M88 200 L152 200 L152 210 L88 210 Z" fill="#1D4ED8" rx="2" />

          {/* Kangaroo Pocket */}
          <path
            d="M98 165 L142 165 L146 195 L94 195 Z"
            fill="url(#hoodiePocketGrad)"
            opacity="0.85"
          />

          {/* Medhā Logo Mark on Chest */}
          <circle cx="108" cy="140" r="7" fill="#FFFFFF" opacity="0.9" />
          <path d="M106 137 L111 140 L106 143 L107 140 Z" fill="#3B82F6" />

          {/* Collar & White Inner T-Shirt */}
          <path d="M108 114 Q120 124 132 114 L128 120 Q120 126 112 120 Z" fill="#FFFFFF" />

          {/* Drawstrings */}
          <path d="M113 120 L112 148" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M127 120 L128 144" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="112" cy="149" r="2" fill="#E2E8F0" />
          <circle cx="128" cy="145" r="2" fill="#E2E8F0" />
        </motion.g>

        {/* ── ARMS & HANDS (Pose Dependent) ── */}

        {/* Pose: standing_waving */}
        {pose === 'standing_waving' && (
          <>
            {/* Left Arm (Relaxed) */}
            <path d="M92 122 C80 140, 80 170, 84 185" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
            <circle cx="84" cy="190" r="7" fill="url(#skinGrad)" />

            {/* Right Arm (Waving) */}
            <motion.g
              animate={{ rotate: [0, -18, 0, -14, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              style={{ transformOrigin: '148px 125px' }}
            >
              <path d="M148 125 C168 115, 178 90, 182 72" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
              {/* Hand */}
              <circle cx="184" cy="65" r="8" fill="url(#skinGrad)" />
              <path d="M178 62 C182 56, 190 58, 188 66" stroke="#E2AD8A" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
          </>
        )}

        {/* Pose: pointing_left / pointing_charts */}
        {(pose === 'pointing_left' || pose === 'pointing_charts') && (
          <>
            {/* Right Arm Relaxed */}
            <path d="M148 122 C160 140, 160 170, 156 185" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
            <circle cx="156" cy="190" r="7" fill="url(#skinGrad)" />

            {/* Left Arm Pointing Left */}
            <g id="pointingArm">
              <path d="M92 125 C70 125, 50 130, 36 132" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
              {/* Pointing Hand */}
              <circle cx="28" cy="132" r="7" fill="url(#skinGrad)" />
              <path d="M30 132 L16 132" stroke="#E2AD8A" strokeWidth="4" strokeLinecap="round" />
            </g>
          </>
        )}

        {/* Pose: reading_notes / sitting_reading */}
        {(pose === 'reading_notes' || pose === 'sitting_reading') && (
          <g id="readingBook">
            {/* Left Arm Holding Book */}
            <path d="M92 125 C82 145, 95 165, 110 160" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
            {/* Right Arm Holding Book */}
            <path d="M148 125 C158 145, 145 165, 130 160" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />

            {/* Book Base */}
            <path d="M100 150 L120 156 L140 150 L140 174 L120 180 L100 174 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M120 156 L120 180" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Cover Spine */}
            <path d="M98 152 L120 158 L142 152" fill="none" stroke="#3B82F6" strokeWidth="3" />
          </g>
        )}

        {/* Pose: writing_clipboard */}
        {pose === 'writing_clipboard' && (
          <g id="writingClipboard">
            {/* Clipboard */}
            <rect x="85" y="142" width="34" height="46" rx="4" fill="#8D5B4C" />
            <rect x="89" y="146" width="26" height="38" rx="2" fill="#FFFFFF" />
            <rect x="97" y="140" width="10" height="5" rx="1" fill="#64748B" />

            {/* Left Arm holding clipboard */}
            <path d="M92 125 C80 145, 90 165, 102 165" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />

            {/* Right Arm Writing with Pen */}
            <path d="M148 125 C140 145, 120 160, 108 158" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
            <path d="M108 158 L100 155" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Pose: thinking */}
        {pose === 'thinking' && (
          <>
            {/* Left Arm Folded */}
            <path d="M92 125 C80 150, 110 165, 130 160" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />

            {/* Right Arm Hand on Chin */}
            <path d="M148 125 C155 145, 135 125, 126 108" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
            <circle cx="125" cy="104" r="6.5" fill="url(#skinGrad)" />
          </>
        )}

        {/* Pose: celebrating */}
        {pose === 'celebrating' && (
          <>
            {/* Left Arm Raised */}
            <motion.path
              d="M92 125 C75 105, 68 80, 64 65"
              stroke="#3B82F6"
              strokeWidth="18"
              strokeLinecap="round"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="63" cy="58" r="8" fill="url(#skinGrad)" />

            {/* Right Arm Raised */}
            <motion.path
              d="M148 125 C165 105, 172 80, 176 65"
              stroke="#3B82F6"
              strokeWidth="18"
              strokeLinecap="round"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
            />
            <circle cx="177" cy="58" r="8" fill="url(#skinGrad)" />
          </>
        )}

        {/* Pose: thumbs_up / encouraging */}
        {(pose === 'thumbs_up' || pose === 'encouraging') && (
          <>
            {/* Left Arm Relaxed */}
            <path d="M92 122 C80 140, 80 170, 84 185" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
            <circle cx="84" cy="190" r="7" fill="url(#skinGrad)" />

            {/* Right Arm Thumbs Up */}
            <g id="thumbsUpArm">
              <path d="M148 125 C165 130, 172 135, 175 140" stroke="#3B82F6" strokeWidth="18" strokeLinecap="round" />
              <circle cx="178" cy="140" r="8" fill="url(#skinGrad)" />
              {/* Thumb */}
              <path d="M178 140 L178 128" stroke="#E2AD8A" strokeWidth="4" strokeLinecap="round" />
            </g>
          </>
        )}

        {/* Pose default fallbacks */}
        {pose === 'peeking' && (
          <g id="peekingArm">
            <path d="M92 125 C82 145, 95 165, 110 160" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
          </g>
        )}
        {pose === 'holding_flashcards' && (
          <g id="holdingFlashcards">
            <path d="M92 125 C82 145, 100 160, 115 155" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
            <path d="M148 125 C158 145, 140 160, 125 155" stroke="#3B82F6" strokeWidth="16" strokeLinecap="round" />
            {/* Mini Flashcards */}
            <rect x="108" y="145" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" transform="rotate(-8 120 160)" />
            <rect x="114" y="143" width="24" height="32" rx="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(8 126 160)" />
          </g>
        )}

        {/* ── HEAD GROUP (Head, Hair, Glasses, Expression) ── */}
        <motion.g
          animate={{
            rotate: pose === 'thinking' ? [0, 3, 0] : pose === 'reading_notes' ? [0, -2, 0] : [0, 1.5, 0],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '120px 92px' }}
        >
          {/* Neck */}
          <rect x="112" y="96" width="16" height="22" rx="4" fill="url(#skinGrad)" />

          {/* Base Head Shape */}
          <ellipse cx="120" cy="80" rx="32" ry="34" fill="url(#skinGrad)" />

          {/* Ears */}
          <circle cx="88" cy="82" r="6" fill="url(#skinGrad)" />
          <circle cx="152" cy="82" r="6" fill="url(#skinGrad)" />

          {/* Cheeks (Blush) */}
          <ellipse cx="102" cy="88" rx="7" ry="4" fill="#F43F5E" opacity="0.25" />
          <ellipse cx="138" cy="88" rx="7" ry="4" fill="#F43F5E" opacity="0.25" />

          {/* Nose */}
          <path d="M120 80 Q118 85 121 86" stroke="#D4956F" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Mouth (Warm Smile) */}
          <path
            d="M111 93 Q120 101 129 93"
            stroke="#C0392B"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes & Eyebrows */}
          <g id="eyesGroup">
            {/* Eyebrows */}
            <path d="M98 68 Q105 64 112 67" stroke="#2A160A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M128 67 Q135 64 142 68" stroke="#2A160A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {!blink ? (
              <>
                {/* Left Eye */}
                <ellipse cx="105" cy="74" rx="6.5" ry="7.5" fill="#FFFFFF" />
                <ellipse cx="105" cy="74" rx="4" ry="5" fill="#4A2E1B" />
                <circle cx="104" cy="72" r="1.5" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="135" cy="74" rx="6.5" ry="7.5" fill="#FFFFFF" />
                <ellipse cx="135" cy="74" rx="4" ry="5" fill="#4A2E1B" />
                <circle cx="134" cy="72" r="1.5" fill="#FFFFFF" />
              </>
            ) : (
              <>
                {/* Blinked Eyelids */}
                <path d="M99 75 Q105 79 111 75" stroke="#2A160A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M129 75 Q135 79 141 75" stroke="#2A160A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}
          </g>

          {/* Glasses Frame & Lenses */}
          <g id="glassesGroup">
            {/* Left Lens */}
            <circle cx="104" cy="74" r="13" stroke="#1E293B" strokeWidth="2.5" fill="#E2E8F0" fillOpacity="0.18" />
            {/* Right Lens */}
            <circle cx="136" cy="74" r="13" stroke="#1E293B" strokeWidth="2.5" fill="#E2E8F0" fillOpacity="0.18" />
            {/* Bridge */}
            <path d="M117 74 Q120 72 123 74" stroke="#1E293B" strokeWidth="2.5" fill="none" />
            {/* Lens Glare */}
            <path d="M96 68 L104 65" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            <path d="M128 68 L136 65" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* ── HAIR (Front Bangs & Strands) ── */}
          <g id="frontHair">
            {/* Top Hair Volume */}
            <path
              d="M86 78 C82 50, 100 42, 120 42 C140 42, 158 50, 154 78 C150 62, 138 52, 120 52 C102 52, 90 62, 86 78 Z"
              fill="url(#hairGrad)"
            />
            {/* Side Bangs Left */}
            <path d="M88 64 C88 80, 94 92, 96 100 C92 90, 90 78, 90 64 Z" fill="url(#hairGrad)" />
            {/* Side Bangs Right */}
            <path d="M152 64 C152 80, 146 92, 144 100 C148 90, 150 78, 150 64 Z" fill="url(#hairGrad)" />
            {/* Front Fringe Wisps */}
            <path d="M102 52 Q114 62 124 54 Q134 62 140 54" stroke="#4A2E1B" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        </motion.g>
      </motion.svg>
    </motion.div>
  );
});
