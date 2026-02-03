const CACHE_NAME = 'synergy-showcase-v1'
const ASSETS_TO_CACHE = [
  '/synergy-shiny-showcase/',
  '/synergy-shiny-showcase/index.html',
  '/synergy-shiny-showcase/favicon.png',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache strategy for different asset types
  if (
    request.destination === 'image' ||
    request.url.includes('/assets/') ||
    request.url.includes('.png') ||
    request.url.includes('.jpg') ||
    request.url.includes('.gif') ||
    request.url.includes('.css') ||
    request.url.includes('.js')
  ) {
    // Cache first strategy for static assets
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
      })
    )
  } else if (url.hostname.includes('hypersmmo.workers.dev')) {
    // Network first for API calls
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request)
      })
    )
  } else {
    // Network first for HTML pages
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
  }
})
