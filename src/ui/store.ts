// Store kecil tanpa dependency: jembatan Phaser ↔ Preact selain EventBus (ADR-005).
// Desain: docs/02-arsitektur.md §6

export type Updater<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Store<T extends object> {
  get(): T;
  set(update: Updater<T>): void;
  subscribe(listener: (state: T) => void): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<(state: T) => void>();
  return {
    get: () => state,
    set(update) {
      const patch = typeof update === 'function' ? update(state) : update;
      const changed = Object.entries(patch).some(([key, value]) => state[key as keyof T] !== value);
      if (!changed) return;
      state = { ...state, ...patch };
      for (const listener of [...listeners]) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
