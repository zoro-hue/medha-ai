/**
 * AICompanionLayer — Permanent UI Companion Layer for Medhā AI.
 * Implements exact placement, speech bubbles, and behavior rules for Poses 1–10:
 *
 * 1. Standing & Waving (Home): Top Right beside greeting, 40px from right, 60px from top (320-360px).
 * 2. Pointing Left (Flashcards): Right side of flashcard, pointing at card center.
 * 3. Pointing Down (Create Set): Top Right of textarea, finger points toward textarea (260-300px).
 * 4. Reading Book (Summary Upper): Upper Right beside summary card.
 * 5. Writing on Clipboard (Quiz Start): Right side beside Start Quiz card (260-290px).
 * 6. Thinking (Quiz Questions): Right side of question card, 40px from right edge (240-270px).
 * 7. Celebrating (Quiz Results): Top Right beside score/result card (300-340px).
 * 8. Thumbs Up (Study Complete): Bottom Right near completion message.
 * 9. Peeking from Right (History): Right side edge, half body visible 55-60% (250-280px).
 * 10. Sitting & Reading (Summary Lower): Bottom Right in empty whitespace beside revision tips (240-270px).
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { useBotStore } from '@/store/useBotStore';
import { MedhaCharacterMaster, type MedhaPoseID } from '@/components/mascot/MedhaCharacterMaster';

interface PageLayoutConfig {
  pose: MedhaPoseID;
  sizeVariant: 'home' | 'default' | 'celebrate' | 'peek';
  containerClass: string;
  speechOptions: string[];
}

const POSE_SPEECHES: Record<string, string[]> = {
  home: [
    'Welcome back! 👋 Ready to learn something new today?',
    "Let's make today a productive study session.",
    'Your next milestone is waiting!',
    'Great to see you again.',
    'Every small study session brings big progress.',
    'Ready to continue where you left off?',
    'Consistency is your superpower!',
    "Let's build another successful study session.",
  ],
  input: [
    "Paste your notes and I'll organize everything.",
    'Upload your material to create a complete study set.',
    "Let's transform your notes into something amazing.",
    "I'll generate flashcards, quizzes, and summaries for you.",
    'Ready whenever you are!',
    'Your learning journey starts here.',
  ],
  flashcards: [
    'Ready for a quick revision?',
    'Active recall makes learning stronger.',
    'Flip each card carefully.',
    "You've got this!",
    'One concept at a time.',
    'Practice now, remember later.',
    'Keep the momentum going.',
    'Every card brings you closer to mastery.',
  ],
  analytics: [
    "Here's your learning progress.",
    'You are improving every day.',
    'Look how far you have come!',
    'Your consistency is paying off.',
    'Keep your streak alive.',
    'Progress beats perfection.',
    'Every session makes a difference.',
    "Let's reach your next milestone.",
  ],
  quiz_start: [
    "I've prepared a challenge for you!",
    "Let's see what you've learned.",
    'Think carefully—you will do great.',
    'Time to test your understanding.',
    'Ready when you are!',
    'Good luck!',
  ],
  quiz_question: [
    'Read every option carefully.',
    'Take your time.',
    'Think before you answer.',
    'Trust your understanding.',
    'Look for the key idea.',
    "You've studied this before.",
    'Stay focused!',
  ],
  quiz_result: [
    'Congratulations! 🎉',
    'Amazing effort today!',
    'Another step toward mastery.',
    'Well done!',
    'Keep this momentum going.',
    'Great consistency!',
    'Ready for another challenge?',
  ],
  summary: [
    "Let's revise the key ideas together.",
    'These are the most important concepts.',
    'Understanding beats memorization.',
    'Read this once before moving on.',
    'Focus on the key takeaways.',
    'Revision helps long-term memory.',
    'Learning becomes easier with revision.',
    'A quick review now saves time later.',
  ],
  history: [
    "Welcome back! Let's revisit your previous sessions.",
    'Every study session tells a story.',
    'Look how much you have accomplished.',
    'Review regularly to remember longer.',
    'Ready to continue where you left off?',
    'Your learning journey keeps growing.',
    'Revisiting old topics builds confidence.',
    'Every review strengthens your understanding.',
  ],
  idle: [
    "Need a hand? I'm here whenever you're ready.",
    "Let's continue learning!",
    'Ready for the next step?',
    'We can pick up where we left off.',
  ],
  generating: [
    'Reading your notes...',
    'Understanding the important concepts...',
    'Creating flashcards...',
    'Preparing quiz questions...',
    'Building your summary...',
    'Almost ready...',
    'Just a few more seconds!',
  ],
};

const recentSpeechHistory: string[] = [];

function getRandomSpeech(options: string[]) {
  if (!options || options.length === 0) return '';
  const available = options.filter((opt) => !recentSpeechHistory.includes(opt));
  const pool = available.length > 0 ? available : options;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  recentSpeechHistory.push(selected);
  if (recentSpeechHistory.length > 3) recentSpeechHistory.shift();
  return selected;
}

export const AICompanionLayer = memo(function AICompanionLayer() {
  const { viewMode, quiz, material, isGenerating } = useStudyStore();
  const isChatOpen = useBotStore((s) => s.isOpen);

  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Text-to-Speech (TTS) natural female voice speech synthesis
  const speakText = useCallback(
    (text: string) => {
      if (isMuted || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Female') ||
            v.name.includes('Zira') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Google US English female') ||
            v.name.toLowerCase().includes('female'))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  // Trigger speech bubble & optional voice audio
  const triggerSpeech = useCallback(
    (text: string, durationMs = 4000, enableVoice = true) => {
      setActiveSpeech(text);
      if (enableVoice) speakText(text);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => {
        setActiveSpeech(null);
      }, durationMs);
    },
    [speakText]
  );

  // React directly to quiz answer selections (POSITIVE feedback on correct answers)
  useEffect(() => {
    if (viewMode !== 'quiz' || quiz.answers.length === 0) return;
    const lastAnswer = quiz.answers[quiz.answers.length - 1];
    if (lastAnswer) {
      if (lastAnswer.isCorrect) {
        const praise = getRandomSpeech([
          'Spot on! Excellent work! 🎉',
          'You got it right! Great job!',
          'Correct! Your understanding is sharp.',
          'Awesome! Keep this streak going!',
        ]);
        triggerSpeech(praise, 3500);
      } else {
        const encouragement = getRandomSpeech([
          "Good attempt! Check the explanation below to master it.",
          "Not quite, but mistakes help us learn better!",
          "Keep focused! Reviewing the reasoning will build memory.",
        ]);
        triggerSpeech(encouragement, 3500);
      }
    }
  }, [quiz.answers.length, viewMode, triggerSpeech]);

  // Trigger celebration confetti on quiz completion
  useEffect(() => {
    if (viewMode === 'quiz' && quiz.mode === 'results') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [viewMode, quiz.mode]);

  // Idle Timer (60 seconds of inactivity triggers gentle idle reminder)
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        const speech = getRandomSpeech(POSE_SPEECHES.idle);
        triggerSpeech(speech, 3500);
      }, 60000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [triggerSpeech]);

  // Generation state message rotation (rotates loading messages every 2.5s)
  useEffect(() => {
    if (!isGenerating) return;
    let index = 0;
    const genMessages = POSE_SPEECHES.generating;
    triggerSpeech(genMessages[0], 2500, false);

    const interval = setInterval(() => {
      index = (index + 1) % genMessages.length;
      triggerSpeech(genMessages[index], 2500, false);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating, triggerSpeech]);

  // Per-view speech bubble trigger on mount / view switch
  useEffect(() => {
    if (isGenerating || quiz.answers.length > 0) return;

    const key =
      viewMode === 'quiz'
        ? quiz.mode === 'results'
          ? 'quiz_result'
          : 'quiz_start'
        : viewMode;

    const speeches = POSE_SPEECHES[key];
    if (speeches && speeches.length > 0) {
      const speech = getRandomSpeech(speeches);
      const timer = setTimeout(() => {
        triggerSpeech(speech, 3500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [viewMode, quiz.mode, isGenerating, triggerSpeech]);

  // Page layout & pose configuration strictly respecting score performance for quiz results
  const getConfig = useCallback((): PageLayoutConfig | null => {
    switch (viewMode) {
      case 'home':
        return {
          pose: 'wave',
          sizeVariant: 'home',
          containerClass: 'fixed top-[125px] right-[40px]',
          speechOptions: POSE_SPEECHES.home,
        };

      case 'input':
        return {
          pose: 'point_down',
          sizeVariant: 'default',
          containerClass: 'fixed top-[135px] right-[40px]',
          speechOptions: POSE_SPEECHES.input,
        };

      case 'flashcards':
        return {
          pose: 'holding_flashcards',
          sizeVariant: 'default',
          containerClass: 'fixed top-[205px] right-[30px]',
          speechOptions: POSE_SPEECHES.flashcards,
        };

      case 'quiz':
        if (quiz.mode === 'results') {
          const score = quiz.answers.length > 0
            ? Math.round((quiz.answers.filter((a) => a.isCorrect).length / quiz.answers.length) * 100)
            : 100;

          let scorePose: MedhaPoseID = 'quiz_perfect';
          if (score === 100) scorePose = 'quiz_perfect';
          else if (score >= 90) scorePose = 'quiz_outstanding';
          else if (score >= 70) scorePose = 'quiz_average';
          else scorePose = 'quiz_keepgoing';

          return {
            pose: scorePose,
            sizeVariant: 'celebrate',
            containerClass: 'fixed top-[105px] right-[40px]',
            speechOptions: POSE_SPEECHES.quiz_result,
          };
        }
        if (quiz.answers.length > 0 || (material?.quiz && quiz.currentIndex >= 0)) {
          return {
            pose: 'thinking',
            sizeVariant: 'default',
            containerClass: 'fixed top-[185px] right-[40px]',
            speechOptions: POSE_SPEECHES.quiz_question,
          };
        }
        return {
          pose: 'writing',
          sizeVariant: 'default',
          containerClass: 'fixed top-[185px] right-[40px]',
          speechOptions: POSE_SPEECHES.quiz_start,
        };

      case 'summary':
        return {
          pose: 'sitting_reading',
          sizeVariant: 'default',
          containerClass: 'fixed top-[165px] right-[40px]',
          speechOptions: POSE_SPEECHES.summary,
        };

      case 'analytics':
        return {
          pose: 'look_at_chart',
          sizeVariant: 'default',
          containerClass: 'fixed top-[125px] right-[40px]',
          speechOptions: POSE_SPEECHES.analytics,
        };

      case 'history':
        return {
          pose: 'peek_right',
          sizeVariant: 'peek',
          containerClass: 'fixed top-[165px] -right-[25px]',
          speechOptions: POSE_SPEECHES.history,
        };

      default:
        return null;
    }
  }, [viewMode, quiz.mode, quiz.answers.length, quiz.currentIndex, material]);

  if (isChatOpen) return null;
  const config = getConfig();
  if (!config) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode + config.pose}
        layout={false}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`${config.containerClass} z-30 pointer-events-none flex flex-col items-center select-none`}
      >
        {/* Attached Speech Bubble with TTS Voice Toggle Button */}
        <AnimatePresence>
          {activeSpeech && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="mb-1.5 px-3.5 py-2 rounded-2xl bg-surface-0/95 backdrop-blur-md border border-surface-border text-text-primary text-xs font-bold shadow-lg flex items-center justify-between gap-2 max-w-[210px] relative pointer-events-auto"
            >
              <span>{activeSpeech}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                  if (!isMuted) window.speechSynthesis.cancel();
                }}
                className="text-text-tertiary hover:text-primary-500 transition-colors p-0.5 shrink-0"
                title={isMuted ? 'Unmute Mascot Voice' : 'Mute Mascot Voice'}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-0/95 border-r border-b border-surface-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medhā Permanent UI Mascot */}
        <div
          onMouseEnter={() => {
            const speech = getRandomSpeech(config.speechOptions);
            triggerSpeech(speech, 4500);
          }}
          className="pointer-events-auto cursor-pointer"
        >
          <MedhaCharacterMaster pose={config.pose} sizeVariant={config.sizeVariant} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
