import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Study', icon: 'M12 4v16m8-8H4' },
  { to: '/study-kit', label: 'Study Kit', icon: 'M4 6h16M4 12h16M4 18h7' },
  { to: '/quiz', label: 'Quiz', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { to: '/flashcards', label: 'Flashcards', icon: 'M3 10h18M3 14h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z' },
  { to: '/code-lab', label: 'Code Lab', icon: 'M8 9l-3 3 3 3m8-6l3 3-3 3M13 6l-2 12' },
  { to: '/practice', label: 'Practice Helper', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a4 4 0 115.657 0A6 6 0 0012 20a6 6 0 00-1.121-3.464z' },
  { to: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/settings', label: 'Settings', icon: 'M10.325 4.317a1 1 0 011.35-1.35l.395.153a1 1 0 01.632.632l.153.395a1 1 0 001.35.632l.395-.153a1 1 0 011.244.415l.415 1.244a1 1 0 00.632 1.35l.395.153a1 1 0 01.632 1.35l-.153.395a1 1 0 00.632 1.35l.395.153a1 1 0 01.415 1.244l-1.244.415a1 1 0 00-1.35.632l-.153.395a1 1 0 01-1.35.632l-.395-.153a1 1 0 00-1.35.632' }
]

export default function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col border-r border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-900 shrink-0">
        <div className="px-5 py-6">
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-paper leading-none">StudyFlow</p>
          <p className="font-mono text-[11px] tracking-wide text-signal-600 mt-0.5">AI</p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-signal-50 text-signal-700 dark:bg-ink-800 dark:text-signal-400'
                    : 'text-ink-500 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-paper'
                }`
              }
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav — only the most important actions, per spec */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-ink-100 dark:border-ink-800 bg-paper-100/95 dark:bg-ink-900/95 backdrop-blur px-1 py-1.5">
        {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[6]].map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
                isActive ? 'text-signal-600' : 'text-ink-400 dark:text-ink-400'
              }`
            }
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
