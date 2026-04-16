// ENSO Unified — Service Worker
// Cache strategy:
//  - navigation: network-first, fallback to "/dashboard"
//  - mp3 (ambient sounds): network-first, then cached
//  - other (icons, fonts): cache-first

const CACHE_NAME = "enso-unified-v1";

const APP_SHELL = [
  "/",
  "/dashboard",
  "/timer",
  "/task",
  "/focus",
  "/journal",
  "/settings",
  "/icon-192.png",
  "/icon-512.png",
];

const SOUND_FILES = [
  "/sounds/thunder.mp3",
  "/sounds/fire.mp3",
  "/sounds/cafe.mp3",
  "/sounds/birds.mp3",
  "/sounds/waves.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch(() => null)
    )
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
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Skip cross-origin
  if (url.origin !== self.location.origin) return;

  // Navigation: network-first, fallback to dashboard
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/dashboard").then((c) => c || caches.match("/")))
    );
    return;
  }

  // MP3 (ambient sounds): network-first, cache after fetch
  if (url.pathname.endsWith(".mp3")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
