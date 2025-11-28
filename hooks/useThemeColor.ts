import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useThemeColor = (color: string) => {
  useEffect(() => {
    // 1. Update Meta Tag (Web)
    const themeColorMetaTag = document.querySelector("meta[name='theme-color']");
    let metaTag = themeColorMetaTag;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', color);

    // 2. Update Native Status Bar (Android/iOS)
    const setNativeStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Determine if the color is light or dark
          const isLight = isLightColor(color);
          console.log(`[useThemeColor] Setting status bar to ${color} (isLight: ${isLight})`);

          // 1. Set overlay to false (Solid Status Bar)
          await StatusBar.setOverlaysWebView({ overlay: false });

          // 2. Set Background Color
          await StatusBar.setBackgroundColor({ color });

          // 3. Set Style:
          // Style.Light = Dark Icons (for light backgrounds)
          // Style.Dark = Light Icons (for dark backgrounds)
          await StatusBar.setStyle({ style: isLight ? Style.Light : Style.Dark });

          console.log('[useThemeColor] Status bar updated successfully');
        } catch (e) {
          console.error('Error setting status bar color:', e);
        }
      }
    };

    setNativeStatusBar();

    // No cleanup function to avoid race conditions when navigating between pages
  }, [color]);
};

// Helper to determine if a color is light or dark
const isLightColor = (color: string) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155; // Threshold for light/dark
};
