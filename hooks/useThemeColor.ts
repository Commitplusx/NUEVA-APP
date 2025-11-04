import { useEffect } from 'react';

export const useThemeColor = (color: string) => {
  useEffect(() => {
    const themeColorMetaTag = document.querySelector("meta[name='theme-color']");
    const originalThemeColor = themeColorMetaTag ? themeColorMetaTag.getAttribute('content') : null;

    let metaTag = themeColorMetaTag;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', color);

    return () => {
      if (originalThemeColor) {
        metaTag?.setAttribute('content', originalThemeColor);
      }
    };
  }, [color]);
};
