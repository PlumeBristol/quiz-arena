import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` makes asset URLs work when the app is served from a subpath like
// https://plumebristol.github.io/quiz-arena/. Locally we still build against `/`.
export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES ? '/quiz-arena/' : '/',
  server: { port: 5200 }
})
