import { describe, expect, it } from 'vitest';

import { ECONOMY, TIME } from '../../config/balance';
import {
  SCHEMA_VERSION,
  createInitialState,
  selectFlag,
  selectPartnerId,
  selectPlayer,
  type GameState,
} from './index';

const options = { householdId: 'hh_test', seed: 42, createdAt: '2026-11-23T00:00:00.000Z' };

describe('createInitialState', () => {
  it('mulai hari 1 Semi tahun 1 jam 06:00, tahap Orang Asing, dompet bersama null', () => {
    const state = createInitialState(options);
    expect(state.world.clock).toEqual({ day: 1, season: 'spring', year: 1, minute: TIME.dayStartMinute });
    expect(state.world.clock.minute).toBe(360);
    expect(state.household.stage).toBe('stranger');
    expect(state.household.sharedWallet).toBeNull();
    expect(state.meta.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('dua pemain A & B dengan dompet awal dari balance.ts', () => {
    const state = createInitialState({ ...options, names: { A: 'Asep', B: 'Neng' } });
    expect(selectPlayer(state, 'A')).toEqual({ id: 'A', name: 'Asep', wallet: ECONOMY.startWallet });
    expect(selectPlayer(state, 'B').name).toBe('Neng');
  });

  it('murni: input sama → hasil sama, objek baru tiap panggilan', () => {
    const a = createInitialState(options);
    const b = createInitialState(options);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.world.flags).not.toBe(b.world.flags);
  });

  it('seed disimpan sebagai uint32', () => {
    expect(createInitialState({ ...options, seed: -1 }).world.rngState).toBe(4294967295);
  });

  it('serializable: JSON bolak-balik tanpa kehilangan data (syarat save & jaringan)', () => {
    const state = createInitialState(options);
    const roundTrip = JSON.parse(JSON.stringify(state)) as GameState;
    expect(roundTrip).toEqual(state);
  });
});

describe('selectors', () => {
  it('selectPartnerId', () => {
    expect(selectPartnerId('A')).toBe('B');
    expect(selectPartnerId('B')).toBe('A');
  });

  it('selectFlag undefined kalau belum pernah di-set', () => {
    expect(selectFlag(createInitialState(options), 'met')).toBeUndefined();
  });
});
