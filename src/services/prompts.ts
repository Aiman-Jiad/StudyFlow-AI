// Specialized prompt builders. Each feature gets its own prompt so the AI is
// steered toward the specific job that section needs to do, rather than one
// generic "do everything" instruction.

const TEACHER_VOICE = `You are an expert university-level tutor, especially strong in Computer Science.
You explain concepts by analyzing ideas, relationships, exceptions and applications -
you never just copy or lightly reword sentences from the source material.`

export function summaryPrompt(text: string, length: 'short' | 'medium' | 'detailed') {
  const target =
    length === 'short' ? '3-5 sentences, the absolute core idea only'
    : length === 'medium' ? '2-3 short paragraphs covering the main ideas and how they connect'
    : '4-6 paragraphs covering main ideas, how they connect, and why they matter'
  return `${TEACHER_VOICE}

Write a ${length} summary (${target}) of the study material below.
Explain the main topic, highlight the most important ideas, preserve technical accuracy, and avoid repeating the same point twice.
Return plain markdown text only, no preamble like "Here is a summary".

STUDY MATERIAL:
"""
${text}
"""`
}

export function understandingPrompt(text: string, mode: 'default' | 'differently' | 'example' | 'beginner', priorExplanation?: string) {
  const modeInstruction =
    mode === 'differently' ? 'The student did not understand the previous explanation. Explain the same concept again using a different approach, different analogy, and different structure.'
    : mode === 'example' ? 'Give one additional, concrete worked example that illustrates the concept, distinct from any example already given.'
    : mode === 'beginner' ? "Re-explain assuming the student has almost no background. Use very simple language and a everyday analogy before introducing technical terms."
    : 'Teach the concept as a great teacher would.'

  return `${TEACHER_VOICE}

${modeInstruction}

Structure the explanation with:
- A simple explanation in plain language
- A step-by-step breakdown
- At least one worked example
- A real-world application
- Important exceptions or edge cases
- A common misunderstanding students have, and why it's wrong

${priorExplanation ? `PREVIOUS EXPLANATION (for context, do not repeat it verbatim):\n"""\n${priorExplanation}\n"""\n` : ''}

STUDY MATERIAL:
"""
${text}
"""

Return markdown only.`
}

export function notesPrompt(text: string) {
  return `${TEACHER_VOICE}

Create structured, well-formatted study notes from the material below. Do not dump raw text - organize it.
Use:
- ## Headings and ### subheadings for topics/subtopics
- Bullet points for lists
- **Definitions** clearly marked
- Short examples inline
- > blockquotes for important warnings or exceptions the student must not miss

Return markdown only, no preamble.

STUDY MATERIAL:
"""
${text}
"""`
}

export function conceptsPrompt(text: string) {
  return `${TEACHER_VOICE}

Identify the genuinely important concepts a student MUST understand from this material (not just any noun mentioned).
For each concept, decide an importance level: "essential" (core to the topic), "important" (needed for full understanding), or "useful" (supporting/context).

Return ONLY valid JSON matching this TypeScript type, nothing else:
{ "concepts": { "name": string, "importance": "essential" | "important" | "useful", "explanation": string }[] }

Aim for 6-12 concepts. Keep each explanation to 1-2 sentences.

STUDY MATERIAL:
"""
${text}
"""`
}

export function quickRevisionPrompt(text: string) {
  return `${TEACHER_VOICE}

Create an extremely concise quick-revision sheet for last-minute review before a quiz or exam.
Include only: key points, formulas/rules if any, important exceptions, and things students commonly forget or get wrong.
Be terse. Use short bullet points. Do not pad it. Return markdown only.

STUDY MATERIAL:
"""
${text}
"""`
}

export function examQuestionsPrompt(text: string, alreadyUsed: string[], countPerDifficulty = 3) {
  return `${TEACHER_VOICE}

Write exam-style questions that test genuine understanding, not memorized recall. Do NOT lightly reword sentences from the source
text into questions - invent scenarios, applications, and edge cases that require reasoning about the material.

Cover a mix of these question types: short-answer, long-answer, conceptual, application, scenario, tricky.
Write ${countPerDifficulty} questions at EACH difficulty: easy, medium, hard, master (${countPerDifficulty * 4} total).

${alreadyUsed.length > 0 ? `These concepts/angles were already used - write DIFFERENT ones, new scenarios, new wording:\n${alreadyUsed.map(s => `- ${s}`).join('\n')}\n` : ''}

Return ONLY valid JSON matching this type, nothing else:
{ "questions": { "type": "short-answer"|"long-answer"|"conceptual"|"application"|"scenario"|"tricky", "difficulty": "easy"|"medium"|"hard"|"master", "question": string, "guidance": string }[] }
"guidance" is a 1-2 sentence note on what a strong answer should cover (not the full answer).

STUDY MATERIAL:
"""
${text}
"""`
}

export function quizPrompt(text: string, alreadyUsed: string[], countPerDifficulty = 3) {
  return `${TEACHER_VOICE}

Design an intelligent multiple-choice quiz that tests conceptual understanding, application, problem solving,
edge cases, exceptions, and common misconceptions - NOT "which sentence matches the notes" recall questions.

Write ${countPerDifficulty} questions at EACH difficulty: easy, medium, hard, master (${countPerDifficulty * 4} total).
Each question needs exactly 4 options with exactly one correct answer. Distractors should be plausible
(often based on the common misconception), not obviously wrong.

${alreadyUsed.length > 0 ? `These concepts/question angles were already used this session - generate NEW concepts, scenarios, misconceptions, or wording instead of repeating them:\n${alreadyUsed.map(s => `- ${s}`).join('\n')}\n` : ''}

Return ONLY valid JSON matching this type, nothing else:
{
  "questions": {
    "concept": string,
    "difficulty": "easy"|"medium"|"hard"|"master",
    "question": string,
    "options": [string, string, string, string],
    "correctIndex": 0|1|2|3,
    "explanation": string,
    "whyOthersWrong": string
  }[]
}

STUDY MATERIAL:
"""
${text}
"""`
}

export function flashcardsPrompt(text: string, count = 14) {
  return `${TEACHER_VOICE}

Create ${count} flashcards from this material. Fronts should be a concept, term, or question. Backs should be a clear,
complete-but-concise answer or explanation (not just one word unless the front truly warrants it).
Cover the range of important concepts, not just the first few paragraphs.

Return ONLY valid JSON matching this type, nothing else:
{ "flashcards": { "front": string, "back": string }[] }

STUDY MATERIAL:
"""
${text}
"""`
}
