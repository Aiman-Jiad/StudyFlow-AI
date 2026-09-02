import { useState } from 'react'
import { validateApiKey } from '@/services/geminiService'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (key: string) => void
}

export default function ApiKeyModal({ open, onClose, onSave }: Props) {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'checking' | 'invalid'>('idle')

  if (!open) return null

  async function handleConnect() {
    const trimmed = value.trim()
    if (!trimmed) return
    setStatus('checking')
    const ok = await validateApiKey(trimmed)
    if (!ok) {
      setStatus('invalid')
      return
    }
    onSave(trimmed)
    setValue('')
    setStatus('idle')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/40 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-paper-100 dark:bg-ink-800 rounded-t-2xl sm:rounded-xl shadow-hairline border border-ink-100 dark:border-ink-700 p-6">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-paper mb-1">Connect AI</h2>
        <p className="text-sm text-ink-500 dark:text-ink-300 mb-5">
          StudyFlow uses your own Google Gemini API key to generate content. Your key stays in this browser only —
          it is never sent anywhere except directly to Google's API.
        </p>

        <label className="block text-xs font-medium text-ink-500 dark:text-ink-300 mb-1.5" htmlFor="gemini-key">
          Gemini API key
        </label>
        <div className="relative mb-2">
          <input
            id="gemini-key"
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => {
              setValue(e.target.value)
              setStatus('idle')
            }}
            placeholder="AIza..."
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-paper dark:bg-ink-900 px-3 py-2.5 pr-16 text-sm text-ink-900 dark:text-paper focus:border-signal-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500 dark:text-ink-300 hover:text-signal-600"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>

        {status === 'invalid' && (
          <p className="text-xs text-bad mb-3">That key was rejected by Gemini. Double-check it and try again.</p>
        )}

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-signal-600 hover:underline"
        >
          Don't have a key? Get one free from Google AI Studio →
        </a>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={handleConnect}
            disabled={!value.trim() || status === 'checking'}
            className="flex-1 rounded-lg bg-ink-900 dark:bg-signal-500 text-paper py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-ink-800 dark:hover:bg-signal-600 transition-colors"
          >
            {status === 'checking' ? 'Checking key...' : 'Connect'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 dark:border-ink-600 px-4 py-2.5 text-sm font-medium text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
