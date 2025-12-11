// Service Worker - Athera Run PWA
// Version: 1.0.0
// Data: 11/Dez/2025

const CACHE_VERSION = 'athera-pwa-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB (iOS limit)

const STATIC_ASSETS = [
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/maskable-icon-192x192.png',
  '/maskable-icon-512x512.png',
  '/favicon.ico',
  '/logo.png',
  '/logo-icon.png',
];

const CRITICAL_PAGES = [
  '/pt-BR/offline',
  '/pt-BR/dashboard',
  '/pt-BR/plano',
  '/pt-BR/perfil',
];

const CRITICAL_APIS = [
  '/api/plan/current',
  '/api/workouts/weekly',
  '/api/profile',
];

const OFFLINE_PAGE = '/pt-BR/offline';

self.addEventListener('install', (event) => {
  console.log('[SW] Install event - version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CACHE_DYNAMIC).then((cache) => {
        console.log('[SW] Precaching critical pages');
        return cache.addAll(CRITICAL_PAGES);
      })
    ]).catch((error) => {
      console.error('[SW] Cache install failed:', error);
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('athera-pwa-') && 
                cacheName !== CACHE_STATIC && 
                cacheName !== CACHE_DYNAMIC && 
                cacheName !== CACHE_IMAGES) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      cleanupExpiredCache()
    ])
  );
  
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') {
    return;
  }
  
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }
  
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }
  
  if (CRITICAL_APIS.includes(url.pathname)) {
    event.respondWith(networkFirstWithTimeout(request, CACHE_DYNAMIC, 3000));
    return;
  }
  
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }
  
  if (url.pathname.startsWith('/pt-BR/')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
    return;
  }
  
  event.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers({
          ...Object.fromEntries(response.headers),
          'sw-cache-time': Date.now().toString()
        })
      });
      cache.put(request, responseWithTimestamp);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network-first failed, trying cache:', error.message);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    if (request.destination === 'document') {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch((error) => {
    console.log('[SW] Stale-while-revalidate fetch failed:', error.message);
    if (cached) {
      return cached;
    }
    throw error;
  });
  
  return cached || fetchPromise;
}

async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Network timeout after ${timeout}ms`)), timeout)
      )
    ]);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network-first-timeout failed, trying cache:', error.message);
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Returning cached response for:', request.url);
      return cached;
    }
    
    console.error('[SW] No cache available for:', request.url);
    throw error;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_DYNAMIC).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_EXPIRED') {
    event.waitUntil(cleanupExpiredCache());
  }
});

async function cleanupExpiredCache() {
  console.log('[SW] Cleaning up expired cache...');
  
  const cacheNames = await caches.keys();
  const atheraoCaches = cacheNames.filter(name => name.startsWith('athera-pwa-'));

  for (const cacheName of atheraoCaches) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const cacheTime = response.headers.get('sw-cache-time');
      if (cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age > MAX_CACHE_AGE) {
          await cache.delete(request);
          console.log('[SW] Deleted expired:', request.url);
        }
      }
    }
  }

  console.log('[SW] Expired cache cleanup complete');
}

setInterval(() => {
  cleanupExpiredCache();
}, 60 * 60 * 1000); // Limpar cache a cada 1 hora

