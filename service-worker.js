const CACHE_NAME = 'turniej-v3.1'; // <--- ZMIENIAJ TO ZAWSZE (v3, v4 itd.) po zmianach w kodzie
const urlsToCache = [
  './', // ważne, aby dodać ścieżkę główną
  './index.html',
  './manifest.json',
  './icons/icon-512x512.png'
];

// 1. INSTALACJA - Pobieranie plików
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Otwarto cache: ', CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
  // WYMUSZENIE: Nowy SW staje się aktywny od razu, nie czeka na zamknięcie kart
  self.skipWaiting();
});

// 2. AKTYWACJA - Usuwanie starych wersji cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Przejmij kontrolę nad stroną natychmiast
  return self.clients.claim();
});

// 3. POBIERANIE - Strategia "Network First" dla plików HTML
// Dzięki temu przy F5 najpierw spróbuje pobrać nowy index.html z sieci
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
