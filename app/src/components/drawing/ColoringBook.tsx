import React, { useRef, useEffect, useState, useCallback } from 'react';

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

interface PixelData {
  occupiedPixels: boolean[];
  coloredPixels: Map<string, number>; // Ключ: 'x,y', Значение: индекс цвета
  width: number;
  height: number;
}

interface ColoredArea {
  x: number;
  y: number;
  width: number;
  height: number;
  colorIndex: number;
}

interface ColoringBookProps {
  images: string[];
  colors?: ColorInfo[];
  width?: string | number;
  maxBrushSize?: number;
  randomizeImage?: boolean;
}

const DEFAULT_COLORS: ColorInfo[] = [
  { color: 'rgba(87, 87, 87, 0.8)' },
  { color: 'rgba(220, 35, 35, 0.8)' },
  { color: 'rgba(42, 75, 215, 0.8)' },
  { color: 'rgba(29, 105, 20, 0.8)' },
  { color: 'rgba(129, 74, 25, 0.8)' },
  { color: 'rgba(129, 38, 192, 0.8)' },
  { color: 'rgba(160, 160, 160, 0.8)' },
  { color: 'rgba(129, 197, 122, 0.8)' },
  { color: 'rgba(157, 175, 255, 0.8)' },
  { color: 'rgba(41, 208, 208, 0.8)' },
  { color: 'rgba(255, 146, 51, 0.8)' },
  { color: 'rgba(255, 238, 51, 0.8)' },
  { color: 'rgba(233, 222, 187, 0.8)' },
  { color: 'rgba(255, 205, 243, 0.8)' },
  { color: 'rgba(255, 255, 255, 0.8)' }, // Ластик
];

