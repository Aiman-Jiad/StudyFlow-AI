export default function ComingSoon({ feature, phase }: { feature: string; phase: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto">
      <div className="h-12 w-12 rounded-full bg-signal-50 dark:bg-ink-800 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-signal-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-display text-lg font-medium text-ink-900 dark:text-paper mb-1.5">{feature} is on the way</h2>
      <p className="text-sm text-ink-500 dark:text-ink-300">
        This ships in {phase} of StudyFlow AI. Phase 1 covers Study Input, Summary, Understanding, Notes,
        Important Concepts, and Quick Revision — plus the History and Settings that everything else builds on.
      </p>
    </div>
  )
}
