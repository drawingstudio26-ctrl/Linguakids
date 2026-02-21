const CACHE_NAME = "linguakids-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./welcome.html",
  "./english.html",
  "./englevel2.html",
  "./englevel3.html",
  "./engames.html",
  "./progress.html",
  "./progress.js",
  "./hindi.html",
  "./hinlevel2.html",
  "./hinlevel3.html",
  "./hingames.html",
  "./hinprogress.html",
  "./marathi.html",
  "./mrlevel2.html",
  "./mrlevel3.html",
  "./mrgames.html",
  "./mrprogress.html",
  "./mrprogress.js",
  "./chinese.html",
  "./chlevel2.html",
  "./chlevel3.html",
  "./chgames.html",
  "./chprogress.html",
  "./chprogress.js",
  "./german.html",
  "./grgames.html",
  "./grlevel2.html",
  "./grlevel3.html",
  "./grprogress.js",
  "./script.js",
  "./offline.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install service worker and cache all files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercept fetch requests
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => networkResponse)
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("./offline.html");
          }
        });
    })
  );
});

// Activate service worker and remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
