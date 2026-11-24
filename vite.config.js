import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

const TEAM_B_API = 'https://course-prereq-team3.fastapicloud.dev'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || TEAM_B_API

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Team B's API has no CORS headers, so the browser calls these paths
        // on this dev server and Vite forwards them.
        '/courses': { target, changeOrigin: true },
        '/prereq-graph': { target, changeOrigin: true },
      },
    },
  }
})
