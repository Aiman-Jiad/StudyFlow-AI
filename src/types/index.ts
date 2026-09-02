// ---------- Source material ----------
export type SourceType = 'pdf' | 'text'

export interface StudyMaterial {
  title: string
  sourceType: SourceType
  rawText: string
  fileName?: string
}

// ---------- Important concepts ----------
export type ConceptImportance = 'essential' | 'important' | 'useful'

export interface ImportantConcept {
  name: string
  importance: ConceptImportance
  explanation: string
}

// ---------- Exam questions ----------
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'master'
export type ExamQuestionType =
  | 'short-answer'
  | 'long-answer'
  | 'conceptual'
  | 'application'
  | 'scenario'
  | 'tricky'

export interface ExamQuestion {
  id: string
  type: ExamQuestionType
  difficulty: QuestionDifficulty
  question: string
  guidance: string
}

// ---------- Quiz ----------
export interface QuizQuestion {
  id: string
  concept: string
  difficulty: QuestionDifficulty
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  whyOthersWrong: string
}

export interface QuizAnswer {
  questionId: string
  selectedIndex: number
  correct: boolean
}

export interface QuizResult {
  answers: QuizAnswer[]
  score: number
  total: number
  percentage: number
  difficultyBreakdown: Record<QuestionDifficulty, { correct: number; total: number }>
  understandingScore: number // 0-10
  strongAreas: string[]
  weakAreas: string[]
  topicsToReviewDeeply: string[]
  completedAt: string
}

// ---------- Flashcards ----------
export type FlashcardStatus = 'unseen' | 'known' | 'learning' | 'needs-revision'

export interface Flashcard {
  id: string
  front: string
  back: string
  status: FlashcardStatus
}

// ---------- Study Kit ----------
export interface StudyKit {
  id: string
  title: string
  sourceType: SourceType
  createdAt: string
  rawText: string

  summaryShort: string
  summaryMedium: string
  summaryDetailed: string

  understanding: string
  notes: string
  concepts: ImportantConcept[]
  quickRevision: string
  examQuestions: ExamQuestion[]
  quizQuestions: QuizQuestion[]
  flashcards: Flashcard[]

  usedQuestionSignatures: string[]
  quizResults: QuizResult[]
}

// ---------- History ----------
export interface HistoryItem {
  id: string
  title: string
  createdAt: string
  sourceType: SourceType
  studyKit: StudyKit
}

// ---------- AI service ----------
export type SummaryLength = 'short' | 'medium' | 'detailed'

export interface AIServiceError {
  kind: 'missing-key' | 'invalid-key' | 'rate-limit' | 'network' | 'malformed' | 'unknown'
  message: string
}

export class AppError extends Error {
  kind: AIServiceError['kind']
  constructor(kind: AIServiceError['kind'], message: string) {
    super(message)
    this.kind = kind
  }
}
