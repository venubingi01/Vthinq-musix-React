// Service Worker for Sangeetham PWA
const CACHE_NAME = 'sangeetham-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let audio and external APIs bypass caching to avoid streaming issues
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('saavn') ||
    url.hostname.includes('youtube') ||
    url.hostname.includes('googlevideo') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.mp3')
  ) {
    return;
  }

  // Network-first strategy for dynamic pages, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});
