const CACHE_NAME = "reviewer-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Install
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache =>

            cache.addAll(FILES_TO_CACHE)

        )

    );

    self.skipWaiting();

});

// Activate
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            )

        )

    );

    self.clients.claim();

});

// Fetch
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request).then(cacheResponse => {

            return cacheResponse || fetch(event.request)
                .then(networkResponse => {

                    // Cache new files automatically
                    const copy = networkResponse.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(event.request, copy);

                    });

                    return networkResponse;

                })
                .catch(() => cacheResponse);

        })

    );

});