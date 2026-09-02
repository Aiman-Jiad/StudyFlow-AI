import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import ApiKeyModal from '@/components/ApiKeyModal'
import { useApiKey } from '@/hooks/useApiKey'
import { useTheme } from '@/hooks/useTheme'

const TITLES: Record<string, string> = {
  '/': 'Study',
  '/study-kit': 'Study Kit',
  '/quiz': 'Quiz',
  '/flashcards': 'Flashcards',
  '/code-lab': 'Code Lab',
  '/practice': 'Practice Helper',
  '/history': 'History',
  '/settings': 'Settings'
}

export default function AppShell() {
  const { connected, save } = useApiKey()
  const { theme, setTheme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] ?? 'StudyFlow AI'

  function cycleTheme() {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
  }

  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 px-4 sm:px-8 py-4 shrink-0">
          <h1 className="font-display text-lg sm:text-xl font-medium text-ink-900 dark:text-paper">{title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="rounded-md p-2 text-ink-400 hover:text-ink-900 dark:hover:text-paper hover:bg-ink-50 dark:hover:bg-ink-800"
              title={`Theme: ${theme}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              ) : theme === 'light' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              )}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${
                connected
                  ? 'border-good/30 text-good bg-good/5'
                  : 'border-amber-500/40 text-amber-600 bg-amber-100/50'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-good' : 'bg-amber-500'}`} />
              {connected ? 'AI Connected' : 'Connect AI'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-8 py-6 pb-24 md:pb-6">
          <Outlet context={{ requestConnect: () => setModalOpen(true) }} />
        </main>
      </div>

      <ApiKeyModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={key => { save(key); setModalOpen(false) }} />
    </div>
  )
}
