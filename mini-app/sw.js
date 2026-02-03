/**
 * Service Worker для PadelSense Mini App
 * Кэширование и оффлайн работа
 */

const CACHE_NAME = 'padelsense-v1';
const RUNTIME_CACHE = 'padelsense-runtime';

// Файлы для кэширования при установке
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/performance.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Кэширование статических файлов');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем non-GET запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // Стратегия: Cache First для статических файлов
  if (STATIC_FILES.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('🎯 Cache hit:', request.url);
            return response;
          }
          
          // Если нет в кэше, загружаем и кэшируем
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('💾 Кэширование:', request.url);
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
    return;
  }
  
  // Стратегия: Network First для API запросов
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кэшируем успешные ответы
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // При ошибке сети, пробуем получить из кэша
          console.log('⚠️ Network error, trying cache:', request.url);
          return caches.match(request);
        })
    );
    return;
  }
  
  // Для остальных запросов используем Network Only
  event.respondWith(fetch(request));
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_CLEAR':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      caches.keys().then((cacheNames) => {
        let totalSize = 0;
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.open(cacheName).then((cache) => {
              return cache.keys().then((requests) => {
                return Promise.all(
                  requests.map((request) => {
                    return cache.match(request).then((response) => {
                      if (response) {
                        return response.headers.get('content-length') || 0;
                      }
                      return 0;
                    });
                  })
                ).then((sizes) => {
                  const cacheSize = sizes.reduce((sum, size) => sum + parseInt(size), 0);
                  totalSize += cacheSize;
                  return cacheSize;
                });
              });
            });
          })
        ).then(() => {
          event.ports[0].postMessage({ 
            type: 'CACHE_SIZE', 
            payload: { totalSize, cacheNames } 
          });
        });
      });
      break;
  }
});

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Background sync...');
  // Здесь можно добавить логику синхронизации данных
}

// Push уведомления
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('PadelSense', options)
  );
});
