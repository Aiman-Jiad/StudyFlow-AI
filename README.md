# StudyFlow AI

An AI-powered study workspace. Paste notes or upload a PDF, and StudyFlow generates a
Study Kit — summary, understanding, structured notes, important concepts, and quick
revision — using your own Google Gemini API key.

> **Status: Phase 1** of 5. This phase covers Study Input, the core Study Kit
> (Summary / Understanding / Notes / Important Concepts / Quick Revision), History, and
> Settings. Quiz, Flashcards, Code Lab, and Practice Helper are stubbed with an honest
> "coming soon" screen and arrive in later phases — see the roadmap at the bottom.

## How this deploys (read this first)

This project **does not require you to run a build locally**. A GitHub Actions workflow
(`.github/workflows/deploy.yml`) builds the app and publishes it to GitHub Pages
automatically every time you push to `main`. You can do everything — edit files, commit,
push — from the GitHub website or GitHub mobile app.

### One-time setup on GitHub

1. Create a new repository and upload this entire folder structure to it (keep the
   folders — `.github/`, `src/`, `public/` — intact).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open `vite.config.ts` and set `base` to match your repo name exactly, e.g. if your
   repo is `github.com/you/studyflow-ai`, keep `base: '/studyflow-ai/'`. If you're
   deploying to a root user/org page (`you.github.io`), set `base: '/'`.
5. Push to `main` (or make any commit). Check the **Actions** tab — the "Deploy to
   GitHub Pages" workflow will run `npm ci` and `npm run build` for you and publish the
   result. Your site will be live at the URL shown in that workflow run.

No local Node.js, npm, or terminal is required at any point.

## Local development (optional, if you do have Node.js)

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # production build to ./dist
npm run preview  # preview the production build locally
```

## Setting up your Gemini API key

StudyFlow needs a Google Gemini API key to generate content:

1. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Open the deployed app, click **Connect AI** (top right), paste the key, and click
   **Connect**.
3. The key is stored only in your browser's local storage — it is never committed to
   the repo, never sent to any server other than Google's Gemini API directly from your
   browser.

## Architecture

```
src/
  components/     Reusable UI (CopyButton, ErrorBanner, ApiKeyModal, layout/)
  pages/          One file per route (StudyInput, StudyKitPage, History, Settings...)
  services/       geminiService (API calls), prompts (per-feature prompts),
                  studyKitService (orchestration), db (IndexedDB via idb)
  hooks/          useApiKey, useTheme
  utils/          pdfExtract (PDF.js), clipboard
  types/          Shared TypeScript types
```

- **AI calls** all go through `src/services/geminiService.ts` — a single centralized
  service every feature uses, so there's one place that handles missing keys, invalid
  keys, rate limits, and network errors.
- **Prompts** live in `src/services/prompts.ts`, one specialized prompt per feature
  (summary, notes, concepts, quiz, etc.) rather than one generic prompt.
- **History** persists to IndexedDB (`src/services/db.ts`) and survives refreshes and
  browser restarts.
- **Routing** uses `HashRouter` so refreshing a deep link (e.g. `#/study-kit`) works
  correctly on GitHub Pages without a custom 404 redirect.

## Roadmap

- **Phase 2** — Exam Questions (with repetition tracking) + PDF export of the full
  Study Kit.
- **Phase 3** — Intelligent Quiz: MCQ generation, scoring, understanding score (0–10),
  strong/weak area detection.
- **Phase 4** — Flashcards (flip, shuffle, known/learning/needs-revision), Code Lab
  (Monaco editor, JS/HTML execution, AI code explanation), Practice Helper (Hint /
  Guided / Full Explanation modes).
- **Phase 5** — Polish pass: accessibility audit, responsive edge cases, empty/loading
  state refinement.
