import { registerPlugin } from '@capacitor/core';

import type { NativeMap } from './definitions';

const NativeMapPlugin = registerPlugin<NativeMap>('NativeMap', {
  web: () => import('./web').then((m) => new m.NativeMapWeb()),
});

export * from './definitions';
export { NativeMapPlugin as NativeMap };
