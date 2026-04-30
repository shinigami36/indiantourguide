import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    // Split vendor libs into long-cacheable chunks. The app code changes
    // every deploy, but react/i18next almost never do — separating them
    // means returning visitors re-download only ~a few KB of app JS
    // instead of the full ~135KB bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
})
