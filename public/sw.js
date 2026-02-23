// Cleanup service worker — unregisters itself and clears all caches
// This fixes any 404s caused by previously cached bad responses

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clear all caches
            caches.keys().then((keys) =>
                Promise.all(keys.map((k) => caches.delete(k)))
            ),
            // Unregister this service worker
            self.registration.unregister(),
        ]).then(() => {
            // Refresh all open tabs so they get the clean version
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => client.navigate(client.url));
            });
        })
    );
});

// Pass everything through to network — don't cache anything
self.addEventListener('fetch', () => {
    // Do nothing — let the browser handle it normally
});
