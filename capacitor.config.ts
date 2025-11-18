import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'NUEVA-APP',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.79:3000',
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
