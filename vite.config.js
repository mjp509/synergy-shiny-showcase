import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  server: {
    proxy: {
      '/database': {
        target: 'https://adminpage.hypersmmo.workers.dev/admin',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/database/, '/database'),
      },
      '/api/streamers': {
        target: 'https://twitch-api.hypersmmo.workers.dev',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/streamers/, '/api/streamers'),
      },
    },
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
