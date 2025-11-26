import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'estrella.app.shop',
  appName: 'App Estrella',
  webDir: 'dist',
  // server: {
  //   url: 'https://app-estrella.shop',
  //   cleartext: true,
  //   androidScheme: 'https'
  // },
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
