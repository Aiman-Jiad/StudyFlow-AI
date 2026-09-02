import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteHistoryItem, getAllHistory } from '@/services/db'
import type { HistoryItem } from '@/types'

export default function History() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    getAllHistory().then(all => {
      setItems(all)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  async function handleDelete(id: string) {
    await deleteHistoryItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
    setPendingDelete(null)
  }

  if (loading) return <div className="max-w-2xl mx-auto animate-pulse h-24 bg-ink-100 dark:bg-ink-800 rounded-xl" />

  return (
    <div className="max-w-2xl mx-auto">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search your history..."
        className="w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm mb-5 focus:border-signal-500 outline-none"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            {items.length === 0 ? "No Study Kits yet — generate one from Study." : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map(item => (
            <li key={item.id} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3.5 flex items-center justify-between gap-3">
              <button
                onClick={() => navigate('/study-kit', { state: { kitId: item.id } })}
                className="text-left flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-ink-900 dark:text-paper truncate">{item.title}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString()} · {item.sourceType === 'pdf' ? 'PDF' : 'Text'}
                </p>
              </button>

              {pendingDelete === item.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-medium text-bad hover:underline">Confirm</button>
                  <button onClick={() => setPendingDelete(null)} className="text-xs font-medium text-ink-400 hover:underline">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setPendingDelete(item.id)} className="shrink-0 text-ink-300 hover:text-bad p-1" aria-label="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
