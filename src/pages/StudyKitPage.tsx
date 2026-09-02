import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getHistoryItem, updateHistoryItem } from '@/services/db'
import { regenerateSummary, reExplain } from '@/services/studyKitService'
import CopyButton from '@/components/CopyButton'
import ErrorBanner from '@/components/ErrorBanner'
import type { StudyKit, SummaryLength, ConceptImportance } from '@/types'

const TABS = ['Summary', 'Understanding', 'Notes', 'Important Concepts', 'Quick Revision'] as const
type Tab = (typeof TABS)[number]

const IMPORTANCE_STYLE: Record<ConceptImportance, string> = {
  essential: 'bg-bad/10 text-bad border-bad/30',
  important: 'bg-amber-100 text-amber-600 border-amber-500/30',
  useful: 'bg-signal-50 text-signal-600 border-signal-500/20'
}

export default function StudyKitPage() {
  const location = useLocation() as { state?: { kitId?: string } }
  const navigate = useNavigate()
  const [kit, setKit] = useState<StudyKit | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('Summary')
  const [error, setError] = useState<unknown>(null)

  const [summaryLen, setSummaryLen] = useState<SummaryLength>('medium')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [explainLoading, setExplainLoading] = useState<string | null>(null)

  useEffect(() => {
    const kitId = location.state?.kitId
    if (!kitId) {
      setLoading(false)
      return
    }
    getHistoryItem(kitId).then(item => {
      setKit(item?.studyKit ?? null)
      setLoading(false)
    })
  }, [location.state])

  async function persist(updated: StudyKit) {
    setKit(updated)
    await updateHistoryItem(updated)
  }

  async function handleSummaryLength(len: SummaryLength) {
    if (!kit) return
    setSummaryLen(len)
    const field = len === 'short' ? 'summaryShort' : len === 'medium' ? 'summaryMedium' : 'summaryDetailed'
    if (kit[field]) return
    setError(null)
    setSummaryLoading(true)
    try {
      const text = await regenerateSummary(kit, len)
      await persist({ ...kit, [field]: text })
    } catch (e) {
      setError(e)
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleReExplain(mode: 'differently' | 'example' | 'beginner') {
    if (!kit) return
    setError(null)
    setExplainLoading(mode)
    try {
      const addition = await reExplain(kit, mode)
      const merged = `${kit.understanding}\n\n---\n\n${addition}`
      await persist({ ...kit, understanding: merged })
    } catch (e) {
      setError(e)
    } finally {
      setExplainLoading(null)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto animate-pulse space-y-3">
      <div className="h-4 w-1/3 bg-ink-100 dark:bg-ink-800 rounded" />
      <div className="h-32 bg-ink-100 dark:bg-ink-800 rounded-xl" />
    </div>
  }

  if (!kit) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-sm text-ink-500 dark:text-ink-300 mb-4">
          No Study Kit is open. Generate one from Study, or pick one up from History.
        </p>
        <button onClick={() => navigate('/')} className="rounded-lg bg-ink-900 dark:bg-signal-500 text-paper px-5 py-2.5 text-sm font-medium">
          Go to Study
        </button>
      </div>
    )
  }

  const summaryText = summaryLen === 'short' ? kit.summaryShort : summaryLen === 'medium' ? kit.summaryMedium : kit.summaryDetailed

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-wide text-signal-600 mb-1">STUDYFLOW AI · STUDY KIT</p>
        <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-paper">{kit.title}</h2>
        <p className="text-xs text-ink-400 mt-1">
          {new Date(kit.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {kit.sourceType === 'pdf' ? 'From PDF' : 'From pasted text'}
        </p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin border-b border-ink-100 dark:border-ink-800">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-signal-500 text-ink-900 dark:text-paper' : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? <div className="mb-4"><ErrorBanner error={error} /></div> : null}

      {tab === 'Summary' && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1 rounded-lg bg-ink-50 dark:bg-ink-800 p-1 w-fit">
              {(['short', 'medium', 'detailed'] as SummaryLength[]).map(len => (
                <button
                  key={len}
                  onClick={() => handleSummaryLength(len)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    summaryLen === len ? 'bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper shadow-hairline' : 'text-ink-500 dark:text-ink-300'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
            {summaryText && <CopyButton text={summaryText} />}
          </div>
          {summaryLoading ? (
            <SkeletonLines />
          ) : (
            <Prose>{summaryText || 'No summary generated for this length yet.'}</Prose>
          )}
        </section>
      )}

      {tab === 'Understanding' && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2">
              <QuickAction label="Explain differently" loading={explainLoading === 'differently'} onClick={() => handleReExplain('differently')} />
              <QuickAction label="Give me an example" loading={explainLoading === 'example'} onClick={() => handleReExplain('example')} />
              <QuickAction label="Explain like I'm a beginner" loading={explainLoading === 'beginner'} onClick={() => handleReExplain('beginner')} />
            </div>
            <CopyButton text={kit.understanding} />
          </div>
          <Prose>{kit.understanding}</Prose>
        </section>
      )}

      {tab === 'Notes' && (
        <section>
          <div className="flex justify-end mb-3"><CopyButton text={kit.notes} /></div>
          <Prose>{kit.notes}</Prose>
        </section>
      )}

      {tab === 'Important Concepts' && (
        <section className="space-y-3">
          <div className="flex justify-end">
            <CopyButton text={kit.concepts.map(c => `${c.name} (${c.importance}): ${c.explanation}`).join('\n')} />
          </div>
          {kit.concepts.map((c, i) => (
            <div key={i} className="rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-ink-900 dark:text-paper text-sm">{c.name}</h3>
                <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border ${IMPORTANCE_STYLE[c.importance]}`}>
                  {c.importance}
                </span>
              </div>
              <p className="text-sm text-ink-500 dark:text-ink-300 leading-relaxed">{c.explanation}</p>
            </div>
          ))}
        </section>
      )}

      {tab === 'Quick Revision' && (
        <section>
          <div className="flex justify-end mb-3"><CopyButton text={kit.quickRevision} /></div>
          <Prose>{kit.quickRevision}</Prose>
        </section>
      )}
    </div>
  )
}

function Prose({ children }: { children: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-p:leading-relaxed prose-a:text-signal-600">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}

function SkeletonLines() {
  return (
    <div className="space-y-2.5 animate-pulse">
      <div className="h-3.5 bg-ink-100 dark:bg-ink-800 rounded w-full" />
      <div className="h-3.5 bg-ink-100 dark:bg-ink-800 rounded w-11/12" />
      <div className="h-3.5 bg-ink-100 dark:bg-ink-800 rounded w-4/5" />
    </div>
  )
}

function QuickAction({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-full border border-ink-200 dark:border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-600 dark:text-ink-300 hover:border-signal-400 hover:text-signal-600 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Thinking...' : label}
    </button>
  )
}
