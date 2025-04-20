import { useState, useEffect } from 'react';
import { Button } from './Button';
import { clearAllCaches, updateServiceWorker, registerServiceWorker } from '~/utils/pwa';

export function UpdateButton() {
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  // Проверяем онлайн-статус
  useEffect(() => {
    // Начальная проверка
    setIsOnline(navigator.onLine);

    // Слушатели событий для онлайн/офлайн статуса
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Функция для очистки кэша и обновления приложения
  const handleUpdate = async () => {
    if (!isOnline) return;

    try {
      setIsUpdating(true);
      setUpdateStatus('Ачыстка кэша...');

      // Очищаем все кэши
      await clearAllCaches();
      
      setUpdateStatus('Абнаўленне ...');
      // Обновляем Service Worker
      await updateServiceWorker();
      
      setUpdateStatus('Перазагрузка ...');
      // Повторно регистрируем Service Worker для гарантии
      await registerServiceWorker();

      // Перезагружаем страницу для применения изменений
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
      setUpdateStatus('Памылка абнаўлення');
      
      // Через 3 секунды сбрасываем состояние
      setTimeout(() => {
        setIsUpdating(false);
        setUpdateStatus('');
      }, 3000);
    }
  };

  // Показываем кнопку только если есть интернет
  if (!isOnline) return null;

  return (
    <Button
      size="small"
      className="fixed bottom-4 left-4 z-50"
      onClick={handleUpdate}
      disabled={isUpdating}
      style={{
        opacity: isUpdating ? 0.7 : 1,
        backgroundColor: isUpdating ? '#2c5282' : undefined,
        cursor: isUpdating ? 'not-allowed' : 'pointer',
        minWidth: '180px'
      }}
    >
      {isUpdating ? `${updateStatus}` : 'Абнавіць дадатак'}
    </Button>
  );
}
