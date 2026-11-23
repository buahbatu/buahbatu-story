// Hook Preact untuk membaca sebagian store dan re-render saat bagian itu berubah.
// `select` dianggap stabil per komponen (selector sederhana seperti `(s) => s.scene`).
import { useEffect, useState } from 'preact/hooks';

import type { Store } from './store';

export function useStore<T extends object, R>(store: Store<T>, select: (state: T) => R): R {
  const [value, setValue] = useState(() => select(store.get()));
  useEffect(() => {
    setValue(() => select(store.get()));
    return store.subscribe((state) => {
      setValue(() => select(state));
    });
  }, [store]);
  return value;
}
