"use strict";

const CACHE_NAME = "skincare-ai-v4";

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
        for (const audioFile of AUDIO_FILES) {
            files.push(`./audio/${language}/${audioFile}`);
        }
    }

    return files;
}

self.addEventListener("install", event => {
    console.log("SkinCare AI v4 service worker installing...");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {

                // Cache main application files
                await cache.addAll(APP_FILES);

                // Cache all possible voice files.
                // Missing files are ignored because
                // some languages only have result.wav.
                const audioFiles = getAudioFiles();

                await Promise.all(
                    audioFiles.map(async file => {
                        try {
                            const response = await fetch(file);

                            if (response.ok) {
                                await cache.put(file, response);
                                console.log("Cached audio:", file);
                            }
                        } catch (error) {
                            console.log("Audio not available:", file);
                        }
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});


self.addEventListener("activate", event => {

    console.log("SkinCare AI v4 service worker activated.");

    event.waitUntil(
        caches.keys()
            .then(cacheNames =>
                Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                )
            )
            .then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

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

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(() => {

                        return caches.match("./index.html");

                    });
            })
    );
});