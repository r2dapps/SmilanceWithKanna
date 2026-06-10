// Smilance Progressive Web App (PWA) Automated Offline Service Worker
// Merges offline caching shells, dynamic fetch interceptors, and robust push notifications.

const CACHE_NAME = 'smilance-offline-cache-v2';

// Core static assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/smilance-192.png',
  '/smilance-512.png',
  '/public/favicon.svg',
  '/public/smilance-192.png',
  '/public/smilance-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Intelligent precaching of shell assets...');
        return cache.addAll(PRECACHE_ASSETS).catch((e) => {
          console.warn('[Service Worker] Some precache items skipped during install: ', e);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing legacy cache client:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache interceptor and network fallback strategy for offline stability
self.addEventListener('fetch', (event) => {
  // Do not intercept non-GET API or DB syncing requests (such as KVDB.io configuration updates)
  if (event.request.method !== 'GET' || event.request.url.includes('kvdb.io')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached copy, return it immediately, but update it in the background
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
            }
          })
          .catch(() => {
            // Silently absorb fetch failures (meaning device is offline)
          });
        return cachedResponse;
      }

      // If we don't have it cached, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // If valid, store a copy in the cache for subsequent offline sessions
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch((err) => {
          // If navigation request fails, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/') || caches.match('/index.html');
          }
          throw err;
        });
    })
  );
});

// 🔔 PWA Web Push Notification Receivers
self.addEventListener('push', (event) => {
  let data = {
    title: 'Smilance 💖',
    body: 'Daily check-in reminder for Smiley!',
    icon: 'smilance-192.png',
    badge: 'smilance-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      const parsedData = event.data.json();
      data = { ...data, ...parsedData };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: { url: data.url },
    actions: [
      { action: 'open', title: 'Open Smilance' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Action mapping on Push clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const targetUrl = event.notification.data?.url || './';
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
