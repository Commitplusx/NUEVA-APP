import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  server: {
    // 👇 ¡AQUÍ ESTÁ EL CAMBIO! 👇
    url: 'https://app-estrella.shop',
    androidScheme: 'https', // Usar https para producción
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