import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Our FastAPI backend (catalog data).
        '/api': env.API_PROXY_TARGET || 'http://localhost:8000',
        // Team B's prerequisite graph service. It has no CORS setup, so the
        // browser reaches it through this proxy instead of calling it directly.
        '/prereq-graph': env.GRAPH_PROXY_TARGET || 'http://localhost:8001',
      },
    },
  }
})
