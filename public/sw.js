// Service Worker for Weather PWA
const CACHE_NAME = 'weather-v1';

// Install — just activate immediately, no precaching in dev
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Activate — clean old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network only for navigation, cache static assets opportunistically
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Don't cache API calls, non-GET, or chrome-extension requests
    if (
        request.method !== 'GET' ||
        request.url.includes('/weather/') ||
        request.url.startsWith('chrome-extension')
    ) return;

    // For navigation (HTML pages) — always go to network
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/'))
        );
        return;
    }

    // For static assets — network first, cache fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