const ColoringBook = () => {
  // Тестовые данные для примера
  const defaultImages = [
    '/drawing/astronaut.png',
    '/drawing/eagle.png',
    '/drawing/glass.jpg',
  ];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const colorMapRef = useRef<Map<string, number>>(new Map());
  const originalPixelsRef = useRef<ImageData | null>(null);

  const [dragging, setDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [paths, setPaths] = useState<Position[][]>([]);
  const [currentColor, setCurrentColor] = useState(1); // По умолчанию первый реальный цвет (второй элемент в массиве)
  const [brushSize, setBrushSize] = useState(8);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [cursor, setCursor] = useState<string>('');

  // Использование тестовых данных по умолчанию
  const images = defaultImages;
  const colors = DEFAULT_COLORS;
  const maxBrushSize = 32;

  // Throttle для обработки resize
  const throttle = (func: Function, delay: number) => {
    let timeout: number | null = null;

    return (...args: any[]) => {
      if (timeout === null) {
        timeout = window.setTimeout(() => {
          func(...args);
          timeout = null;
        }, delay);
      }
    };
  };

  // Инициализация выбранного изображения
  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, []);

  // Загрузка сохраненных путей из localStorage при изменении изображения
  useEffect(() => {
    if (selectedImage) {
      try {
        const savedPaths = localStorage.getItem(`v2:${selectedImage}`);
        if (savedPaths) {
          setPaths(JSON.parse(savedPaths));
        } else {
          setPaths([]);
        }
      } catch (error) {
        console.error('Error loading paths from localStorage:', error);
        setPaths([]);
      }
    }
  }, [selectedImage]);

  // Обновление курсора при изменении цвета или размера кисти
  useEffect(() => {
    updateCursor();
  }, [currentColor, brushSize, isPanning]);

  // Обработчик изменения размера окна с троттлингом
  const handleResize = useCallback(throttle(() => {
    if (imgRef.current && canvasRef.current && activeCanvasRef.current) {
      handleImageLoad();
      if (selectedImage) {
        try {
          const savedPaths = localStorage.getItem(`v2:${selectedImage}`);
          if (savedPaths) {
            setPaths(JSON.parse(savedPaths));
          } else {
            setPaths([]);
          }
        } catch (error) {
          console.error('Error loading paths from localStorage:', error);
          setPaths([]);
        }
      }
    }
  }, 200), [selectedImage]);

  // Добавляем обработчик изменения размера окна
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Обновление рисунка при изменении путей, изображения, зума или смещения
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      refreshCanvas();
    }
  }, [paths, selectedImage]);

  const refreshCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Проверяем наличие путей перед обработкой
    if (!paths || paths.length === 0) return;

    // Отрисовка всех путей
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (!path || path.length < 1) continue;

      const colorIndex = path[0].c;
      const strokeSize = path[0].s;

      // Проверяем, что colorIndex в пределах допустимого диапазона
      if (colorIndex >= 0 && colorIndex < colors.length) {
        ctx.strokeStyle = colors[colorIndex].color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = strokeSize * (img.naturalWidth / img.width);

        if (colorIndex === colors.length - 1) {
          // Ластик
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = 'white';
        } else {
          ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let j = 1; j < path.length; j++) {
          ctx.lineTo(path[j].x, path[j].y);
        }

        ctx.stroke();
      }
    }
  };

  const updateCursor = () => {
    if (isPanning) {
      setCursor('grab');
      return;
    }

    let size = brushSize;
    if (size < 2) size = 2;
    if (size > maxBrushSize) size = maxBrushSize;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.arc(16, 16, size / 2, 0, 2 * Math.PI, false);

    // Защита от возможного undefined colorIndex
    const colorIndex = currentColor >= 0 && currentColor < colors.length ? currentColor : 0;
    context.fillStyle = colors[colorIndex].color;

    context.fill();
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.stroke();

    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.beginPath();
    context.moveTo(0, 16);
    context.lineTo(32, 16);
    context.moveTo(16, 0);
    context.lineTo(16, 32);
    context.stroke();

    const url = canvas.toDataURL();
    setCursor(`url(${url}) 16 16, pointer`);
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const activeCanvas = activeCanvasRef.current;
    const container = canvasContainerRef.current;

    if (!img || !canvas || !activeCanvas || !container) return;

    // Устанавливаем canvas по размеру изображения
    const imgNaturalWidth = img.naturalWidth || 400;
    const imgNaturalHeight = img.naturalHeight || 400;

    // Устанавливаем размеры холста соответствующие реальным размерам изображения
    canvas.width = imgNaturalWidth;
    canvas.height = imgNaturalHeight;
    activeCanvas.width = imgNaturalWidth;
    activeCanvas.height = imgNaturalHeight;


    // Установка стиля для изображения чтобы оно было по центру
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.display = 'block';
    img.style.margin = 'auto';

    // Создаем временный канвас для анализа оригинального изображения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgNaturalWidth;
    tempCanvas.height = imgNaturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Рисуем оригинальное изображение на временном канвасе
      tempCtx.drawImage(img, 0, 0, imgNaturalWidth, imgNaturalHeight);
      
      // Получаем данные пикселей
      const imgData = tempCtx.getImageData(0, 0, imgNaturalWidth, imgNaturalHeight);
      console.log({imgData})
      originalPixelsRef.current = imgData;
      
      // Очищаем карту цветов при загрузке нового изображения
      colorMapRef.current.clear();
    }

    refreshCanvas();
  };

  const getCursorPosition = (e: React.MouseEvent | React.Touch): Position => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !img || !wrapper) return { x: 0, y: 0, c: currentColor, s: brushSize };

    const rect = wrapper.getBoundingClientRect();
    const scaleX = canvas.width / img.clientWidth;

    // Получаем координаты с учетом зума и смещения
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      c: currentColor,
      s: brushSize,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // Проверяем, нажата ли средняя кнопка мыши или Shift для режима перемещения
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setCursor('grabbing');
      return;
    }

    const pos = getCursorPosition(e);
    setDragging(true);
    setPaths(prevPaths => [...(prevPaths || []), [pos]]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();


    if (!dragging) return;

    const pos = getCursorPosition(e);

    // Безопасное обновление путей с проверкой на undefined
    setPaths(prevPaths => {
      if (!prevPaths || prevPaths.length === 0) return [[pos]];

      const newPaths = [...prevPaths];
      const currentPathIndex = newPaths.length - 1;

      if (currentPathIndex >= 0) {
        const currentPath = newPaths[currentPathIndex] || [];
        newPaths[currentPathIndex] = [...currentPath, pos];
      }

      return newPaths;
    });

    drawActivePath();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isPanning) {
      setIsPanning(false);
      updateCursor();
      return;
    }

    if (dragging) {
      commitActivePath();
      try {
        localStorage.setItem(`v2:${selectedImage}`, JSON.stringify(paths));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    setDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Проверяем, нажато ли двумя пальцами для режима перемещения
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
      setPaths(prevPaths => [...(prevPaths || []), [pos]]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Обработка перемещения (драга) на тачскрине

    if (e.touches.length >= 3) return;

    e.preventDefault();
    if (!dragging) return;

    const touch = e.touches[0];
    const pos = getCursorPosition(touch);

    // Безопасное обновление путей
    setPaths(prevPaths => {
      if (!prevPaths || prevPaths.length === 0) return [[pos]];

      const newPaths = [...prevPaths];
      const currentPathIndex = newPaths.length - 1;

      if (currentPathIndex >= 0) {
        const currentPath = newPaths[currentPathIndex] || [];
        newPaths[currentPathIndex] = [...currentPath, pos];
      }

      return newPaths;
    });

    drawActivePath();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    if (isPanning) {
      setIsPanning(false);
      updateCursor();
      return;
    }

    if (dragging) {
      commitActivePath();
      try {
        localStorage.setItem(`v2:${selectedImage}`, JSON.stringify(paths));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    setDragging(false);
  };

  const clearActivePath = () => {
    const activeCanvas = activeCanvasRef.current;
    if (!activeCanvas) return;

    const ctx = activeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
  };

  const drawActivePath = (saveToCanvas = false) => {
    clearActivePath();

    const activeCanvas = activeCanvasRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!activeCanvas || !canvas || !img) return;

    // Защита от undefined путей
    if (!paths || paths.length === 0) return;

    const activePath = paths[paths.length - 1];
    if (!activePath || activePath.length < 1) return;

    // Определяем, какой canvas использовать
    let ctx;
    if (saveToCanvas || (activePath[0].c === (colors.length - 1))) {
      ctx = canvas.getContext('2d');
    } else {
      ctx = activeCanvas.getContext('2d');
    }

    if (!ctx) return;

    const colorIndex = activePath[0].c;
    const strokeSize = activePath[0].s;

    // Проверяем валидность colorIndex
    if (colorIndex >= 0 && colorIndex < colors.length) {
      ctx.strokeStyle = colors[colorIndex].color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Устанавливаем толщину кисти с учетом зума
      ctx.lineWidth = strokeSize * (img.naturalWidth / img.width);

      if (colorIndex === colors.length - 1) {
        // Ластик
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = 'white';
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.beginPath();
      ctx.moveTo(activePath[0].x, activePath[0].y);

      for (let j = 1; j < activePath.length; j++) {
        ctx.lineTo(activePath[j].x, activePath[j].y);
      }

      ctx.stroke();
    }
  };

  const commitActivePath = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const colorMap = colorMapRef.current;
    const originalPixels = originalPixelsRef.current;
    
    if (!canvas || !paths.length || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const activePath = paths[paths.length - 1];
    if (!activePath || activePath.length < 1) return;
    
    const colorIndex = activePath[0].c;
    const strokeSize = activePath[0].s;
    
    // Если это ластик или у нас нет оригинальных пикселей, просто рисуем как обычно
    if (colorIndex === colors.length - 1 || !originalPixels) {
      drawActivePath(true);
      return;
    }
    
    // Создаем временный канвас для проверки наложения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      drawActivePath(true);
      return;
    }
    
    // Рисуем текущий путь на временном канвасе
    tempCtx.strokeStyle = colors[colorIndex].color;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    tempCtx.lineWidth = strokeSize * (img.naturalWidth / img.width);
    tempCtx.beginPath();
    tempCtx.moveTo(activePath[0].x, activePath[0].y);
    
    for (let j = 1; j < activePath.length; j++) {
      tempCtx.lineTo(activePath[j].x, activePath[j].y);
    }
    
    tempCtx.stroke();
    
    // Получаем данные пикселей текущего пути
    const pathData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pathPixels = pathData.data;
    
    // Получаем данные текущего канваса
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const currentPixels = currentData.data;
    
    // Проверяем наложение и применяем цвет только если нет конфликта с исходным изображением
    // или с уже нарисованным тем же цветом
    for (let i = 0; i < pathPixels.length; i += 4) {
      const alpha = pathPixels[i + 3];
      
      if (alpha > 0) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const pixelKey = `${x},${y}`;
        
        // Проверяем, не рисовали ли мы уже этим цветом в этом месте
        const existingColorIndex = colorMap.get(pixelKey);
        
        // Проверяем пиксель оригинального изображения
        const originalAlpha = originalPixels.data[i + 3];
        const originalIsTransparent = originalAlpha < 50; // Считаем прозрачным, если альфа меньше 50
        
        // Если на исходном изображении пиксель непрозрачный или уже закрашен тем же цветом, то пропускаем
        if ((!originalIsTransparent && originalPixels.data[i] < 240 && originalPixels.data[i+1] < 240 && originalPixels.data[i+2] < 240) || existingColorIndex === colorIndex) {
          continue;
        }
        
        // Иначе закрашиваем пиксель и запоминаем его
        currentPixels[i] = pathPixels[i];
        currentPixels[i + 1] = pathPixels[i + 1];
        currentPixels[i + 2] = pathPixels[i + 2];
        currentPixels[i + 3] = pathPixels[i + 3];
        
        // Сохраняем информацию о цвете данного пикселя
        colorMap.set(pixelKey, colorIndex);
      }
    }
    
    // Обновляем канвас с учетом примененных изменений
    ctx.putImageData(currentData, 0, 0);
  };

  const handleClearCanvas = () => {
    setPaths([]);
    // Очищаем карту цветов при очистке холста
    colorMapRef.current.clear();
    try {
      localStorage.setItem(`v2:${selectedImage}`, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const handleUndo = () => {
    if (paths && paths.length > 0) {
      const newPaths = [...paths];
      newPaths.pop();
      setPaths(newPaths);
      try {
        localStorage.setItem(`v2:${selectedImage}`, JSON.stringify(newPaths));
      } catch (error) {
        console.error('Error saving to localStorage after undo:', error);
      }
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
    const canvas = canvasRef.current;

    if (!img || !canvas) return '';

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
    const drawingImage = await loadImage(canvas.toDataURL('image/png'));
    ctx.drawImage(drawingImage, 0, 0);

    return tempCanvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    const dataUrl = await getImageData();

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'ColoringBook.png';
    link.click();
  };

  const selectImage = (src: string) => {
    setSelectedImage(src);
    // При изменении изображения нужно очистить пути и сбросить canvas
    setPaths([]);
    // Очищаем карту цветов при смене изображения
    colorMapRef.current.clear();
    // Сбрасываем данные оригинальных пикселей
    originalPixelsRef.current = null;
  };

  return (
      <>
        {/* Основная область с канвасом (с вычетом toolbars) */}
        <div className="flex-1 flex flex-col h-full pr-[80px] pb-[100px]" >
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
                className="absolute transform origin-center"
                style={{
                  cursor: cursor,
                }}
                ref={wrapperRef}
            >
              <img
                  ref={imgRef}
                  src={selectedImage}
                  className="w-full h-full object-contain select-none"
                  onLoad={handleImageLoad}
                  alt="Фон холста раскраски"
                  draggable="false"
              />
              <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              <canvas
                  ref={activeCanvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
              />
            </div>

          </div>
        </div>


        {/* Колонка с выбором цветов справа */}
        <div className="fixed top-0 right-0 w-20 p-2 flex flex-col space-y-2 overflow-y-auto">
          {colors.map((colorInfo, index) => (
              <div
                  key={index}
                  className={`aspect-square rounded-full cursor-pointer ${
                      currentColor === index ? 'ring-2 ring-black transform scale-110' : 'ring-1 ring-gray-300'
                  }`}
                  style={{ backgroundColor: colorInfo.color }}
                  onClick={() => setCurrentColor(index)}
                  title={colorInfo.label}
              />
          ))}
        </div>

        {/* Панель инструментов внизу */}
        <div className="fixed bottom-0 left-0 right-0  p-4 flex flex-col">
          {/* Инструменты */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium mb-1">Размер кисти: {brushSize}</label>
                <input
                    type="range"
                    className="w-32"
                    min="1"
                    max={maxBrushSize}
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm font-medium mb-1">Текущий цвет</span>
                <div
                    className="w-8 h-8 rounded-full ring-1 ring-gray-400"
                    style={{ backgroundColor: colors[currentColor]?.color || 'black' }}
                />
              </div>

            </div>
            <div className="flex space-x-2">
              <button
                  className="bg-gray-300 hover:bg-gray-400 rounded px-3 py-2 flex items-center"
                  onClick={handleUndo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 0 1 0 8H9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l-4-4 4-4" />
                </svg>
                Отменить
              </button>

              <button
                  className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-2 flex items-center"
                  onClick={handleClearCanvas}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Очистить
              </button>
            </div>
          </div>
        </div>
      </>
  );
};

export default ColoringBook;