import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  server: {
    url: 'http://192.168.0.110:3000', // Usando la IP local proporcionada
    cleartext: true // Necesario para Android en desarrollo con HTTP
  },
  // NO INCLUIR LA SECCIÓN "server" PARA BUILDS DE PRODUCCIÓN
  plugins: {
    StatusBar: {
      // Esta es la línea clave para que la app respete la barra de estado.
      overlaysWebView: false,
      style: 'dark' // Puedes dejarlo o quitarlo, pero 'false' lo arregla.
    }
  }
};

export default config;
