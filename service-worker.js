// Smilance Progressive Web App (PWA) Automated Offline Service Worker
// Merges offline caching shells, dynamic fetch interceptors, and robust push notifications.

const CACHE_NAME = 'smilance-offline-cache-v4';

// Helper to determine if current time (IST) is within September (Birthday Month)
const isSeptemberMonth = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return ist.getMonth() === 8; // Month index 8 is September
};

// Core static assets to precache immediately on install
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'favicon.svg',
  'smilance-192.png',
  'smilance-512.png',
  'smilance-bday-192.png',
  'smilance-bday-512.png',
  'smilance-default-192.png',
  'smilance-default-512.png'
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
  // Do not intercept non-GET API, non-http(s) requests (e.g. chrome-extension://), or DB syncing requests
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http') ||
    event.request.url.includes('kvdb.io')
  ) {
    return;
  }

  // Dynamic Birthday Month icon routing
  const requestUrl = event.request.url;
  if (requestUrl.includes('smilance-192.png') || requestUrl.includes('smilance-512.png')) {
    const isBday = isSeptemberMonth();
    const is512 = requestUrl.includes('512');
    const targetAsset = isBday 
      ? (is512 ? 'smilance-bday-512.png' : 'smilance-bday-192.png')
      : (is512 ? 'smilance-default-512.png' : 'smilance-default-192.png');

    event.respondWith(
      caches.match(targetAsset).then((cached) => {
        return cached || fetch(targetAsset).catch(() => caches.match(event.request));
      })
    );
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
  const isBday = isSeptemberMonth();
  const notificationIcon = isBday ? 'smilance-bday-192.png' : 'smilance-default-192.png';

  let data = {
    title: 'Smilance 💖',
    body: 'Daily check-in reminder for Smiley!',
    icon: notificationIcon,
    badge: notificationIcon,
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

  const targetUrl = event.notification.data?.url || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and tell it to navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetUrl) {
            client.postMessage({
              type: 'navigate',
              url: targetUrl
            });
          }
          return;
        }
      }
      
      // If no window is open, open a new one with the targetUrl
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
