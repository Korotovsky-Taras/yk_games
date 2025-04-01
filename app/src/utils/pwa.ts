// src/utils/pwa.ts
/**
 * Утилиты для работы с PWA (Progressive Web Application)
 */

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
  // Обновляем состояние онлайн/офлайн
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`Приложение ${status}`);
    
    // Если переходим в офлайн, сохраняем путь для возможного восстановления
    if (!navigator.onLine) {
      // Сохраняем текущий путь
      sessionStorage.setItem('lastPath', window.location.pathname);
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
