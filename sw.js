// 游导学习笔记 Service Worker
const CACHE_NAME = 'youdao-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/travel-knowledge.html',
  '/exam-simulator.html',
  '/wrong-questions.html',
  '/free-materials.html',
  '/ai-assistant.html',
  '/interview.html',
  '/flashcard.html',
  '/study-roadmap.html',
  '/search.html',
  '/mistakes.html',
  '/after-pass.html',
  '/resources.html',
  '/chat.html',
  '/exam-guide.html',
  '/guides.html',
  '/travel-tools.html',
  '/voice.html',
  '/province-exam.html',
  '/privacy.html',
  '/404.html',
  '/css/style.css',
  '/search-index.json',
  '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(event.request).then(response => {
      // Clone and cache successful responses
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => {
      // Network failed, try cache
      return caches.match(event.request).then(cached => {
        return cached || caches.match('/index.html');
      });
    })
  );
});
