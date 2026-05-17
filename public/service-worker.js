const CACHE_NAME = "rj-price-calculator-v1";
const RUNTIME_CACHE = "rj-runtime-cache-v1";
const MANUAL_RATES_KEY = "rj-manual-rates";

// In-memory storage for manual rates
let manualRates = null;

// Files to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/data/rates.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API calls - Network first, fallback to manual rates > cache > rates.json
  if (url.pathname.includes("/metal/rate") || url.pathname.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response && response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Offline or API failed - use fallback chain
          try {
            // First priority: Check manually entered rates
            if (manualRates) {
              return new Response(
                JSON.stringify(manualRates),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }
              );
            }

            // Second priority: Check service worker cache
            return caches.match(request).then((cached) => {
              if (cached) {
                return cached;
              }

              // Third priority: Try to get rates from cache (not network)
              return caches.match("/data/rates.json").then((cachedRates) => {
                if (cachedRates) {
                  return cachedRates;
                }

                // Last resort - return hardcoded fallback
                return new Response(
                  JSON.stringify({
                    error: "Offline - using hardcoded fallback",
                    metalRates: {
                      GL995: 75000,
                      SL_999: 75000,
                      recorded_on: new Date().toISOString(),
                    },
                  }),
                  {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                  }
                );
              });
            });
          } catch (error) {
            // Fallback for any unexpected errors
            return new Response(
              JSON.stringify({
                error: "Offline - fallback mode",
                metalRates: {
                  GL995: 75000,
                  SL_999: 75000,
                  recorded_on: new Date().toISOString(),
                },
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/) ||
    url.pathname === "/" ||
    url.pathname === "/index.html"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (!response || response.status !== 200 || response.type === "error") {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
        );
      })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return (
            cached ||
            new Response("Offline - Resource not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "text/plain",
              }),
            })
          );
        });
      })
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data && event.data.type === "SAVE_MANUAL_RATES") {
    // Store manually entered rates in memory
    manualRates = event.data.payload;
    console.log("Service Worker: Manual rates saved in memory", manualRates);
  } else if (event.data && event.data.type === "CLEAR_MANUAL_RATES") {
    // Clear manually entered rates
    manualRates = null;
    console.log("Service Worker: Manual rates cleared");
  }
});
