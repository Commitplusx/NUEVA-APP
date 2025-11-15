import { WebPlugin } from '@capacitor/core';

import type { NativeMap, PickLocationOptions, PickLocationResult } from './definitions';

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
}
