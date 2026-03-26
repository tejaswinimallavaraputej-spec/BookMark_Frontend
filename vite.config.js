import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/register': 'http://localhost:9090',
      '/login': 'http://localhost:9090',
      '/bookmarks': 'http://localhost:9090',
    }
  }
})
