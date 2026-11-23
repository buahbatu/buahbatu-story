import { describe, expect, it, vi } from 'vitest';
import { createStore } from './store';
import { expireToasts, pushToast, type Toast } from './toasts';

const toast = (id: number, expiresAt = 1000): Toast => ({ id, key: 'title.version', expiresAt });

describe('pushToast', () => {
  it('menambah di akhir', () => {
    expect(pushToast([toast(1)], toast(2), 3).map((t) => t.id)).toEqual([1, 2]);
  });
  it('maks. 3 bertumpuk: yang paling lama dibuang', () => {
    const list = [toast(1), toast(2), toast(3)];
    expect(pushToast(list, toast(4), 3).map((t) => t.id)).toEqual([2, 3, 4]);
  });
  it('max < 1 tetap menampilkan toast terbaru', () => {
    expect(pushToast([toast(1)], toast(2), 0).map((t) => t.id)).toEqual([2]);
  });
  it('tidak memutasi array asal', () => {
    const list = [toast(1)];
    pushToast(list, toast(2), 3);
    expect(list).toHaveLength(1);
  });
});

describe('expireToasts', () => {
  it('membuang yang sudah lewat waktunya (batas eksklusif)', () => {
    const list = [toast(1, 100), toast(2, 200), toast(3, 300)];
    expect(expireToasts(list, 200).map((t) => t.id)).toEqual([3]);
  });
});

describe('createStore', () => {
  it('set menggabungkan patch dan memberi tahu subscriber', () => {
    const store = createStore({ scene: null as string | null, count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ scene: 'Title' });
    expect(store.get()).toEqual({ scene: 'Title', count: 0 });
    expect(listener).toHaveBeenCalledWith({ scene: 'Title', count: 0 });
  });
  it('set dengan fungsi memakai state terbaru', () => {
    const store = createStore({ count: 1 });
    store.set((s) => ({ count: s.count + 1 }));
    expect(store.get().count).toBe(2);
  });
  it('tidak memberi tahu kalau tidak ada yang berubah (hemat render)', () => {
    const store = createStore({ scene: 'Title' });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ scene: 'Title' });
    expect(listener).not.toHaveBeenCalled();
  });
  it('unsubscribe', () => {
    const store = createStore({ n: 0 });
    const listener = vi.fn();
    const off = store.subscribe(listener);
    off();
    store.set({ n: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});
