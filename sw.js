const CACHE_NAME = 'exactas-pack1-v2';

// Lista completa de archivos estáticos para uso 100% offline desde el inicio
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './matematicas/index.html',
  './matematicas/preguntas.json',
  './fisica/index.html',
  './fisica/preguntas.json',
  './quimica/index.html',
  './quimica/preguntas.json'
];

// Evento de Instalación: Guarda todos los simuladores y sus bancos de preguntas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Guardando simuladores y preguntas en caché...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de Activación: Elimina versiones anteriores de la caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch: Responde desde caché y guarda dinámicamente los iconos o recursos extra
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
