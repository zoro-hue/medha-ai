/**
 * Prompt Engineering Module
 *
 * Constructs prompts that force the LLM to return strict JSON matching our Zod schema.
 * Uses explicit schema definition, examples, and negative constraints to maximize
 * structured output reliability across different providers.
 */

interface PromptOptions {
  flashcardCount?: number;
  quizCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  language?: string;
}

const DEFAULT_OPTIONS: Required<PromptOptions> = {
  flashcardCount: 10,
  quizCount: 5,
  difficulty: 'mixed',
  language: 'English',
};

/**
 * System prompt that establishes the AI's role and output constraints.
 * This is sent as the system/developer message to enforce behavior.
 */
export function getSystemPrompt(): string {
  return `You are Medhā AI, an expert educational content generator.

CRITICAL RULES:
1. You MUST respond with ONLY valid JSON. No markdown, no explanations, no code fences, no text before or after the JSON.
2. Your response must start with { and end with }.
3. Every string value must be properly escaped.
4. Never use trailing commas.
5. All IDs must be unique strings in the format "fc_1", "fc_2" for flashcards and "q_1", "q_2" for quiz questions and "mm_1", "mm_2" for mindmap nodes.
6. The "correctAnswer" in quiz questions MUST exactly match one of the "options" strings.
7. The root mindmap node MUST have "parent": null.
8. Generate educational content that is accurate, clear, and pedagogically sound.
9. Vary the difficulty across easy, medium, and hard unless instructed otherwise.
10. Do NOT include any explanatory text outside the JSON object.`;
}

/**
 * Builds the user prompt with the study content and generation parameters.
 * Includes the exact JSON schema the model must follow.
 */
export function buildGenerationPrompt(content: string, options?: PromptOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return `Analyze the following study material and generate structured learning content.

STUDY MATERIAL:
"""
${content}
"""

GENERATION PARAMETERS:
- Generate exactly ${opts.flashcardCount} flashcards
- Generate exactly ${opts.quizCount} quiz questions (multiple choice with 4 options each)
- Difficulty distribution: ${opts.difficulty}
- Language: ${opts.language}

REQUIRED JSON SCHEMA (follow this EXACTLY):
{
  "title": "string — concise title for this study set",
  "summary": "string — 2-3 sentence overview of the material",
  "flashcards": [
    {
      "id": "fc_1",
      "question": "string — clear question",
      "answer": "string — concise but complete answer",
      "difficulty": "easy" | "medium" | "hard",
      "hint": "string — optional hint",
      "tags": ["string — topic tags"]
    }
  ],
  "quiz": [
    {
      "id": "q_1",
      "question": "string — clear question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "string — MUST exactly match one of the options",
      "explanation": "string — why the correct answer is right",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "mindmap": [
    {
      "id": "mm_1",
      "parent": null,
      "label": "Root Topic"
    },
    {
      "id": "mm_2",
      "parent": "mm_1",
      "label": "Sub Topic"
    }
  ],
  "keyPoints": ["string — important concept or fact"],
  "mistakes": ["string — common mistake students make"],
  "revisionTips": ["string — actionable study tip"]
}

RESPOND WITH ONLY THE JSON OBJECT. No other text.`;
}
