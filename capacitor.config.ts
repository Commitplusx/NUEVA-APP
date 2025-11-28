import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'App Estrella',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.79:3000',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'dark'
    },
    Mapbox: {
      accessToken: 'pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pOGY4emtkMGI4OTJucTEwcGI1NHF1cCJ9.54Lh3CFkG_QP60n5PHdqPQ'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
