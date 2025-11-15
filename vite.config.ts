import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        https: false, // Desactiva HTTPS
        // Asegúrate de que el puerto siga siendo 3000 si lo necesitas
        port: 3000,
        host: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3001', // Assuming your API/serverless functions run on port 3001
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        }
      },
      plugins: [react(), basicSsl()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
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
