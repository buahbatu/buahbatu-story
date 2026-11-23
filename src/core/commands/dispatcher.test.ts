import { applyPatches } from 'immer';
import { describe, expect, it, vi } from 'vitest';

import { EventBus, type GameEvent } from '../events';
import { createLogger, type LogLevel } from '../logger';
import { createRng } from '../rng';
import { createInitialState } from '../state';
import { CommandDispatcher, HANDLERS, reject, succeed, type Command, type HandlerMap } from './index';

const silent = createLogger('test', { sink: () => undefined });

function setup(handlers: HandlerMap = HANDLERS, seed = 42) {
  const logs: LogLevel[] = [];
  const log = createLogger('test', { sink: (level) => logs.push(level) });
  const bus = new EventBus(silent);
  const events: GameEvent[] = [];
  bus.onAny((e) => events.push(e));
  const initial = createInitialState({ householdId: 'hh', seed, createdAt: '2026-11-23T00:00:00.000Z' });
  const dispatcher = new CommandDispatcher(initial, bus, handlers, log);
  return { dispatcher, events, logs, initial };
}

const setFlag = (key: string, value: boolean | number | string = true): Command => ({
  type: 'world/setFlag',
  by: 'A',
  key,
  value,
});

describe('CommandDispatcher — jalur sukses', () => {
  it('mengubah state, mengirim event ke bus, dan memberi patch', () => {
    const { dispatcher, events } = setup();
    const result = dispatcher.dispatch(setFlag('ch1.met'));
    expect(result.ok).toBe(true);
    expect(dispatcher.getState().world.flags['ch1.met']).toBe(true);
    expect(events).toEqual([
      { type: 'world/flagChanged', by: 'A', key: 'ch1.met', value: true, previous: undefined },
    ]);
    expect(result.patches).toEqual([{ op: 'add', path: ['world', 'flags', 'ch1.met'], value: true }]);
  });

  it('immutable: state lama tidak berubah, state baru beku', () => {
    const { dispatcher } = setup();
    const before = dispatcher.getState();
    dispatcher.dispatch(setFlag('a'));
    expect(before.world.flags).toEqual({});
    expect(dispatcher.getState()).not.toBe(before);
    expect(() => {
      (dispatcher.getState().world.flags as Record<string, unknown>).hack = 1;
    }).toThrow();
  });

  it('inversePatches mengembalikan state sebelumnya (dasar rollback prediksi P6-05)', () => {
    const { dispatcher } = setup();
    const before = dispatcher.getState();
    const { inversePatches } = dispatcher.dispatch(setFlag('a', 3));
    expect(applyPatches(dispatcher.getState(), inversePatches)).toEqual(before);
  });

  it('nilai sama → sukses tanpa event dan tanpa patch', () => {
    const { dispatcher, events } = setup();
    dispatcher.dispatch(setFlag('a'));
    events.length = 0;
    const again = dispatcher.dispatch(setFlag('a'));
    expect(again).toMatchObject({ ok: true, events: [], patches: [] });
    expect(events).toEqual([]);
  });

  it('subscriber diberi tahu dengan command & patch', () => {
    const { dispatcher } = setup();
    const listener = vi.fn();
    dispatcher.subscribe(listener);
    const cmd = setFlag('b');
    dispatcher.dispatch(cmd);
    expect(listener).toHaveBeenCalledWith(dispatcher.getState(), {
      command: cmd,
      patches: [{ op: 'add', path: ['world', 'flags', 'b'], value: true }],
    });
  });
});

describe('CommandDispatcher — atomik saat gagal', () => {
  it.each([
    ['key kosong', ''],
    ['key diawali angka', '1abc'],
    ['key terlalu panjang', `a${'x'.repeat(64)}`],
  ])('menolak %s tanpa mengubah state', (_, key) => {
    const { dispatcher, events, initial } = setup();
    const result = dispatcher.dispatch(setFlag(key));
    expect(result).toEqual({
      ok: false,
      reason: 'error.invalidCommand',
      events: [],
      patches: [],
      inversePatches: [],
    });
    expect(dispatcher.getState()).toEqual(initial);
    expect(events).toEqual([]);
  });

  it('menolak nilai bukan angka hingga (data jaringan rusak)', () => {
    const { dispatcher } = setup();
    expect(dispatcher.dispatch(setFlag('a', Number.NaN)).ok).toBe(false);
  });

  it('handler yang sempat memutasi lalu reject → mutasinya dibatalkan', () => {
    const handlers: HandlerMap = {
      'world/setFlag': (draft) => {
        draft.world.flags.partial = true;
        draft.players.A.wallet = 999;
        return reject('error.invalidCommand');
      },
    };
    const { dispatcher, initial } = setup(handlers);
    const before = dispatcher.getState();
    dispatcher.dispatch(setFlag('a'));
    expect(dispatcher.getState()).toBe(before);
    expect(dispatcher.getState()).toEqual(initial);
  });

  it('handler crash → error.internal, state utuh, error dicatat', () => {
    const handlers: HandlerMap = {
      'world/setFlag': (draft) => {
        draft.players.A.wallet = 1;
        throw new Error('bug');
      },
    };
    const { dispatcher, initial, logs } = setup(handlers);
    expect(dispatcher.dispatch(setFlag('a'))).toMatchObject({ ok: false, reason: 'error.internal' });
    expect(dispatcher.getState()).toEqual(initial);
    expect(logs).toContain('error');
  });

  it('Command tidak dikenal (mis. dari klien versi lain) → error.unknownCommand', () => {
    const { dispatcher } = setup();
    const unknown = { type: 'farm/teleport', by: 'B' } as unknown as Command;
    expect(dispatcher.dispatch(unknown)).toMatchObject({ ok: false, reason: 'error.unknownCommand' });
  });
});

describe('CommandDispatcher — RNG deterministik lewat Command', () => {
  const rollHandlers = (fail: boolean): HandlerMap => ({
    'world/setFlag': (draft, cmd) => {
      const roll = createRng(draft.world).int(1, 100);
      if (fail) return reject('error.invalidCommand');
      draft.world.flags[cmd.key] = roll;
      return succeed();
    },
  });

  it('host & klien dengan seed sama mendapat hasil acak yang sama', () => {
    const run = () => {
      const { dispatcher } = setup(rollHandlers(false), 7);
      for (const key of ['r1', 'r2', 'r3']) dispatcher.dispatch(setFlag(key));
      return dispatcher.getState().world.flags;
    };
    expect(run()).toEqual(run());
  });

  it('Command gagal tidak memajukan RNG', () => {
    const { dispatcher, initial } = setup(rollHandlers(true));
    dispatcher.dispatch(setFlag('x'));
    expect(dispatcher.getState().world.rngState).toBe(initial.world.rngState);
  });

  it('Command sukses memajukan RNG', () => {
    const { dispatcher, initial } = setup(rollHandlers(false));
    dispatcher.dispatch(setFlag('x'));
    expect(dispatcher.getState().world.rngState).not.toBe(initial.world.rngState);
  });
});
