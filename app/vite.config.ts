/// <reference types="vitest" />
/// <reference types="vite/client" />

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {VitePWA} from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
    return {
        base: './',
        plugins: [tailwindcss(), react(), tsconfigPaths(), VitePWA({
            registerType: "autoUpdate",
            injectRegister: 'auto',
            workbox: {
                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,mp3,jpg,jpeg,gif}",
                    "./puzzle/**/*",
                ],
                // Явно добавляем offline.html в precache
                additionalManifestEntries: [
                    { url: 'offline.html', revision: null }
                ],
                // Настройка для постоянного кэширования
                skipWaiting: true,
                clientsClaim: true,
                // Увеличенное время хранения в кэше - фактически "навсегда"
                runtimeCaching: [
                    {
                        // Кэшируем все ресурсы приложения
                        urlPattern: /.*/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "app-cache",
                            expiration: {
                                // Максимальное количество записей (очень большое)
                                maxEntries: 1000,
                                // Практически "навсегда" - 365 дней
                                maxAgeSeconds: 31536000
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: 'Games',
                short_name: 'Games',
                start_url: './',
                display: 'standalone',
                background_color: "#152937",
                theme_color: "#152937",
                icons: [
                    {
                        "src": "./icons/icon-48x48.png",
                        "sizes": "48x48",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-72x72.png",
                        "sizes": "72x72",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-96x96.png",
                        "sizes": "96x96",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-128x128.png",
                        "sizes": "128x128",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-144x144.png",
                        "sizes": "144x144",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-152x152.png",
                        "sizes": "152x152",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-256x256.png",
                        "sizes": "256x256",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-384x384.png",
                        "sizes": "384x384",
                        "type": "image/png"
                    },
                    {
                        "src": "./icons/icon-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                    }
                ],
            }
        })],
        build: {
            outDir: 'dist',
            emptyOutDir: true,
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/test/setup.ts',
            css: true,
        },
    }
});
