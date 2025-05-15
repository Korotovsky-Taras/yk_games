import React, { useRef, useEffect, useState, useCallback } from 'react';
import {Button} from "~/components/Button";

interface ColorInfo {
  color: string;
  label?: string;
}

interface Position {
  x: number;
  y: number;
  c: number; // индекс цвета
  s: number; // размер кисти
}

interface ColoringBookProps {
  images: string[];
  colors?: ColorInfo[];
  width?: string | number;
  maxBrushSize?: number;
  randomizeImage?: boolean;
}

const DEFAULT_COLORS: ColorInfo[] = [
  { color: 'rgba(255, 255, 255)' },
  { color: 'rgba(160, 160, 160)' },
  { color: 'rgba(87, 87, 87)' },
  { color: 'rgba(220, 35, 35)' },
  { color: 'rgba(42, 75, 215)' },
  { color: 'rgba(29, 105, 20)' },
  { color: 'rgba(129, 74, 25)' },
  { color: 'rgba(129, 38, 192)' },
  { color: 'rgba(129, 197, 122)' },
  { color: 'rgba(157, 175, 255)' },
  { color: 'rgba(41, 208, 208)' },
  { color: 'rgba(255, 146, 51)' },
  { color: 'rgba(255, 238, 51)' },
  { color: 'rgba(233, 222, 187)' },
  { color: 'rgba(255, 205, 243)' },
];

const defaultImages = [
  './drawing/pic-01.jpg',
  './drawing/pic-02.jpg',
  './drawing/pic-03.jpg',
  './drawing/pic-04.jpg',
  './drawing/pic-05.jpg',
  './drawing/pic-06.jpg',
  './drawing/pic-07.jpg',
  './drawing/pic-08.jpg',
  './drawing/pic-09.jpg',
];

const images = defaultImages;
const colors = DEFAULT_COLORS;
const maxBrushSize = 42;
const minBrushSize = 1;
const initialBrushSize = maxBrushSize/2;


