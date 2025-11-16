import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        https: false,
        port: 3000,
        host: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        }
      },
      plugins: [
        react(), 
        basicSsl(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: "Estrella Delivery",
            short_name: "Estrella",
            description: "Pide comida a domicilio de tus restaurantes favoritos de forma rápida y fácil. Con Estrella Delivery, disfruta de los mejores platos de la ciudad en la comodidad de tu hogar.",
            theme_color: "#f97316",
            background_color: "#ffffff",
            display: "standalone",
            start_url: "/",
            icons: [
              {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png"
              },
              {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png"
              },
              {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                "purpose": "maskable"
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
            runtimeCaching: [
              {
                urlPattern: new RegExp('^' + env.VITE_SUPABASE_URL),
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'supabase-api-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 // 1 day
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // Forzar una única copia de React para evitar el error de "Invalid hook call"
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        }
      },
      optimizeDeps: {
        exclude: ['/api/*'],
      },
      build: {
        rollupOptions: {
          external: ['/api/*'],
        },
      }
    };
});
