import { WebPlugin } from '@capacitor/core';

import type { NativeMap, PickLocationOptions, PickLocationResult, MapPoint } from './definitions';

export class NativeMapWeb extends WebPlugin implements NativeMap {
  async pickLocation(options?: PickLocationOptions): Promise<PickLocationResult> {
    console.log('pickLocation (web)', options);
    // Fallback for web: return a default location or throw an error
    return {
      latitude: options?.initialPosition?.latitude || 34.0522,
      longitude: options?.initialPosition?.longitude || -118.2437,
      address: 'Default Web Address, Los Angeles, CA',
    };
  }

  async calculateRoute(options: { origin: MapPoint; destination: MapPoint; }): Promise<{ distance: number; polyline: string; }> {
    console.warn('calculateRoute is not available on web.', options);
    return Promise.resolve({ distance: 0, polyline: '' });
  }

  async showRouteOnMap(options: { origin: MapPoint; destination: MapPoint; polyline: string; }): Promise<void> {
    console.warn('showRouteOnMap is not available on web.', options);
    return Promise.resolve();
  }
}
