import { HashRouter, Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import StudyInput from '@/pages/StudyInput'
import StudyKitPage from '@/pages/StudyKitPage'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import ComingSoon from '@/pages/ComingSoon'

// HashRouter is used (not BrowserRouter) so client-side routes survive a hard
// refresh on GitHub Pages without needing a custom 404.html redirect trick.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<StudyInput />} />
          <Route path="study-kit" element={<StudyKitPage />} />
          <Route path="quiz" element={<ComingSoon feature="The Intelligent Quiz" phase="Phase 3" />} />
          <Route path="flashcards" element={<ComingSoon feature="Flashcards" phase="Phase 4" />} />
          <Route path="code-lab" element={<ComingSoon feature="Code Lab" phase="Phase 4" />} />
          <Route path="practice" element={<ComingSoon feature="Practice Helper" phase="Phase 4" />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
