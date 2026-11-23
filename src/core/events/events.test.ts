import { describe, expect, it, vi } from 'vitest';
import { createLogger } from '../logger';
import { EventBus, type GameEvent } from './index';

const silent = createLogger('test', { sink: () => undefined });
const toast: GameEvent = { type: 'ui/toast', key: 'title.version', params: { version: '1' } };
const flag: GameEvent = { type: 'world/flagChanged', by: 'A', key: 'met', value: true, previous: undefined };

describe('EventBus', () => {
  it('hanya memanggil listener untuk tipe yang cocok', () => {
    const bus = new EventBus(silent);
    const onToast = vi.fn();
    const onFlag = vi.fn();
    bus.on('ui/toast', onToast);
    bus.on('world/flagChanged', onFlag);
    bus.emit(toast);
    expect(onToast).toHaveBeenCalledWith(toast);
    expect(onFlag).not.toHaveBeenCalled();
  });
  it('payload ter-narrow sesuai tipe', () => {
    const bus = new EventBus(silent);
    let key = '';
    bus.on('world/flagChanged', (event) => {
      key = event.key;
    });
    bus.emit(flag);
    expect(key).toBe('met');
  });
  it('onAny menerima semua event sesuai urutan', () => {
    const bus = new EventBus(silent);
    const seen: string[] = [];
    bus.onAny((e) => seen.push(e.type));
    bus.emitAll([toast, flag]);
    expect(seen).toEqual(['ui/toast', 'world/flagChanged']);
  });
  it('unsubscribe menghentikan listener', () => {
    const bus = new EventBus(silent);
    const listener = vi.fn();
    const off = bus.on('ui/toast', listener);
    off();
    bus.emit(toast);
    expect(listener).not.toHaveBeenCalled();
  });
  it('listener yang error tidak menghentikan listener lain, dan error-nya dicatat', () => {
    const errors: unknown[] = [];
    const bus = new EventBus(createLogger('t', { sink: (level, _s, args) => level === 'error' && errors.push(args) }));
    const after = vi.fn();
    bus.on('ui/toast', () => {
      throw new Error('boom');
    });
    bus.on('ui/toast', after);
    bus.emit(toast);
    expect(after).toHaveBeenCalledOnce();
    expect(errors).toHaveLength(1);
  });
  it('listener boleh unsubscribe dirinya sendiri saat emit', () => {
    const bus = new EventBus(silent);
    const second = vi.fn();
    const off = bus.on('ui/toast', () => {
      off();
    });
    bus.on('ui/toast', second);
    bus.emit(toast);
    bus.emit(toast);
    expect(second).toHaveBeenCalledTimes(2);
  });
});
