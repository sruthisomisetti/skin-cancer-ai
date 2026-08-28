const CACHE_NAME = "skin-cancer-ai-v2";

const LOCAL_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./skin_cancer_efficientnet.tflite"
];

const CDN_FILES = [
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.10/dist/tf-tflite.min.js"
];


// =====================================
// INSTALL
// =====================================

self.addEventListener("install", event => {

    console.log("Installing Skin Cancer AI Service Worker...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async cache => {

                // Cache local application files
                await cache.addAll(LOCAL_FILES);

                // Try to cache TensorFlow libraries
                for (const url of CDN_FILES) {

                    try {

                        const response = await fetch(url);

                        if (response.ok) {

                            await cache.put(url, response);

                            console.log(
                                "Cached:",
                                url
                            );

                        }

                    } catch (error) {

                        console.log(
                            "Could not cache:",
                            url
                        );

                    }

                }

            })

    );

    self.skipWaiting();

});


// =====================================
// ACTIVATE
// =====================================

self.addEventListener("activate", event => {

    console.log(
        "Skin Cancer AI Service Worker activated."
    );

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            name => name !== CACHE_NAME
                        )
                        .map(
                            name => caches.delete(name)
                        )

                );

            })

    );

    self.clients.claim();

});


// =====================================
// FETCH
// =====================================

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }


                return fetch(event.request)
                    .then(networkResponse => {

                        // Save successful requests
                        // for future offline use

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            event.request.method === "GET"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        // If offline and the requested
                        // page isn't cached, return app

                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});