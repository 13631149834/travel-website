// Service Worker for 游导学习笔记
const CACHE_NAME = 'youdao-travel-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/common.css',
  '/favicon.svg',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch with timeout - cache first for speed, network fallback with short timeout
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // If cached, return immediately + update cache in background
      if (cached) {
        // Background update (stale-while-revalidate)
        fetchWithTimeout(event.request, 5000).then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {});
        return cached;
      }
      
      // No cache: try network with 3s timeout
      return fetchWithTimeout(event.request, 3000)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, no cache either - return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('', { status: 408, statusText: 'Request timeout' });
        });
    })
  );
});

function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
