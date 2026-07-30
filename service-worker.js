/* ==========================================
   MODERN CHAIN LINK COMPANY
   SERVICE WORKER (PWA Offline Cache)
========================================== */

const CACHE_NAME = "mclc-v2.0.0";

const APP_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./home.html",
    "./orders.html",
    "./add-order.html",
    "./view-order.html",
    "./customers.html",
    "./profile.html",

    "./manifest.json",

    "./css/common.css",
    "./css/splash.css",
    "./css/login.css",
    "./css/home.css",
    "./css/orders.css",
    "./css/add-order.css",
    "./css/view-order.css",
    "./css/customers.css",
    "./css/profile.css",
    "./css/navigation.css",

    "./js/ui.js",
    "./js/splash.js",
    "./js/login.js",
    "./js/home.js",
    "./js/orders.js",
    "./js/add-order.js",
    "./js/view-order.js",
    "./js/customers.js",
    "./js/profile.js",
    "./js/navigation.js",

    "./assets/images/logo.png",

    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
    "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
];

/* Install */
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_FILES).catch(err => {
                console.warn("Some assets failed to cache during sw install:", err);
            });
        })
    );
    self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/* Fetch Strategy: Stale-While-Revalidate with Cache Fallback */
self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (cachedResponse) {
            const fetchPromise = fetch(event.request)
                .then(function (networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(function () {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("./index.html");
                    }
                });

            return cachedResponse || fetchPromise;
        })
    );
});