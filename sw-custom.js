// This is a custom service worker that will be combined with the main SW

// Обрабатываем запросы
self.addEventListener('fetch', (event) => {
  // Если это навигационный запрос (HTML) или установлена принудительная стратегия
  if (event.request.mode === 'navigate' || self.CACHE_FIRST_ENFORCED) {
    event.respondWith(
      // Сначала проверяем кэш
      caches.match(event.request)
        .then(cachedResponse => {
          // Если есть в кэше, возвращаем немедленно
          if (cachedResponse) {
            console.log('Возвращаем ответ из кэша');
            return cachedResponse;
          }
          
          // Иначе пробуем получить из сети
          return fetch(event.request)
            .catch(error => {
              // Если сеть недоступна, ищем offline.html
              console.log('Нет сети, используем офлайн-страницу');
              return caches.match('offline.html')
                .then(offlineResponse => {
                  return offlineResponse || new Response('Нет подключения к интернету', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                  });
                });
            });
        })
    );
  }
});

// Слушаем сообщения от приложения
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ENFORCE_CACHE_FIRST') {
    console.log('Enforcing Cache-First strategy for touchscreen device');
    
    // Устанавливаем флаг в глобальной области SW
    self.CACHE_FIRST_ENFORCED = true;
  }
});

// Override standard hard refresh behavior on touchscreens
// This helps ensure proper caching, especially on Windows tablets
self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  // For touchscreen devices, make sure cache is always checked first
  if ('ontouchstart' in self) {
    // Add special handling for touchscreens
    console.log('Touchscreen detected, optimizing service worker');
  }
});
