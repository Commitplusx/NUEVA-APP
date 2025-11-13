const CACHE_NAME = 'estrella-delivery-cache-v2'; // Incremented version
const APP_SHELL_URLS = [
  '/index.html',
  '/'
];

// Install: Cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch: Serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and requests to external services like Supabase/Twilio
  if (request.method !== 'GET' || request.url.includes('supabase.co') || request.url.includes('twilio.com')) {
    // Let the browser handle it by not calling event.respondWith
    return;
  }

  // For navigation requests (HTML), use a network-first strategy.
  // This ensures users always get the latest version of the app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If fetch fails (offline), serve the cached index.html as a fallback for any route.
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, etc.), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // If we have a cached response, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network, cache it, and then return it.
      return fetch(request).then((networkResponse) => {
        // Clone the response because it's a one-time-use stream.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});
