const CACHE = 'tunaeye-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/tunaeye-logo.svg', '/tunaeye-192.png', '/tunaeye-512.png', '/assets/sashiboCoreFull.png', '/assets/tailCutFull.png', '/assets/step 1.png', '/assets/step 2.png', '/assets/step 3.png']
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())))
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())))
self.addEventListener('fetch', event => { if (event.request.method !== 'GET') return; event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response }).catch(() => caches.match(event.request).then(response => response || caches.match('/')))) })
