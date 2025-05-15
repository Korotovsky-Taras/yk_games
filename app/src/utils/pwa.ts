import { initNetworkStatusTracking, precacheImportantResources } from './networkStatus';

/**
 * Регистрация Service Worker для работы PWA
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { 
        scope: './' 
      });
      
      console.log('ServiceWorker зарегистрирован успешно, область действия: ', registration.scope);
      
      // Обновляем страницу при изменении Service Worker
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
      
      return registration;
    } catch (error) {
      console.error('Ошибка регистрации ServiceWorker: ', error);
    }
  }
  return undefined;
};

/**
 * Обновление Service Worker
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      // Получаем текущую регистрацию
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        // Запускаем обновление
        await registration.update();
        console.log('Service Worker обновлен');
        return true;
      }
    } catch (error) {
      console.error('Ошибка обновления Service Worker:', error);
    }
    return false;
  }
  return false;
};

/**
 * Обработка статуса онлайн/офлайн
 */
export const handleOfflineStatus = (): void => {
  // Инициализируем отслеживание сетевого статуса
  const networkTracking = initNetworkStatusTracking();
  
  // Прекэшируем важные ресурсы для офлайн-режима
  if (navigator.onLine) {
    precacheImportantResources().then(success => {
      if (success) {
        console.log('Важные ресурсы предварительно загружены в кэш');
      }
    });
  }

  // Дополнительные действия при изменении статуса подключения
  const updateOnlineStatus = () => {
    // Если переходим в офлайн, сохраняем путь для возможного восстановления
    if (!navigator.onLine) {
      // Сохраняем текущий путь
      sessionStorage.setItem('lastPath', window.location.pathname + window.location.hash);
    }
  };

  // Слушаем изменения статуса подключения
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Начальная проверка
  updateOnlineStatus();
};

/**
 * Очистка всех кэшей приложения
 */
export const clearAllCaches = async (): Promise<boolean> => {
  if ('caches' in window) {
    try {
      // Получаем список всех кэшей
      const cacheNames = await caches.keys();
      
      // Удаляем все кэши
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('Все кэши успешно очищены');
      return true;
    } catch (error) {
      console.error('Ошибка при очистке кэшей:', error);
      return false;
    }
  }
  return false;
};

/**
 * Обновление кэша приложения
 * Отправляет сообщение Service Worker для обновления всех кэшированных ресурсов
 */
export const updateAppCache = async (): Promise<{ success: boolean; message?: string }> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const messageChannel = new MessageChannel();
      
      const updatePromise = new Promise<{ success: boolean, message?: string }>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve({ success: true, message: 'Кэш успешно обновлен' });
          } else {
            resolve({ 
              success: false, 
              message: event.data.error || 'Ошибка при обновлении кэша' 
            });
          }
        };
      });
      
      // Отправляем сообщение для обновления кэша
      navigator.serviceWorker.controller.postMessage(
        { type: 'UPDATE_CACHE' },
        [messageChannel.port2]
      );
      
      // Устанавливаем тайм-аут в 30 секунд
      const timeoutPromise = new Promise<{ success: boolean, message: string }>((resolve) => {
        setTimeout(() => {
          resolve({ success: false, message: 'Истекло время ожидания обновления' });
        }, 30000);
      });
      
      // Возвращаем результат первого завершившегося промиса
      return Promise.race([updatePromise, timeoutPromise]);
    } catch (error) {
      console.error('Ошибка при обновлении кэша:', error);
      return { success: false, message: 'Ошибка связи с Service Worker' };
    }
  }
  
  return { success: false, message: 'Service Worker не контролирует страницу' };
};

/**
 * Функция для принудительного кэширования конкретного URL
 */
export const forceCacheResource = async (url: string): Promise<{ success: boolean; message?: string }> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const messageChannel = new MessageChannel();
      
      const cachePromise = new Promise<{ success: boolean, message?: string }>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve({ success: true, message: `Ресурс ${url} успешно кэширован` });
          } else {
            resolve({ 
              success: false, 
              message: event.data.error || `Ошибка при кэшировании ${url}` 
            });
          }
        };
      });
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'FORCE_CACHE', url },
        [messageChannel.port2]
      );
      
      const timeoutPromise = new Promise<{ success: boolean, message: string }>((resolve) => {
        setTimeout(() => {
          resolve({ success: false, message: 'Истекло время ожидания кэширования' });
        }, 10000);
      });
      
      return Promise.race([cachePromise, timeoutPromise]);
    } catch (error) {
      console.error(`Ошибка при кэшировании ${url}:`, error);
      return { success: false, message: 'Ошибка связи с Service Worker' };
    }
  }
  
  return { success: false, message: 'Service Worker не контролирует страницу' };
};
