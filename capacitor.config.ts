import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist', // O 'build', asegúrate de que sea el correcto
  server: {
    // --- CONFIGURACIÓN CORRECTA ---
    url: 'http://192.168.1.79:3000',
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;