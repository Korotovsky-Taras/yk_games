/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {

    const isProduction = command === 'build';
    const basePath = isProduction ? '/yk_games/' : './';

    return {
        base: basePath,
        plugins: [
            tailwindcss(),
            react(),
            tsconfigPaths(),
            VitePWA({
                registerType: 'autoUpdate',
                strategies: 'generateSW',
                workbox: {
                    globPatterns: [
                        '**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,mp3,woff2,json}',
                    ],
                    navigateFallback: `${basePath}index.html`,
                    navigateFallbackDenylist: [/^\/api\/.*$/, /\/auth\/.*/],
                    skipWaiting: true,
                    clientsClaim: true,
                    runtimeCaching: [
                        {
                            urlPattern: /\.html$/,
                            handler: "StaleWhileRevalidate",
                            options: {
                                cacheName: "html-cache",
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 31536000
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },

                        {
                            urlPattern: /\.(?:js|css|woff2|json)$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'static-assets',
                                expiration: {
                                    maxEntries: 60,
                                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
                                }
                            }
                        },
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|mp3)$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'media-assets',
                                expiration: {
                                    maxEntries: 200,
                                    maxAgeSeconds: 365 * 24 * 60 * 60 // 1 год
                                }
                            }
                        },
                        {
                            urlPattern: ({ url }) => {
                                return url.origin === self.location.origin &&
                                    (url.pathname.endsWith('/') ||
                                        url.hash.startsWith('#/'));
                            },
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'html-documents',
                                expiration: {
                                    maxEntries: 20,
                                    maxAgeSeconds: 7 * 24 * 60 * 60 // 1 неделя
                                },
                                networkTimeoutSeconds: 3 // Быстрый fallback на кэш
                            }
                        }
                    ]
                },
                includeAssets: [
                    "index.html",
                    "drawing.png",
                    "favicon.ico",
                    "home.svg",
                    "memory.png"
                ],
                manifest: {
                    name: 'Гульні Якуба Коласа',
                    short_name: 'Гульні',
                    display: 'standalone',
                    background_color: "#152937",
                    theme_color: "#152937",
                    start_url: `${basePath}#/`,
                    scope: `${basePath}`,
                    icons: [
                        {
                            "src": `${basePath}icons/icon-48x48.png`,
                            "sizes": "48x48",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-72x72.png`,
                            "sizes": "72x72",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-96x96.png`,
                            "sizes": "96x96",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-128x128.png`,
                            "sizes": "128x128",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-144x144.png`,
                            "sizes": "144x144",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-152x152.png`,
                            "sizes": "152x152",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-192x192.png`,
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-256x256.png`,
                            "sizes": "256x256",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-384x384.png`,
                            "sizes": "384x384",
                            "type": "image/png"
                        },
                        {
                            "src": `${basePath}icons/icon-512x512.png`,
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                    ]
                }
            })
        ],
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