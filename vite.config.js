import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      // proxy exactly /api/streamers
      '/api/streamers': {
        target: 'https://twitch-api.hypersmmo.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path, // keep /api/streamers path
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          jszip: ['jszip'],
        },
      },
    },
  },
}))
