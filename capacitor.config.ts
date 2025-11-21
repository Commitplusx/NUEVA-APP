import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  // server: {
  //   url: 'http://192.168.1.X:5173', // Solo para desarrollo con live reload
  //   cleartext: true
  // },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'dark'
    },
    Mapbox: {
      accessToken: 'pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9'
    }
  }
};

export default config;
