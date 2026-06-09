const CACHE_NAME = 'colorado-26-v19';
const STATIC_ASSETS = [
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './data/itinerary.json',
  './data/Colorado_Trip_Restaurants_2026.json',
  './data/packing.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './assets/r8xKq2mP/PPCRT.pdf',
  './assets/r8xKq2mP/CMBR.pdf',
  './assets/r8xKq2mP/ExQID.png',
  './assets/r8xKq2mP/TAHCS.png',
  './assets/r8xKq2mP/RIMGS.png',
  './assets/r8xKq2mP/PGHSL.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Open-Meteo API: network-first with cache fallback
  if (url.hostname === 'api.open-meteo.com') {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Local assets: cache-first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
