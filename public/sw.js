/**
 * Service Worker Offline-First pour LEGALMAPS
 * Mise en cache intégrale des fiches juridiques, de la cartographie PMTiles et de l'interface.
 * ZÉRO télémétrie, ZÉRO tracking.
 */

const CACHE_NAME = "legalmaps-v1.0.0";

const PRECACHE_URLS = [
  "./",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./tiles/nantes.pmtiles",
];

// Installation : pré-mise en cache des ressources critiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Erreur de pré-cache (mode dégradé):", err);
      })
  );
});

// Activation : purge des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie d'interception réseau :
// 1. Pour les tuiles PMTiles : Cache-First avec support Range Requests si possible
// 2. Pour les fiches, styles et scripts : Stale-While-Revalidate
// 3. Pour la navigation : Network-First avec fallback immédiat sur le cache de la racine '/'
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes WebSocket (Supabase Realtime) ou non-GET
  if (request.method !== "GET" || url.protocol === "ws:" || url.protocol === "wss:") {
    return;
  }

  // Requêtes sur /tiles/ (fichiers vectoriels PMTiles)
  if (url.pathname.startsWith("/tiles/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Requête de navigation principale (mode hors-ligne total)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/").then((cachedRoot) => {
          return (
            cachedRoot ||
            new Response(
              "<html><body><h1>Mode Hors-Ligne</h1><p>LegalMaps reste accessible hors-ligne.</p></body></html>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
          );
        });
      })
    );
    return;
  }

  // Autres ressources statiques (JS, CSS, images, JSON) : Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin || url.hostname.includes("unpkg.com"))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

