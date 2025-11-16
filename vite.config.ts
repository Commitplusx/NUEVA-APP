import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

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
      plugins: [react(), basicSsl()],
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
