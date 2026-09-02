import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useApiKey } from '@/hooks/useApiKey'
import { useTheme, type ThemePreference } from '@/hooks/useTheme'
import { clearAllHistory } from '@/services/db'

type OutletCtx = { requestConnect: () => void }

export default function Settings() {
  const { connected, key, remove } = useApiKey()
  const { requestConnect } = useOutletContext<OutletCtx>()
  const { theme, setTheme } = useTheme()
  const [visible, setVisible] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)

  async function handleClearHistory() {
    await clearAllHistory()
    setConfirmClear(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const masked = key ? `${key.slice(0, 4)}${'•'.repeat(Math.max(key.length - 8, 4))}${key.slice(-4)}` : ''

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <section>
        <h2 className="font-display text-base font-medium text-ink-900 dark:text-paper mb-3">Gemini API key</h2>
        {connected ? (
          <div className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-mono text-ink-700 dark:text-ink-200">{visible ? key : masked}</p>
              <p className="text-xs text-good mt-1">Connected</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setVisible(v => !v)} className="text-xs font-medium text-ink-500 dark:text-ink-300 hover:text-signal-600">
                {visible ? 'Hide' : 'Show'}
              </button>
              <button onClick={remove} className="text-xs font-medium text-bad hover:underline">Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={requestConnect} className="rounded-lg bg-ink-900 dark:bg-signal-500 text-paper px-4 py-2.5 text-sm font-medium">
            Connect AI
          </button>
        )}
      </section>

      <section>
        <h2 className="font-display text-base font-medium text-ink-900 dark:text-paper mb-3">Appearance</h2>
        <div className="flex gap-1 rounded-lg bg-ink-50 dark:bg-ink-800 p-1 w-fit">
          {(['light', 'dark', 'system'] as ThemePreference[]).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                theme === t ? 'bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper shadow-hairline' : 'text-ink-500 dark:text-ink-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-base font-medium text-ink-900 dark:text-paper mb-3">Data</h2>
        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} className="text-sm font-medium text-bad hover:underline">
            Clear all history
          </button>
        ) : (
          <div className="rounded-lg border border-bad/30 bg-bad/5 px-4 py-3.5">
            <p className="text-sm text-ink-900 dark:text-paper mb-3">
              This permanently deletes every saved Study Kit on this device. This can't be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={handleClearHistory} className="rounded-md bg-bad text-paper px-3.5 py-1.5 text-xs font-medium">
                Yes, delete everything
              </button>
              <button onClick={() => setConfirmClear(false)} className="rounded-md border border-ink-200 dark:border-ink-600 px-3.5 py-1.5 text-xs font-medium text-ink-500 dark:text-ink-300">
                Cancel
              </button>
            </div>
          </div>
        )}
        {cleared && <p className="text-xs text-good mt-2">History cleared.</p>}
      </section>
    </div>
  )
}
