import { useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { extractTextFromPdf } from '@/utils/pdfExtract'
import { generateStudyKit, processingStages } from '@/services/studyKitService'
import { saveHistoryItem } from '@/services/db'
import { hasApiKey } from '@/services/geminiService'
import ErrorBanner from '@/components/ErrorBanner'
import type { StudyMaterial } from '@/types'

type OutletCtx = { requestConnect: () => void }

export default function StudyInput() {
  const navigate = useNavigate()
  const { requestConnect } = useOutletContext<OutletCtx>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'text' | 'pdf'>('text')
  const [pastedText, setPastedText] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [extracting, setExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState<{ current: number; total: number } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState<unknown>(null)

  function handleFile(f: File | null) {
    setError(null)
    if (!f) return
    if (f.type !== 'application/pdf') {
      setError(new Error('Please upload a PDF file.'))
      return
    }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''))
  }

  async function handleGenerate() {
    setError(null)

    if (!hasApiKey()) {
      requestConnect()
      return
    }

    let rawText = ''
    let sourceType: StudyMaterial['sourceType'] = 'text'

    try {
      if (mode === 'pdf') {
        if (!file) {
          setError(new Error('Upload a PDF first, or switch to Paste Text.'))
          return
        }
        sourceType = 'pdf'
        setExtracting(true)
        rawText = await extractTextFromPdf(file, p => setExtractProgress({ current: p.currentPage, total: p.totalPages }))
        setExtracting(false)
        if (!rawText.trim()) {
          setError(new Error('No readable text was found in that PDF — it may be a scanned image. Try pasting the text instead.'))
          return
        }
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 40) {
          setError(new Error('Paste a bit more study material — at least a few sentences — so StudyFlow has something to work with.'))
          return
        }
        rawText = pastedText.trim()
      }

      setGenerating(true)
      const material: StudyMaterial = {
        title: title.trim() || 'Untitled study material',
        sourceType,
        rawText,
        fileName: file?.name
      }
      const kit = await generateStudyKit(material, s => setStage(s))
      await saveHistoryItem(kit)
      setGenerating(false)
      navigate('/study-kit', { state: { kitId: kit.id } })
    } catch (e) {
      setExtracting(false)
      setGenerating(false)
      setError(e)
    }
  }

  const busy = extracting || generating

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-ink-500 dark:text-ink-300 mb-6">
        Give StudyFlow some material and it'll build you a full study kit — summary, notes, concepts, quick revision,
        and more.
      </p>

      <div className="mb-5">
        <label className="block text-xs font-medium text-ink-500 dark:text-ink-300 mb-1.5">Title (optional)</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Operating Systems — Chapter 4: Deadlocks"
          className="w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper focus:border-signal-500 outline-none"
        />
      </div>

      <div className="flex gap-1 mb-4 rounded-lg bg-ink-50 dark:bg-ink-800 p-1 w-fit">
        <button
          onClick={() => setMode('text')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'text' ? 'bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper shadow-hairline' : 'text-ink-500 dark:text-ink-300'}`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setMode('pdf')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'pdf' ? 'bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper shadow-hairline' : 'text-ink-500 dark:text-ink-300'}`}
        >
          Upload PDF
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
          placeholder="Paste your notes, chapter, lecture content, or documentation here..."
          rows={12}
          className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-900 px-4 py-3.5 text-sm leading-relaxed text-ink-900 dark:text-paper focus:border-signal-500 outline-none resize-y"
        />
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0] ?? null) }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-signal-500 bg-signal-50 dark:bg-ink-800' : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ink-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
          </svg>
          {file ? (
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-paper">{file.name}</p>
              <p className="text-xs text-ink-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB · tap to replace</p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null) }}
                className="mt-2 text-xs text-bad hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-ink-900 dark:text-paper">Drag & drop a PDF, or tap to browse</p>
              <p className="text-xs text-ink-400 mt-0.5">Text is extracted entirely in your browser</p>
            </div>
          )}
        </div>
      )}

      {error ? <div className="mt-4"><ErrorBanner error={error} /></div> : null}

      {extracting && (
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
          Reading PDF{extractProgress ? ` — page ${extractProgress.current} of ${extractProgress.total}` : '...'}
        </p>
      )}
      {generating && (
        <p className="mt-4 text-sm text-signal-600 flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-signal-300 border-t-signal-600 animate-spin" />
          {stage || processingStages[0]}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={busy}
        className="mt-6 w-full sm:w-auto rounded-lg bg-ink-900 dark:bg-signal-500 text-paper px-6 py-3 text-sm font-medium hover:bg-ink-800 dark:hover:bg-signal-600 disabled:opacity-50 transition-colors"
      >
        {busy ? 'Working...' : 'Generate Study Kit'}
      </button>
    </div>
  )
}
