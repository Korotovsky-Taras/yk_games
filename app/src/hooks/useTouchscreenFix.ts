import { useEffect } from 'react';

/**
 * Хук для исправления поведения тачскринов при офлайн-режиме
 * Особенно полезно для Windows-устройств с тачскрином
 */
export const useTouchscreenFix = () => {
  useEffect(() => {
    // Проверяем, является ли устройство тачскрином
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      console.log('Определено устройство с тачскрином, применяем специальные настройки');
      
      // Предотвращаем стандартное поведение жесткой перезагрузки
      window.addEventListener('beforeunload', () => {
        // Помечаем, что это нормальная перезагрузка (не жесткая)
        sessionStorage.setItem('normalReload', 'true');
      });
      
      // Проверяем, была ли это жесткая перезагрузка
      const isNormalReload = sessionStorage.getItem('normalReload') === 'true';
      sessionStorage.removeItem('normalReload');
      
      // Если это жесткая перезагрузка и нет сети, проверяем наличие кэшированной версии
      if (!isNormalReload && !navigator.onLine) {
        console.log('Обнаружена жесткая перезагрузка в офлайн-режиме на тачскрине');
        
        // Проверяем, есть ли кэши приложения
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            if (cacheNames.length > 0) {
              console.log('Найдены кэши приложения, пытаемся использовать');
              
              // Проверяем наличие кэшированной версии текущей страницы
              caches.match(window.location.href)
                .then(response => {
                  if (response) {
                    console.log('Найдена кэшированная версия страницы');
                    
                    // Активируем Service Worker, если он есть
                    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                      navigator.serviceWorker.controller.postMessage({
                        type: 'ENFORCE_CACHE_FIRST'
                      });
                    }
                  }
                });
            }
          });
        }
      }
    }
    
    return () => {
      // Очистка слушателя событий при размонтировании компонента
      if (isTouchDevice) {
        window.removeEventListener('beforeunload', () => {
          sessionStorage.setItem('normalReload', 'true');
        });
      }
    };
  }, []);
};
