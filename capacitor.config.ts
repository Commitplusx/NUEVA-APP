import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'App Estrella',
  webDir: 'dist',
  server: {
    url: 'https://app-estrella.shop',
    cleartext: true,
    androidScheme: 'https'
  },
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
