const CACHE_NAME = 'room-monitor-shell-v1';
const SHELL_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// App shell: cache-first. Everything else (Supabase API, CDN scripts): network,
// falling back to cache only for the shell files if offline.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some(f => url.pathname.endsWith(f.replace('./', '')));

  if (isShellFile){
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
  // else: let it hit the network normally (live data must always be fresh)
});
