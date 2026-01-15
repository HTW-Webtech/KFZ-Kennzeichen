"use strict";

const CACHE_VERSION = "v2";
const CACHE_NAME = `kennzeichen-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    "./",
    "index.html",
    "icon.png",
    "style.css",
    "script.js",
    "manifest.json",
];

const DATA_FILES = [
    "data/kennzeichen.json",
    "data/laenderkennzeichen.json",
    "data/diplomatenkennzeichen.json",
];

const ALL_FILES = [...STATIC_ASSETS, ...DATA_FILES];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(ALL_FILES))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(
                            (name) =>
                                name.startsWith("kennzeichen-") &&
                                name !== CACHE_NAME,
                        )
                        .map((name) => caches.delete(name)),
                );
            })
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        }),
    );
});
