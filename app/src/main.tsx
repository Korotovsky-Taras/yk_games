import {StrictMode, useEffect} from 'react';
import { registerServiceWorker, handleOfflineStatus } from './utils/pwa';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PuzzleRoot } from '~/navigation/puzzle';
import { MemoryRoot } from './navigation/memory/root';
import { MemoryGame } from './navigation/memory/game';
import { DrawingRoot } from '~/navigation/drawing';
import { Main } from '~/navigation/main';
import { useTouchscreenFix } from './hooks/useTouchscreenFix';
import './index.css';

// Register service worker and handle offline status
registerServiceWorker().then(() => {
    console.log('Service worker зарегистрирован успешно');
    handleOfflineStatus();

    // Добавляем специальный обработчик для тачскринов
    if ('ontouchstart' in window) {
        // Запрещаем обычное поведение кэша браузера при перезагрузке
        window.addEventListener('beforeunload', (event) => {
            // Устанавливаем флаг в сессии, чтобы избежать сброса кэша
            sessionStorage.setItem('normalReload', 'true');
        });
    }
});

// App component with router
function App() {
    // Используем специальный хук для исправления поведения тачскринов
    useTouchscreenFix();
    
    useEffect(() => {
        // Проверяем наличие сохраненного пути для восстановления после офлайн-режима
        const lastPath = sessionStorage.getItem('lastPath');
        if (lastPath && navigator.onLine) {
            sessionStorage.removeItem('lastPath');
            // Можно перейти на сохраненный путь, если нужно
        }
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/puzzle" element={<PuzzleRoot />} />
                <Route path="/drawing" element={<DrawingRoot />} />
                <Route path="/memory" element={<MemoryRoot />} />
                <Route path="/memory/game" element={<MemoryGame />} />
            </Routes>
        </HashRouter>
    );
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
