/**
 * Service Worker CapsuleOS — cache hybride:
 * - network-first pour HTML/CSS/JS/JSON (mises à jour visibles rapidement)
 * - cache-first pour assets statiques lourds (offline performant)
 */
const CACHE_NAME = 'capsuleos-runtime-v4';
const CACHE_PREFIX = 'capsuleos-runtime-';

const isSameOriginGetRequest = (request) => {
    if (!request || request.method !== 'GET') {
        return false;
    }
    const url = new URL(request.url);
    return url.origin === self.location.origin;
};

const isNetworkFirstRequest = (request) => {
    const destination = request.destination || '';
    if (destination === 'document' || destination === 'script' || destination === 'style' || destination === 'worker') {
        return true;
    }
    const accept = request.headers.get('accept') || '';
    return accept.includes('text/html')
        || accept.includes('application/javascript')
        || accept.includes('text/css')
        || accept.includes('application/json')
        || accept.includes('text/plain');
};

const networkFirst = async (request, cache) => {
    try {
        const response = await fetch(request);
        if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone());
        }
        return response;
    } catch (_error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        throw _error;
    }
};

const cacheFirst = async (request, cache) => {
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone());
    }
    return response;
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!isSameOriginGetRequest(req)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        if (isNetworkFirstRequest(req)) {
            return networkFirst(req, cache);
        }
        return cacheFirst(req, cache);
    })());
});
