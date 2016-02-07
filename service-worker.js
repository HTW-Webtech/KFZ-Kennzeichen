'use strict';

const CACHE_NAME = 'kennzeichen';
const REQUIRED_FILES = [
   '.',
   'index.html',
   'icon.png',
   'style.css',
   'script.js',
   'manifest.json',
   'data/kennzeichen.json',
   'data/laenderkennzeichen.json',
   'data/diplomatenkennzeichen.json'
];

self.addEventListener('install', (event) => {
   event.waitUntil(
      caches.open(CACHE_NAME)
      .then((cache) => {
         console.log('[install] Caches opened, adding all core components to cache');
         return cache.addAll(REQUIRED_FILES);
      })
      .then(() => {
         console.log('[install] All required resources have been cached, we\'re good!');
         return self.skipWaiting();
      })
   );
});

self.addEventListener('activate', (event) => {
   event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
   console.log('Handling fetch event for:', event.request.url);
   event.respondWith(
      caches.match(event.request).then((response) => {
         if (response) {
            console.log('[fetch] Returning from ServiceWorker cache: ', event.request.url);
            return response;
         }
         console.log('[fetch] Returning from server: ', event.request.url);
         return fetch(event.request);
      })
   );
});
