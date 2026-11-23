import { describe, expect, it, vi } from 'vitest';
import { createLogger } from './logger';
import { EventBus } from './events';
import { GameRuntime } from './runtime';
import { createInitialState } from './state';

const options = { householdId: 'hh', seed: 1, createdAt: '2026-11-23T00:00:00.000Z' };
const quietBus = () => new EventBus(createLogger('t', { sink: () => undefined }));

describe('GameRuntime', () => {
  it('dispatch mengubah state & event sampai ke bus', () => {
    const runtime = GameRuntime.create(options, quietBus());
    const listener = vi.fn();
    runtime.bus.on('world/flagChanged', listener);
    expect(runtime.dispatch({ type: 'world/setFlag', by: 'A', key: 'met', value: true }).ok).toBe(true);
    expect(runtime.getState().world.flags.met).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
  });
  it('reset mengganti state tapi listener bus tetap terpasang', () => {
    const runtime = GameRuntime.create(options, quietBus());
    const listener = vi.fn();
    runtime.bus.on('world/flagChanged', listener);
    runtime.dispatch({ type: 'world/setFlag', by: 'A', key: 'a', value: 1 });
    runtime.reset(createInitialState({ ...options, seed: 99 }));
    expect(runtime.getState().world.flags).toEqual({});
    expect(runtime.getState().world.rngState).toBe(99);
    runtime.dispatch({ type: 'world/setFlag', by: 'B', key: 'b', value: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
