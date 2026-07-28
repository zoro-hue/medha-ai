/**
 * Smart Local Study Material Generator
 *
 * Provides instant, high-quality study set generation directly in the browser
 * whenever the backend server is unreachable or offline.
 */

import type { StudyMaterial, Flashcard, QuizQuestion, MindMapNode } from '@/types';

export function generateLocalStudyMaterial(
  content: string,
  options?: {
    flashcardCount?: number;
    quizCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  }
): StudyMaterial {
  const text = content.trim();
  const targetCards = Math.max(3, options?.flashcardCount || 10);
  const targetQuizzes = Math.max(3, options?.quizCount || 5);
  const diffSetting = options?.difficulty || 'mixed';

  // Helper to split into clean sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  // Extract key terms / concepts (words > 4 chars, capitalized or frequent)
  const wordFreq: Record<string, number> = {};
  const words = text.match(/\b[A-Za-z]{4,}\b/g) || [];
  words.forEach((w) => {
    const lower = w.toLowerCase();
    if (!['this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'about', 'these'].includes(lower)) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  });

  const sortedTerms = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
  const primaryTopic = sortedTerms[0]
    ? sortedTerms[0].charAt(0).toUpperCase() + sortedTerms[0].slice(1)
    : 'Study Topic';

  // 1. Generate Title
  const firstLine = text.split('\n')[0].replace(/^#+\s*/, '').trim();
  let title = primaryTopic;
  if (firstLine && firstLine.length > 5 && firstLine.length < 60) {
    title = firstLine;
  } else if (sentences[0]) {
    const firstSent = sentences[0];
    if (firstSent.includes(' is ')) {
      title = firstSent.split(' is ')[0].trim();
    } else {
      title = `${primaryTopic} Fundamentals`;
    }
  }

  // 2. Generate Summary
  let summary = '';
  if (sentences.length >= 3) {
    summary = `${sentences[0]} ${sentences[1]} ${sentences[2]}`;
  } else if (sentences.length > 0) {
    summary = sentences.join(' ');
  } else {
    summary = text;
  }

  // 3. Generate Key Points
  const keyPoints: string[] = [];
  sentences.forEach((s) => {
    if (keyPoints.length < 5 && s.length < 150) {
      keyPoints.push(s);
    }
  });
  if (keyPoints.length === 0) {
    keyPoints.push(`Core principles of ${primaryTopic}`);
    keyPoints.push(`Key definitions and practical applications`);
  }

  // Helper for difficulty
  const getDiff = (idx: number): 'easy' | 'medium' | 'hard' => {
    if (diffSetting !== 'mixed') return diffSetting;
    if (idx % 3 === 0) return 'easy';
    if (idx % 3 === 1) return 'medium';
    return 'hard';
  };

  // 4. Generate Flashcards
  const flashcards: Flashcard[] = [];
  let cardId = 1;

  // Process definition-like or factual sentences
  sentences.forEach((sent) => {
    if (flashcards.length >= targetCards) return;

    if (sent.includes(' is ') || sent.includes(' are ') || sent.includes(' refers to ') || sent.includes(' defined as ')) {
      const parts = sent.split(/\b(is|are|refers to|defined as)\b/i);
      if (parts.length >= 3) {
        const subject = parts[0].trim();
        const definition = parts.slice(2).join('').trim();
        if (subject.length > 3 && definition.length > 10) {
          flashcards.push({
            id: `fc-${cardId++}`,
            question: `What is ${subject}?`,
            answer: `${subject} ${parts[1]} ${definition}`,
            difficulty: getDiff(flashcards.length),
            hint: `Focus on key characteristics of ${subject}`,
            tags: [primaryTopic, 'Definition'],
          });
        }
      }
    } else if (sent.includes(' because ') || sent.includes(' causes ') || sent.includes(' leads to ') || sent.includes(' results in ')) {
      flashcards.push({
        id: `fc-${cardId++}`,
        question: `Why or how does ${sent.split(/\b(because|causes|leads to|results in)\b/i)[0].trim()} occur?`,
        answer: sent,
        difficulty: getDiff(flashcards.length),
        hint: 'Consider cause and effect relationships',
        tags: [primaryTopic, 'Concept'],
      });
    }
  });

  // Fill remaining flashcards from sentences or key terms if needed
  let sentIdx = 0;
  while (flashcards.length < targetCards) {
    if (sentences[sentIdx]) {
      const s = sentences[sentIdx];
      flashcards.push({
        id: `fc-${cardId++}`,
        question: `What key concept is described regarding: "${s.slice(0, 45)}..."?`,
        answer: s,
        difficulty: getDiff(flashcards.length),
        hint: 'Recall details from the study material',
        tags: [primaryTopic],
      });
    } else {
      const term = sortedTerms[flashcards.length % sortedTerms.length] || 'concept';
      const capitalized = term.charAt(0).toUpperCase() + term.slice(1);
      flashcards.push({
        id: `fc-${cardId++}`,
        question: `Explain the significance of ${capitalized} in this context.`,
        answer: `${capitalized} represents a core element discussed in the study material regarding ${primaryTopic}.`,
        difficulty: getDiff(flashcards.length),
        tags: [primaryTopic],
      });
    }
    sentIdx++;
  }

  // 5. Generate Quiz Questions
  const quiz: QuizQuestion[] = [];
  let qId = 1;

  flashcards.slice(0, targetQuizzes).forEach((card, idx) => {
    const correctAnswer = card.answer;
    
    // Generate distractors
    const otherAnswers = flashcards
      .filter((_, i) => i !== idx)
      .map((c) => c.answer);

    const optionSet = new Set<string>();
    optionSet.add(correctAnswer);

    otherAnswers.forEach((ans) => {
      if (optionSet.size < 4) optionSet.add(ans);
    });

    // Distractor fallbacks if not enough cards
    const distractors = [
      `Opposite mechanism to ${card.question.replace('What is ', '').replace('?', '')}`,
      `Secondary byproduct unrelated to primary process`,
      `Inhibitory condition that suppresses ${primaryTopic}`,
      `Standard alternative theoretical model`,
    ];

    distractors.forEach((d) => {
      if (optionSet.size < 4) optionSet.add(d);
    });

    const options = Array.from(optionSet).sort(() => 0.5 - Math.random());

    quiz.push({
      id: `qz-${qId++}`,
      question: card.question,
      options,
      correctAnswer,
      explanation: `Correct! ${card.answer}`,
      difficulty: card.difficulty,
    });
  });

  // Fill remaining quiz questions if targetQuizzes > flashcards length
  while (quiz.length < targetQuizzes) {
    const topic = primaryTopic;
    const correctAnswer = `${topic} plays a vital role in structured understanding of the subject.`;
    const options = [
      correctAnswer,
      `${topic} is an obsolete theory discarded in modern study.`,
      `${topic} only applies under sub-zero temperature conditions.`,
      `${topic} is strictly an artificial component with no real-world equivalent.`,
    ].sort(() => 0.5 - Math.random());

    quiz.push({
      id: `qz-${qId++}`,
      question: `Which statement accurately describes ${topic}?`,
      options,
      correctAnswer,
      explanation: `${topic} is a fundamental concept in the provided text.`,
      difficulty: getDiff(quiz.length),
    });
  }

  // 6. Generate MindMap Nodes
  const mindmap: MindMapNode[] = [
    { id: 'root', parent: null, label: title },
    { id: 'm1', parent: 'root', label: 'Core Definitions' },
    { id: 'm2', parent: 'root', label: 'Key Processes & Features' },
    { id: 'm3', parent: 'root', label: 'Applications & Insights' },
  ];

  if (flashcards[0]) {
    mindmap.push({ id: 'sub1', parent: 'm1', label: flashcards[0].question.replace('What is ', '').replace('?', '') });
  }
  if (flashcards[1]) {
    mindmap.push({ id: 'sub2', parent: 'm2', label: flashcards[1].question.slice(0, 30) });
  }
  if (flashcards[2]) {
    mindmap.push({ id: 'sub3', parent: 'm3', label: flashcards[2].question.slice(0, 30) });
  }

  // 7. Common Mistakes & Revision Tips
  const mistakes = [
    `Confusing primary definitions with secondary attributes.`,
    `Overlooking specific conditions required for the core process to occur.`,
    `Assuming single-variable causation instead of interrelated factors.`,
  ];

  const revisionTips = [
    `Active Recall: Cover the answer on each flashcard and state the definition out loud.`,
    `Spaced Repetition: Review hard difficulty items again in 24 hours.`,
    `Feynman Technique: Practice explaining ${title} in your own simple words.`,
  ];

  return {
    title,
    summary,
    flashcards,
    quiz,
    mindmap,
    keyPoints,
    mistakes,
    revisionTips,
  };
}