const ColoringBookDeep = () => {

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null); // Финальный канвас с результатом
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null); // Канвас для временного рисования
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Ссылка на набор разрешенных пикселей (не черные области, которые можно закрашивать)
  const allowedPixelsRef = useRef<Set<string>>(new Set());
  // Ссылка на карту закрашенных пикселей и их цветов
  const coloredPixelsRef = useRef<Map<string, string>>(new Map());


  const [dragging, setDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentColor, setCurrentColor] = useState(1);
  const [brushSize, setBrushSize] = useState(initialBrushSize);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [cursor, setCursor] = useState<string>('');

  // Функция для сохранения данных в localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!selectedImage) {
      console.log('Не удалось сохранить данные: не выбрано изображение');
      return;
    }
    
    const key = `coloringBook_${selectedImage}`;
    const dataToSave = {
      coloredPixels: Array.from(coloredPixelsRef.current.entries())
    };


    try {
      localStorage.setItem(key, JSON.stringify(dataToSave));
      console.log(`Данные сохранены в localStorage с ключом: ${key}`);
      console.log(`Сохранено ${coloredPixelsRef.current.size} закрашенных пикселей`);
    } catch (e) {
      console.error('Ошибка при сохранении данных в localStorage:', e);
    }
  }, [selectedImage]);
  
  // Функция для загрузки данных из localStorage
  const loadFromLocalStorage = useCallback((imageSrc: string) => {
    const key = `coloringBook_${imageSrc}`;
    console.log(`Попытка загрузки данных из localStorage с ключом: ${key}`);
    
    const savedData = localStorage.getItem(key);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Данные найдены в localStorage, парсинг...');

        // Очищаем текущие данные
        coloredPixelsRef.current.clear();
        
        // Восстанавливаем данные о закрашенных пикселях
        if (parsedData.coloredPixels && Array.isArray(parsedData.coloredPixels)) {
          coloredPixelsRef.current = new Map(parsedData.coloredPixels);
          console.log(`Загружено ${coloredPixelsRef.current.size} закрашенных пикселей`);
        }
        
        return true;
      } catch (e) {
        console.error('Ошибка при загрузке данных из localStorage:', e);
      }
    } else {
      console.log('Данные не найдены в localStorage');
    }
    
    return false;
  }, []);
  
  // Функция для отрисовки закрашенных пикселей
  const renderColoredPixelsFromMap = useCallback(() => {
    console.log('Отрисовка закрашенных пикселей из Map...');
    const finalCanvas = finalCanvasRef.current;
    if (!finalCanvas) {
      console.log('Ошибка: finalCanvas не найден');
      return;
    }
    
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) {
      console.log('Ошибка: не удалось получить контекст канваса');
      return;
    }
    
    // Проверяем, есть ли пиксели для отрисовки
    if (coloredPixelsRef.current.size === 0) {
      console.log('Нет закрашенных пикселей для отрисовки');
      return;
    }
    
    console.log(`Отрисовка ${coloredPixelsRef.current.size} закрашенных пикселей`);
    
    // Обновляем канвас с сохраненными пикселями
    coloredPixelsRef.current.forEach((color, pixelKey) => {
      const [x, y] = pixelKey.split(',').map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  }, []);
  
  // Инициализация выбранного изображения
  useEffect(() => {
    if (images && images.length > 0) {
      const defaultImage = images[0];
      setSelectedImage(defaultImage);
    }
  }, []);  // Убираем зависимость от loadFromLocalStorage
  
  // Отдельный useEffect для загрузки данных из localStorage после изменения selectedImage
  useEffect(() => {
    if (selectedImage) {
      // Пытаемся загрузить данные из localStorage для выбранного изображения
      console.log(`Загрузка данных для изображения: ${selectedImage}`);
      loadFromLocalStorage(selectedImage);
      
      // Обновляем канвас, если изображение уже загружено
      if (imgRef.current && imgRef.current.complete) {
        renderColoredPixelsFromMap();
      }
    }
  }, [selectedImage, loadFromLocalStorage, renderColoredPixelsFromMap]);


  // Обновление курсора при изменении цвета или размера кисти
  useEffect(() => {
    updateCursor();
  }, [currentColor, brushSize, isPanning]);

  // Обработчик изменения размера окна
  const handleResize = useCallback(() => {
    if (imgRef.current && finalCanvasRef.current && drawingCanvasRef.current) {
      handleImageLoad();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const updateCursor = () => {
    if (isPanning) {
      setCursor('grab');
      return;
    }

    let size = Math.max(minBrushSize, Math.min(brushSize, maxBrushSize));

    const canvasSize = size * 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const context = canvas.getContext('2d');
    if (!context) return;

    const center = canvasSize / 2;
    context.beginPath();
    context.arc(center, center, size/2, 0, 2 * Math.PI, false);

    const colorIndex = currentColor >= 0 && currentColor < colors.length ? currentColor : 0;
    context.fillStyle = colors[colorIndex].color;
    context.fill();
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.stroke();

    const url = canvas.toDataURL();

    setCursor(`url(${url}) ${center} ${center}, pointer`);
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    const finalCanvas = finalCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const container = canvasContainerRef.current;

    if (!img || !finalCanvas || !drawingCanvas || !container) {
      console.log('Ошибка: не удалось найти элементы для handleImageLoad');
      return;
    }

    console.log('Изображение загружено, настраиваем канвас...');

    // Устанавливаем размеры канвасов по размеру изображения
    const imgNaturalWidth = img.naturalWidth || 400;
    const imgNaturalHeight = img.naturalHeight || 400;

    console.log({imgNaturalWidth, imgNaturalHeight})

    finalCanvas.width = imgNaturalWidth;
    finalCanvas.height = imgNaturalHeight;
    drawingCanvas.width = imgNaturalWidth;
    drawingCanvas.height = imgNaturalHeight;

    // Центрируем изображение в контейнере
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.display = 'block';
    img.style.margin = 'auto';

    // Анализируем изображение для определения разрешенных пикселей
    analyzeImageForAllowedPixels(imgNaturalWidth, imgNaturalHeight);

    // Отрисовываем закрашенные пиксели из localStorage
    renderColoredPixelsFromMap();
  };

  const analyzeImageForAllowedPixels = (width: number, height: number) => {
    console.log(width, height)
    const img = imgRef.current;
    if (!img) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

    if (!tempCtx) return;
    
    // Очищаем только набор разрешенных пикселей
    // НЕ очищаем coloredPixelsRef, чтобы не потерять загруженные из localStorage данные
    allowedPixelsRef.current.clear();

    // Рисуем оригинальное изображение на временном канвасе
    tempCtx.drawImage(img, 0, 0, width, height);

    // Получаем данные пикселей
    const imgData = tempCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    // Анализируем каждый пиксель изображения, чтобы найти разрешенные области
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
      const pixelKey = `${Math.floor(x)},${Math.floor(y)}`;

      // Пиксель считается разрешенным, если он не черный (или почти черный) и не прозрачный
      const isBlack = r < 50 && g < 50 && b < 50 && a > 0;
      if (!isBlack && a > 0) {
        allowedPixelsRef.current.add(pixelKey);
      }
    }

    console.log(`Найдено ${allowedPixelsRef.current.size} разрешенных пикселей для закрашивания`);
  };

  const getCursorPosition = (e: React.MouseEvent | React.Touch): Position => {
    const drawingCanvas = drawingCanvasRef.current;
    const img = imgRef.current;
    const wrapper = wrapperRef.current;

    if (!drawingCanvas || !img || !wrapper) return { x: 0, y: 0, c: currentColor, s: brushSize };

    // Handle both React synthetic events and DOM events
    const clientX = 'clientX' in e ? e.clientX : ('touches' in e && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = 'clientY' in e ? e.clientY : ('touches' in e && e.touches[0] ? e.touches[0].clientY : 0);

    // Get canvas position relative to viewport
    const rect = drawingCanvas.getBoundingClientRect();

    // Calculate scale factor
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Adjust coordinates for image scaling
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return {
      x,
      y,
      c: currentColor,
      s: brushSize,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setCursor('grabbing');
      return;
    }

    const pos = getCursorPosition(e);
    console.log("setDragging -< true")
    setDragging(true);
    setCurrentPath([pos]);
    drawPath([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!dragging) return;

    const pos = getCursorPosition(e);
    setCurrentPath(prev => [...prev, pos]);
    drawPath([...currentPath, pos]);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      updateCursor();
      return;
    }

    if (dragging) {
      mergeDrawingToFinal();
      setDragging(false);
      setCurrentPath([]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPanning(true);
      setCursor('grabbing');
      return;
    }

    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getCursorPosition(touch);
      setDragging(true);
      setCurrentPath([pos]);
      drawPath([pos]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length >= 3) return;

    if (!dragging) return;

    const touch = e.touches[0];
    const pos = getCursorPosition(touch);
    console.log(pos)
    setCurrentPath(prev => [...prev, pos]);
    drawPath([...currentPath, pos]);

    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (isPanning) {
      setIsPanning(false);
      updateCursor();
      return;
    }

    if (dragging) {
      mergeDrawingToFinal();
      setDragging(false);
      setCurrentPath([]);
    }
  };

  const drawPath = (path: Position[]) => {
    const drawingCanvas = drawingCanvasRef.current;
    const img = imgRef.current;

    if (!drawingCanvas || !img || path.length < 1) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    // Очищаем временный канвас
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    const colorIndex = path[0].c;
    const strokeSize = path[0].s;

    if (colorIndex >= 0 && colorIndex < colors.length) {
      ctx.strokeStyle = colors[colorIndex].color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = strokeSize * (img.naturalWidth / img.width);
      ctx.globalCompositeOperation = "source-over";

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);

      for (let j = 1; j < path.length; j++) {
        ctx.lineTo(path[j].x, path[j].y);
      }

      ctx.stroke();
    }
  };

  const mergeDrawingToFinal = () => {
    const finalCanvas = finalCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const img = imgRef.current;
    const allowedPixels = allowedPixelsRef.current;
    const coloredPixels = coloredPixelsRef.current;

    if (!finalCanvas || !drawingCanvas || !img || currentPath.length < 1) return;

    const finalCtx = finalCanvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');
    if (!finalCtx || !drawingCtx) return;

    const colorIndex = currentPath[0].c;
    const strokeSize = currentPath[0].s;

    // Определяем границы области, в которой происходило рисование
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = 0;
    let maxY = 0;

    // Находим границы области рисования, расширенные на размер кисти
    currentPath.forEach(point => {
      minX = Math.max(0, Math.min(minX, point.x - strokeSize));
      minY = Math.max(0, Math.min(minY, point.y - strokeSize));
      maxX = Math.min(drawingCanvas.width, Math.max(maxX, point.x + strokeSize));
      maxY = Math.min(drawingCanvas.height, Math.max(maxY, point.y + strokeSize));
    });

    // Округляем границы до целых чисел
    minX = Math.floor(minX);
    minY = Math.floor(minY);
    maxX = Math.ceil(maxX);
    maxY = Math.ceil(maxY);

    // Ширина и высота региона, который мы будем обрабатывать
    const regionWidth = maxX - minX;
    const regionHeight = maxY - minY;

    // Получаем данные пикселей только для области, где происходило рисование
    const drawingData = drawingCtx.getImageData(minX, minY, regionWidth, regionHeight);
    const drawingPixels = drawingData.data;

    // Получаем данные пикселей финального канваса для той же области
    const finalData = finalCtx.getImageData(minX, minY, regionWidth, regionHeight);
    const finalPixels = finalData.data;

    // Обходим только пиксели в выделенной области
    for (let i = 0; i < drawingPixels.length; i += 4) {
      const alpha = drawingPixels[i + 3];
      if (alpha === 0) continue; // Пропускаем прозрачные пиксели

      // Вычисляем координаты пикселя относительно всего холста
      const localX = (i / 4) % regionWidth;
      const localY = Math.floor((i / 4) / regionWidth);
      const x = minX + localX;
      const y = minY + localY;
      const pixelKey = `${x},${y}`;

      // Проверяем, что пиксель либо является разрешенным для закрашивания,
      // либо уже был закрашен ранее (чтобы избежать белых пикселей при повторной закраске)
      if (allowedPixels.has(pixelKey) || coloredPixels.has(pixelKey)) {
        // Копируем цвет из временного канваса в финальный
        finalPixels[i] = drawingPixels[i];
        finalPixels[i + 1] = drawingPixels[i + 1];
        finalPixels[i + 2] = drawingPixels[i + 2];
        finalPixels[i + 3] = drawingPixels[i + 3];
        coloredPixels.set(pixelKey, colors[colorIndex].color);
      }
    }



    // Обновляем только измененную область финального канваса
    finalCtx.putImageData(finalData, minX, minY);
    // Очищаем временный канвас
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Сохраняем данные в localStorage при изменении закрашенных пикселей
    saveToLocalStorage();
    renderColoredPixelsFromMap();
  };

  const handleClearCanvas = () => {
    const finalCanvas = finalCanvasRef.current;
    if (!finalCanvas) return;

    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    coloredPixelsRef.current.clear();
    
    // Удаляем сохраненные данные из localStorage
    if (selectedImage) {
      const key = `coloringBook_${selectedImage}`;
      localStorage.removeItem(key);
      console.log(`Удалены данные из localStorage с ключом: ${key}`);
    }
  };


  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
      const image = new Image();
      image.addEventListener('load', () => {
        resolve(image);
      });
      image.src = url;
    });
  };

  const getImageData = async (): Promise<string> => {
    const img = imgRef.current;
    const finalCanvas = finalCanvasRef.current;

    if (!img || !finalCanvas) return '';

    const height = img.naturalHeight || 400;
    const width = img.naturalWidth || 400;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;

    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    // Отрисовка фонового изображения
    ctx.drawImage(img, 0, 0, width, height);

    // Отрисовка рисунка сверху
    const drawingImage = await loadImage(finalCanvas.toDataURL('image/png'));
    ctx.drawImage(drawingImage, 0, 0);

    return tempCanvas.toDataURL('image/png');
  };


  const selectImage = (src: string) => {
    console.log(`Выбор изображения: ${src}`);
    // Очищаем текущий путь рисования
    handleClearCanvas();
    setCurrentPath([]);
    // Очищаем данные перед загрузкой новых из localStorage
    coloredPixelsRef.current.clear();
    allowedPixelsRef.current.clear();

    // Изменяем выбранное изображение
    // Загрузка данных из localStorage произойдет в useEffect, зависящем от selectedImage
    setSelectedImage(src);
  };

  return (
      <>
        <div className="flex-1 flex flex-col h-full mr-[80px] mb-[70px]">
          {/* Верхняя панель для выбора изображений */}
          {images && images.length > 1 && (
              <div className="flex flex-wrap justify-center mb-2">
                {images.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        className={`box-border border-2 ${
                            selectedImage === src ? 'border-green-500' : 'border-gray-300'
                        } w-16 h-16 object-cover m-1 cursor-pointer`}
                        onClick={() => selectImage(src)}
                        alt={`Страница раскраски ${index + 1}`}
                    />
                ))}
              </div>
          )}

          {/* Область канваса */}
          <div className="flex-1 relative overflow-hidden flex justify-center items-center" ref={canvasContainerRef}>
            <div
                className="absolute transform origin-center h-full"
                style={{ cursor: cursor }}
                ref={wrapperRef}
            >
              {selectedImage && <img
                  ref={imgRef}
                  src={selectedImage}
                  className="w-full h-full object-contain select-none"
                  onLoad={handleImageLoad}
                  alt="Фон холста раскраски"
                  draggable="false"
              />}
              <canvas
                  ref={finalCanvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              <canvas
                  ref={drawingCanvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: 'none' }}
              />
            </div>
          </div>
        </div>

        <Button
            size="small"
            className="fixed right-10 top-10 "
            onClick={handleClearCanvas}
        >
          Ачысціць
        </Button>


        <div className="fixed right-10 top-1/2 transform -translate-y-1/2 h-1/2 z-50">

          <div
              className="relative h-full flex flex-col items-center justify-center"
              style={{ width: '60px' }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const container = e.currentTarget;
                let previewSize = brushSize;

                const handleMouseMove = (moveEvent) => {
                  const height = rect.height;
                  const y = moveEvent.clientY - rect.top;
                  const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
                  previewSize = Math.max(minBrushSize, Math.min(maxBrushSize, Math.round(percentage * maxBrushSize)));

                  // Update preview visually using stored container reference
                  const coloredTrack = container.querySelector('.colored-track');
                  const currentIndicator = container.querySelector('.current-indicator');
                  if (coloredTrack && currentIndicator) {
                    coloredTrack.style.height = `${(previewSize / maxBrushSize) * 100}%`;
                    currentIndicator.style.bottom = `${(previewSize / maxBrushSize) * 100}%`;
                    currentIndicator.style.width = `${previewSize}px`;
                  }
                };

                const handleMouseUp = (upEvent) => {
                  const height = rect.height;
                  const y = upEvent.clientY - rect.top;
                  const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
                  const newSize = Math.max(minBrushSize, Math.min(maxBrushSize, Math.round(percentage * maxBrushSize)));
                  setBrushSize(newSize);

                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onTouchStart={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const container = e.currentTarget;
                let previewSize = brushSize;

                const handleTouchMove = (moveEvent) => {
                  if (moveEvent.touches.length > 0) {
                    const touch = moveEvent.touches[0];
                    const height = rect.height;
                    const y = touch.clientY - rect.top;
                    const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
                    previewSize = Math.max(minBrushSize, Math.min(maxBrushSize, Math.round(percentage * maxBrushSize)));

                    // Update preview visually using stored container reference
                    const coloredTrack = container.querySelector('.colored-track');
                    const currentIndicator = container.querySelector('.current-indicator');
                    if (coloredTrack && currentIndicator) {
                      coloredTrack.style.height = `${(previewSize / maxBrushSize) * 100}%`;
                      currentIndicator.style.bottom = `${(previewSize / maxBrushSize) * 100}%`;
                      currentIndicator.style.width = `${previewSize}px`;
                    }
                  }
                };

                const handleTouchEnd = (endEvent) => {
                  if (endEvent.changedTouches.length > 0) {
                    const touch = endEvent.changedTouches[0];
                    const height = rect.height;
                    const y = touch.clientY - rect.top;
                    const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
                    const newSize = Math.max(minBrushSize, Math.min(maxBrushSize, Math.round(percentage * maxBrushSize)));
                    setBrushSize(newSize);
                  }

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
              }}
          >

            <div className="absolute h-full w-full">
              {Array.from({ length: maxBrushSize }).map((_, i) => {
                const level = i + 1;
                const width = level;
                return (
                    <div
                        key={i}
                        className="absolute right-0 h-[3px] rounded-r bg-gray-300"
                        style={{
                          bottom: `${(level / maxBrushSize) * 100}%`,
                          width: `${width}px`
                        }}
                    ></div>
                );
              })}
            </div>

            <div
                className="absolute bottom-0 right-0 w-full colored-track"
                style={{
                  height: `${(brushSize / maxBrushSize) * 100}%`,
                  backgroundColor: colors[currentColor]?.color || 'gray',
                  opacity: 0.5
                }}
            ></div>

            <div
                className="absolute right-0 h-[3px] rounded-r current-indicator"
                style={{
                  bottom: `${(brushSize / maxBrushSize) * 100}%`,
                  width: `${brushSize}px`,
                  backgroundColor: colors[currentColor]?.color || 'gray',
                  boxShadow: '0 0 3px rgba(0,0,0,0.5)'
                }}
            ></div>
          </div>
        </div>


        {/* Панель инструментов внизу */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-col">
          <div className="flex justify-between items-center">

            {/* Колонка с карандашами для выбора цветов */}
            <div className="top-0 right-0 bottom-0 h-32 px-20 flex flex-1 flex-row space-x-3 max-h-full overflow-hidden items-end place-content-around from-slate-100 to-slate-200 ">
              {colors.map((colorInfo, index) => (
                  <div
                      key={index}
                      className={`relative cursor-pointer transition-all duration-150 hover:translate-y-0 ${currentColor === index ? 'translate-y-0' : 'translate-y-[20px]'}`}
                      onClick={() => setCurrentColor(index)}
                      title={colorInfo.label || `Цвет ${index + 1}`}
                  >
                    {/* Карандаш */}
                    <div className={`flex flex-col items-center ${currentColor === index ? 'opacity-100' : 'opacity-50'}`}>
                      {/* Кончик карандаша */}
                      <div className="w-12 h-4 relative mb-[-2px] z-10">
                        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                          <div
                              className="w-12 h-12 transform rotate-45 translate-y-[-4px] translate-y-0"
                              style={{ backgroundColor: colorInfo.color }}
                          ></div>
                        </div>
                        {/* Тень для кончика */}
                        <div className="absolute inset-0 bg-black opacity-10 overflow-hidden">
                          <div className="w-8 h-8 transform rotate-45 translate-x-[-4px] translate-y-0"></div>
                        </div>
                      </div>

                      {/* Основная часть карандаша */}
                      <div className="flex w-12">
                        <div
                            className="w-12 h-20 shadow-sm"
                            style={{ backgroundColor: colorInfo.color }}
                        ></div>
                      </div>
                    </div>

                  </div>
              ))}
            </div>

          </div>
        </div>
      </>
  );
};

export default ColoringBookDeep;