import { describe, expect, it } from 'vitest';
import { TOAST } from '../config/ui';
import { EventBus } from '../core/events';
import { createLogger } from '../core/logger';
import { connectToasts } from './index';
import { createStore } from './store';
import type { UiState } from './uiState';

function setup() {
  let now = 0;
  const timers: { at: number; run: () => void }[] = [];
  const clock = {
    now: () => now,
    setTimeout: (run: () => void, ms: number) => timers.push({ at: now + ms, run }),
  };
  const advance = (ms: number) => {
    now += ms;
    for (const timer of timers.filter((x) => x.at <= now)) timer.run();
  };
  const bus = new EventBus(createLogger('t', { sink: () => undefined }));
  const store = createStore<UiState>({
    scene: null,
    toasts: [],
    loading: null,
    fatal: null,
    prompt: null,
    dialog: null,
    dialogLog: [],
    dialogLogOpen: false,
  });
  connectToasts(bus, store, clock);
  return { bus, store, advance };
}

describe('connectToasts (EventBus → store UI)', () => {
  it('event ui/toast muncul sebagai toast lalu hilang sendiri', () => {
    const { bus, store, advance } = setup();
    bus.emit({ type: 'ui/toast', key: 'title.version', params: { version: '1' } });
    expect(store.get().toasts).toMatchObject([{ key: 'title.version', params: { version: '1' } }]);
    advance(TOAST.durationMs);
    expect(store.get().toasts).toEqual([]);
  });
  it(`maksimal ${TOAST.maxVisible} toast bertumpuk`, () => {
    const { bus, store } = setup();
    for (let i = 0; i < 5; i++) bus.emit({ type: 'ui/toast', key: 'error.internal' });
    expect(store.get().toasts).toHaveLength(TOAST.maxVisible);
    expect(store.get().toasts.map((t) => t.id)).toEqual([3, 4, 5]);
  });
});
