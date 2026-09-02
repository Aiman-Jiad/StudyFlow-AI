import { AppError } from '@/types'

const MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const STORAGE_KEY = 'studyflow.gemini.apiKey'

// ---------- API key management ----------
export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim())
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

/** Quick sanity check by asking Gemini a trivial question. */
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: OK' }] }]
      })
    })
    if (res.status === 400 || res.status === 403) return false
    return res.ok
  } catch {
    return false
  }
}

// ---------- Core call ----------
interface GenerateOptions {
  systemInstruction?: string
  json?: boolean
  temperature?: number
}

async function callGemini(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const key = getApiKey()
  if (!key) {
    throw new AppError('missing-key', 'No Gemini API key is connected yet. Add one in Settings to use AI features.')
  }

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.json ? { responseMimeType: 'application/json' } : {})
    }
  }
  if (opts.systemInstruction) {
    body.systemInstruction = { role: 'system', parts: [{ text: opts.systemInstruction }] }
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch {
    throw new AppError('network', 'Could not reach Gemini. Check your internet connection and try again.')
  }

  if (res.status === 400 || res.status === 403) {
    throw new AppError('invalid-key', 'Your Gemini API key was rejected. Double-check it in Settings.')
  }
  if (res.status === 429) {
    throw new AppError('rate-limit', "You've hit Gemini's rate limit. Wait a moment and try again.")
  }
  if (!res.ok) {
    throw new AppError('unknown', `Gemini returned an unexpected error (status ${res.status}). Please try again.`)
  }

  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n')
  if (!text) {
    throw new AppError('malformed', 'Gemini returned an empty response. Try again, or shorten your study material.')
  }
  return text
}

/** Calls Gemini and parses a JSON response, stripping stray markdown fences if present. */
async function callGeminiJSON<T>(prompt: string, opts: GenerateOptions = {}): Promise<T> {
  const raw = await callGemini(prompt, { ...opts, json: true })
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, '').trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new AppError('malformed', 'Gemini returned data StudyFlow could not read. Please try generating again.')
  }
}

export const gemini = { callGemini, callGeminiJSON }
