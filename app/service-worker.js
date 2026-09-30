const CACHE_NAME = "skincare-ai-v9";

const APP_FILES = [
    "./",
    "./index.html",
    "./app.html",
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

const LANGUAGES = [
    "en-US",
    "te-IN",
    "hi-IN",
    "ta-IN",
    "kn-IN",
    "ml-IN",
    "mr-IN",
    "bn-IN",
    "gu-IN",
    "pa-IN",
    "ur-IN",
    "or-IN",
    "fr-FR",
    "es-ES",
    "de-DE",
    "it-IT",
    "pt-PT",
    "ja-JP",
    "ko-KR",
    "ru-RU",
    "ar-SA"
];

const AUDIO_FILES = [
    "error.wav",
    "no-result.wav",
    "result.wav",
    "select-image.wav",
    "test.wav",
    "warning.wav"
];

function getAudioFiles() {
    const files = [];
    for (const language of LANGUAGES) {
        files.push(`./audio/${language}/result.wav`);
    }
    return files;
}

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await cache.addAll(APP_FILES);
            const audioFiles = getAudioFiles();
            await Promise.allSettled(audioFiles.map(file => cache.add(file).catch(err => {
                console.warn("Optional audio file cache skipped:", file);
            })));
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // Special handling for offline audio
    if (url.pathname.includes("/audio/")) {
        event.respondWith(
            caches.match(url.pathname)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request);
                })
                .catch(() => {
                    return new Response(
                        "Offline audio unavailable",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/plain"
                            }
                        }
                    );
                })
        );
        return;
    }

    // Network-First for core application files (HTML, JS, CSS) so code changes reflect immediately
    if (url.pathname.endsWith(".html") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname === "/" || url.pathname.endsWith("/")) {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-First for static models and assets
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(networkResponse => {
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type !== "opaque"
                        ) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        return caches.match("./app.html");
                    });
            })
    );
});