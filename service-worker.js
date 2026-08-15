const CACHE_NAME = "legende-v15";
const ASSETS = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./musc-map.jpg", "./freaky-season.jpg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Não interceptar requisições cross-origin (Firebase Auth usa iframes de firebaseapp.com)
  if (url.origin !== location.origin) return;

  // Network-first para navegação (retorno do redirect OAuth precisa de HTML fresco)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first para assets estáticos
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
