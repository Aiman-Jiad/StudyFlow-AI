import { gemini } from './geminiService'
import * as prompts from './prompts'
import type { ImportantConcept, StudyKit, StudyMaterial, ExamQuestion, QuizQuestion, Flashcard } from '@/types'

function newId(): string {
  return crypto.randomUUID()
}

export const processingStages = [
  'Reading study material...',
  'Analyzing concepts...',
  'Finding important topics...',
  'Structuring your notes...',
  'Preparing your Study Kit...'
]

/** Generates the core Study Kit: summary, understanding, notes, concepts, quick revision. */
export async function generateStudyKit(
  material: StudyMaterial,
  onStage?: (stage: string) => void
): Promise<StudyKit> {
  const text = material.rawText

  onStage?.(processingStages[0])
  onStage?.(processingStages[1])
  const [summaryMedium, concepts] = await Promise.all([
    gemini.callGemini(prompts.summaryPrompt(text, 'medium')),
    gemini.callGeminiJSON<{ concepts: ImportantConcept[] }>(prompts.conceptsPrompt(text))
  ])

  onStage?.(processingStages[2])
  const understanding = await gemini.callGemini(prompts.understandingPrompt(text, 'default'))

  onStage?.(processingStages[3])
  const [notes, quickRevision] = await Promise.all([
    gemini.callGemini(prompts.notesPrompt(text)),
    gemini.callGemini(prompts.quickRevisionPrompt(text))
  ])

  onStage?.(processingStages[4])

  const kit: StudyKit = {
    id: newId(),
    title: material.title,
    sourceType: material.sourceType,
    createdAt: new Date().toISOString(),
    rawText: text,
    summaryShort: '',
    summaryMedium,
    summaryDetailed: '',
    understanding,
    notes,
    concepts: concepts.concepts ?? [],
    quickRevision,
    examQuestions: [],
    quizQuestions: [],
    flashcards: [],
    usedQuestionSignatures: [],
    quizResults: []
  }
  return kit
}

export async function regenerateSummary(kit: StudyKit, length: 'short' | 'medium' | 'detailed'): Promise<string> {
  return gemini.callGemini(prompts.summaryPrompt(kit.rawText, length))
}

export async function reExplain(
  kit: StudyKit,
  mode: 'differently' | 'example' | 'beginner'
): Promise<string> {
  return gemini.callGemini(prompts.understandingPrompt(kit.rawText, mode, kit.understanding))
}

export async function generateMoreExamQuestions(kit: StudyKit): Promise<ExamQuestion[]> {
  const usedSignatures = kit.examQuestions.map(q => `${q.type}/${q.difficulty}: ${q.question}`)
  const result = await gemini.callGeminiJSON<{ questions: Omit<ExamQuestion, 'id'>[] }>(
    prompts.examQuestionsPrompt(kit.rawText, usedSignatures)
  )
  return (result.questions ?? []).map(q => ({ ...q, id: newId() }))
}

export async function generateMoreQuizQuestions(kit: StudyKit): Promise<QuizQuestion[]> {
  const usedSignatures = kit.quizQuestions.map(q => `${q.concept}: ${q.question}`)
  const result = await gemini.callGeminiJSON<{ questions: Omit<QuizQuestion, 'id'>[] }>(
    prompts.quizPrompt(kit.rawText, usedSignatures)
  )
  return (result.questions ?? []).map(q => ({ ...q, id: newId() }))
}

export async function generateFlashcards(kit: StudyKit): Promise<Flashcard[]> {
  const result = await gemini.callGeminiJSON<{ flashcards: { front: string; back: string }[] }>(
    prompts.flashcardsPrompt(kit.rawText)
  )
  return (result.flashcards ?? []).map(f => ({ ...f, id: newId(), status: 'unseen' as const }))
}
