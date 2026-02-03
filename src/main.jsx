import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminProvider } from './context/AdminContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Prefetch database on app mount
queryClient.prefetchQuery({
  queryKey: ['database'],
  queryFn: () =>
    fetch('https://adminpage.hypersmmo.workers.dev/admin/database').then(r => r.json()),
})

// SPA redirect restore for GitHub Pages with subdirectory support
;(function () {
  const l = window.location
  // Check if we have a redirect encoded in the URL (from 404.html)
  if (l.search[1] === '/' ) {
    const decoded = l.search.slice(1)
      .split('&').map(s => s.replace(/~and~/g, '&'))
      .join('?')
    window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash)
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/synergy-shiny-showcase">
        <AdminProvider>
          <App />
        </AdminProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
