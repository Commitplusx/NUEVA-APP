import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  server: {
    url: 'https://app-estrella.shop/',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'dark'
    }
  }
};

export default config;
