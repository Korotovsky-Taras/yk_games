import {StrictMode, useEffect, Suspense, lazy} from 'react';

import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { PuzzleRoot } from '~/navigation/puzzle';
import { MemoryRoot } from './navigation/memory/root';
import { MemoryGame } from './navigation/memory/game';
import { DrawingRoot } from '~/navigation/drawing';
import { Main } from '~/navigation/main';
import { useTouchscreenFix } from './hooks/useTouchscreenFix';
import './index.css';


// Компонент приложения
function App() {
    // исправления поведения тачскринов
    useTouchscreenFix();

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
