import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your GitHub repo name exactly, e.g. '/studyflow-ai/'
// If deploying to a user/organization root page (username.github.io), set base to '/'
export default defineConfig({
  base: '/studyflow-ai/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
