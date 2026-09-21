"use strict";

const CACHE_NAME = "skincare-ai-v3";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./translations.js",
    "./lesionTranslations.js",
    "./manifest.json",

    // TensorFlow.js
    "./tflite/tf.min.js",

    // TFLite runtime
    "./tflite/tf-tflite-alpha9.min.js",

    // AI models
    "./model/skin_gate.tflite",
    "./model/skin_cancer_efficientnet.tflite",

    // TFLite WASM
    "./wasm/tflite_web_api_cc.js",
    "./wasm/tflite_web_api_cc.wasm",

    "./wasm/tflite_web_api_cc_simd.js",
    "./wasm/tflite_web_api_cc_simd.wasm",

    "./wasm/tflite_web_api_cc_simd_threaded.js",
    "./wasm/tflite_web_api_cc_simd_threaded.wasm",
    "./wasm/tflite_web_api_cc_simd_threaded.worker.js",

    "./wasm/tflite_web_api_cc_threaded.js",
    "./wasm/tflite_web_api_cc_threaded.wasm",
    "./wasm/tflite_web_api_cc_threaded.worker.js"
];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener("install", event => {

    console.log(
        "SkinCare AI service worker installing..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    APP_FILES
                );

            })

            .then(() => {

                return self.skipWaiting();

            })

    );

});


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener("activate", event => {

    console.log(
        "SkinCare AI service worker activated."
    );

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !== CACHE_NAME
                        )
                        .map(
                            cacheName =>
                                caches.delete(
                                    cacheName
                                )
                        )

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


// =====================================================
// FETCH
// =====================================================

self.addEventListener("fetch", event => {

    const request = event.request;


    // Only handle GET requests
    if (
        request.method !== "GET"
    ) {

        return;

    }


    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                // Use cached version when available
                if (cachedResponse) {

                    return cachedResponse;

                }


                // Otherwise try the network
                return fetch(request)

                    .then(networkResponse => {

                        // Cache successful responses
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type !== "opaque"
                        ) {

                            const responseClone =
                                networkResponse.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(cache => {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });

                        }


                        return networkResponse;

                    })

                    .catch(() => {

                        // Offline fallback
                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});