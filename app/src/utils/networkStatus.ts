/**
 * Утилита для работы с сетевым состоянием приложения
 * Отслеживает статус подключения и уведомляет Service Worker
 */

// Функция для отправки сообщения Service Worker'у
const sendMessageToSW = (message: { type: string, payload?: any }) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

// Инициализация отслеживания состояния сети
export const initNetworkStatusTracking = () => {
  // Текущее состояние сети
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    
    // Сообщаем Service Worker о состоянии подключения
    if (isOnline) {
      sendMessageToSW({ type: 'APP_ONLINE' });
      console.log('Приложение онлайн');
    } else {
      sendMessageToSW({ type: 'APP_OFFLINE' });
      console.log('Приложение офлайн');
    }
    
    // Дополнительно можно обновить UI приложения или выполнить другие действия
    document.body.classList.toggle('offline', !isOnline);
  };
  
  // Обработчики событий изменения состояния сети
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Начальное состояние
  updateNetworkStatus();
  
  return {
    // Возвращаем функцию для очистки обработчиков, если нужно
    cleanup: () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    }
  };
};

// Проверка, доступно ли приложение офлайн (кэшировано)
export const checkOfflineAvailability = async (url: string): Promise<boolean> => {
  if (!('caches' in window)) {
    return false;
  }
  
  try {
    const cacheNames = await window.caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await window.caches.open(cacheName);
      const response = await cache.match(url);
      if (response) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
};

// Проверка состояния сети
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Функция для принудительного прекэширования важных ресурсов
export const precacheImportantResources = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      // Просим Service Worker прекэшировать важные ресурсы
      navigator.serviceWorker.controller.postMessage({
        type: 'PRECACHE_RESOURCES'
      });
      console.log('Запрос на прекэширование отправлен');
      return true;
    } catch (error) {
      console.error('Ошибка при отправке запроса на прекэширование:', error);
      return false;
    }
  }
  return false;
};
