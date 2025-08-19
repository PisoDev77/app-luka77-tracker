import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

/**
 * Vite 설정 파일
 * @description SvelteKit과 PWA 기능을 포함한 빌드 설정
 */
export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'Luka Tracker',
        name: 'Luka Tracker - 루카 돈치치 스탯 추적기',
        description: '루카 돈치치의 NBA 성과를 실시간으로 추적하고 분석하는 PWA',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#00538C',
        background_color: '#ffffff',
        lang: 'ko',
        orientation: 'portrait-primary',
        categories: ['sports', 'entertainment'],
        icons: [
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.balldontlie\.io\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'nba-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 15 // 15분 캐시
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js']
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});