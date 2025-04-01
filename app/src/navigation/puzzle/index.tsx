import { useEffect, useRef, useState } from 'react';
import { HomeButton } from '~/components/HomeButton';

export function PuzzleRoot() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState('100vh');

  useEffect(() => {
    // Функция для изменения размера iframe при изменении размера окна
    const handleResize = () => {
      setIframeHeight(`${window.innerHeight}px`);
    };

    // Инициализируем размер
    handleResize();

    // Добавляем обработчик события изменения размера окна
    window.addEventListener('resize', handleResize);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-neutral-800">
      <div className="absolute left-4 top-4 z-10">
        <HomeButton />
      </div>
      <iframe
        ref={iframeRef}
        src="./puzzle/index.html"
        className="w-full"
        style={{ height: iframeHeight }}
        frameBorder="0"
        title="Puzzle Game"
        allowFullScreen
      />
    </div>
  );
}
