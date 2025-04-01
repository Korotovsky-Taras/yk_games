import { useNavigate } from 'react-router-dom';
import { HomeButton } from '~/components/HomeButton';
import { ColoringBook } from '~/components/drawing';
import { useState, useEffect } from 'react';

// Пути к изображениям для разукрашки
const COLORING_IMAGES = [
  '/drawing/astronaut.png',
  '/drawing/eagle.png',
  '/drawing/glass.jpg'
];

export function DrawingRoot() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);

  // Загружаем изображения при монтировании компонента
  useEffect(() => {
    // Проверяем существование изображений и добавляем их в состояние
    const loadImages = async () => {
      try {
        setImages(COLORING_IMAGES);
      } catch (error) {
        console.error('Ошибка загрузки изображений:', error);
      }
    };

    loadImages();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-800 px-4 py-8 sm:px-6">
      <HomeButton />


      {images.length > 0 ? (
          <ColoringBook
              images={images}
              randomizeImage={true}
              maxBrushSize={40}
          />
      ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Загрузка изображений...</p>
          </div>
      )}
    </div>
  );
}
