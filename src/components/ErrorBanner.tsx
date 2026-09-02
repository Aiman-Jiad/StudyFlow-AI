import { AppError } from '@/types'

export default function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null

  const message =
    error instanceof AppError
      ? error.message
      : 'Something unexpected went wrong. Please try again.'

  return (
    <div className="flex items-start gap-3 rounded-lg border border-bad/30 bg-bad/5 px-4 py-3 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bad shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div className="flex-1">
        <p className="text-ink-900 dark:text-paper">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-1.5 text-xs font-medium text-signal-600 hover:underline">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
