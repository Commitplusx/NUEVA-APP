import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  server: {
    // 👇 ¡AQUÍ ESTÁ EL CAMBIO! 👇
    url: 'http://192.168.1.79:3000',
    androidScheme: 'http', // Usar https para producción
    cleartext: false // Desactivar para producción por seguridad
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'dark'
    }
  }
};

export default config;