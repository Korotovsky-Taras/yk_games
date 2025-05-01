// Скрипт для регистрации и управления Service Worker

// Функция регистрации сервис-воркера
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
      
      // Регистрируем Service Worker
      navigator.serviceWorker.register('./generated-sw.js', { 
        scope: './', 
        updateViaCache: 'none' // Не использовать кэш браузера для обновления SW
      })
        .then(registration => {
          console.log('ServiceWorker зарегистрирован для:', registration.scope);
          
          // Проверяем нужно ли принудительное кэширование при первом запуске
          if (!localStorage.getItem('pwaInitialCaching')) {
            console.log('Первая установка PWA, кэшируем ресурсы...');
            
            // Отмечаем, что первичное кэширование было выполнено
            localStorage.setItem('pwaInitialCaching', 'true');
            
            // Предварительное кэширование основных маршрутов
            const routes = [
              './index.html', 
              './puzzle/index.html', 
              './memory/index.html', 
              './drawing/index.html',
              // Добавляем основные ресурсы игр
              './puzzle/click.mp3',
              './puzzle/loader.gif',
              './memory/image-01.png',
              './drawing/pic-01.jpg'
            ];
            
            // Кэшируем все маршруты последовательно
            const cachePromises = routes.map(route => {
              return fetch(route)
                .then(response => {
                  console.log(`Кэширован маршрут: ${route}`);
                  return response;
                })
                .catch(err => {
                  console.error(`Ошибка кэширования маршрута ${route}:`, err);
                  return null;
                });
            });

            // Дождаемся завершения всех запросов
            Promise.all(cachePromises).then(() => {
              console.log('Все основные ресурсы закэшированы');

              // Отправляем сообщение Service Worker для кэширования остальных ресурсов
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: 'PRECACHE_RESOURCES'
                });
              }
            });
            setTimeout(() => {
              const offlineNotification = document.createElement('div');
              offlineNotification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background-color: rgba(20, 20, 20, 0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                z-index: 9999;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              `;
              
              offlineNotification.innerHTML = `
                <h3 style="margin-top: 0; font-size: 18px;">Приложение готово к работе офлайн</h3>
                <p style="font-size: 14px;">Все необходимые ресурсы загружены. Теперь вы можете использовать приложение даже без доступа к интернету.</p>
                <button style="
                  background-color: #3498db;
                  color: white;
                  border: none;
                  padding: 8px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                " onclick="this.parentNode.remove()">Хорошо</button>
              `;
              
              document.body.appendChild(offlineNotification);
              
              // Автоматически скрыть через 10 секунд
              setTimeout(() => {
                if (offlineNotification.parentNode) {
                  offlineNotification.remove();
                }
              }, 10000);
            }, 2000);
          }
          
          // Проверка обновлений SW каждые 6 часов
          setInterval(() => {
            registration.update();
          }, 6 * 60 * 60 * 1000);
          
          // Обработка обновлений
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Доступно обновление Service Worker');
                  
                  // В режиме PWA спрашиваем пользователя
                  if (isStandalone) {
                    if (confirm('Доступно обновление приложения. Обновить сейчас?')) {
                      // Сообщаем SW, чтобы он активировался
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                  } else {
                    // В обычном режиме сайта только логируем
                    console.log('Доступно обновление, оно будет применено при следующем запуске');
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Ошибка регистрации Service Worker:', error);
        });
      
      // Отслеживаем изменения состояния сети
      const updateNetworkStatus = () => {
        const isOnline = navigator.onLine;
        console.log('Статус сети:', isOnline ? 'онлайн' : 'офлайн');
        
        // Отправляем сообщение SW о текущем состоянии сети
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ 
            type: isOnline ? 'APP_ONLINE' : 'APP_OFFLINE' 
          });
        }
        
        // Добавляем индикатор офлайн-режима
        if (!isOnline) {
          if (!document.getElementById('offline-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = `
              <div style="
                position: fixed;
                bottom: 10px;
                left: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              ">
                ⚠️ Офлайн режим
              </div>
            `;
            document.body.appendChild(indicator);
          }
        } else if (document.getElementById('offline-indicator')) {
          document.getElementById('offline-indicator')?.remove();
        }
      };
      
      // Подписываемся на события сети
      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
      
      // Проверяем статус сети при загрузке
      updateNetworkStatus();
    });
  }
}

// Автоматический запуск регистрации при загрузке скрипта
registerServiceWorker();