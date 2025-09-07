const CACHE_NAME = 'sadak-sathi-cache-v1';
const VERSION_URL = '/version.json';
let currentVersion = '1.0.5';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() =>
      caches.match('/offline.html')
    ))
  );
});

async function checkVersion() {
  try {
    const res = await fetch(VERSION_URL + '?t=' + Date.now());
    const data = await res.json();
    if (data.version !== currentVersion) {
      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({ type: 'NEW_VERSION', version: data.version })
      );
    }
  } catch (e) {
    console.error('Version check failed:', e);
  }
}

setInterval(checkVersion, 60 * 1000);
