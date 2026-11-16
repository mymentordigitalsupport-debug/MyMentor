const CACHE_NAME = "my-mentor-shell-v4";
const CORE_ASSETS = ["/", "/manifest.webmanifest", "/assets/images/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            return caches.delete(key);
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedResponse = await caches.match(request) ?? await caches.match("/");
        return cachedResponse ?? new Response("Temporarily offline", { status: 503 });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (url.origin === self.location.origin && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }

          return networkResponse;
        })
        .catch(() => new Response("Temporarily unavailable", { status: 503 }));
    })
  );
});
