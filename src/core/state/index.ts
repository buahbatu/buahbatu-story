// GameState: satu objek serializable = satu sumber kebenaran.
// Desain: docs/02-arsitektur.md §1.5 & §5
//
// Hanya bagian yang desainnya sudah ada yang didefinisikan; tiap sistem menambah field-nya
// sendiri saat dikerjakan (areas, animals, npcs, quests, ...). Naikkan SCHEMA_VERSION + migrasi
// save (P2-07) setiap kali bentuk state berubah setelah rilis.
import { ECONOMY, RELATIONSHIP, TIME } from '../../config/balance';
import { normalizeSeed } from '../rng';

export const SCHEMA_VERSION = 1;

export type PlayerId = 'A' | 'B';
export const PLAYER_IDS: readonly PlayerId[] = ['A', 'B'];

/** Empat musim fantasi (ADR-007). */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** Tahap hubungan 0–6 (docs/16 §3): Orang Asing → Kenalan → Teman → PDKT → Pacaran → Tunangan → Menikah. */
export type RelationshipStage =
  'stranger' | 'acquaintance' | 'friend' | 'courting' | 'dating' | 'engaged' | 'married';

export type FlagValue = boolean | number | string;

export interface Clock {
  day: number;
  season: Season;
  year: number;
  /** Menit sejak tengah malam (06:00 = 360). */
  minute: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  /** Dompet pribadi (Rp, integer). */
  wallet: number;
}

export interface GameState {
  meta: { schemaVersion: number; householdId: string; createdAt: string };
  world: {
    clock: Clock;
    /** State RNG seeded (uint32). Hanya diubah lewat createRng(draft.world). */
    rngState: number;
    flags: Record<string, FlagValue>;
  };
  household: {
    stage: RelationshipStage;
    bond: { friendship: number; romance: number };
    /** null sebelum menikah (docs/13 §1). */
    sharedWallet: number | null;
  };
  players: Record<PlayerId, PlayerState>;
}

export interface InitialStateOptions {
  householdId: string;
  seed: number;
  /** ISO timestamp, dimasukkan dari luar supaya fungsi ini tetap murni. */
  createdAt: string;
  names?: Partial<Record<PlayerId, string>>;
}

function createPlayer(id: PlayerId, name: string): PlayerState {
  return { id, name, wallet: ECONOMY.startWallet };
}

export function createInitialState(options: InitialStateOptions): GameState {
  return {
    meta: { schemaVersion: SCHEMA_VERSION, householdId: options.householdId, createdAt: options.createdAt },
    world: {
      clock: { day: 1, season: 'spring', year: 1, minute: TIME.dayStartMinute },
      rngState: normalizeSeed(options.seed),
      flags: {},
    },
    household: {
      stage: 'stranger',
      bond: { friendship: RELATIONSHIP.startFriendship, romance: RELATIONSHIP.startRomance },
      sharedWallet: null,
    },
    players: {
      A: createPlayer('A', options.names?.A ?? ''),
      B: createPlayer('B', options.names?.B ?? ''),
    },
  };
}

// ---------- Selectors (baca saja) ----------
export const selectPlayer = (state: GameState, id: PlayerId): PlayerState => state.players[id];
export const selectPartnerId = (id: PlayerId): PlayerId => (id === 'A' ? 'B' : 'A');
export const selectFlag = (state: GameState, key: string): FlagValue | undefined => state.world.flags[key];
export const selectClock = (state: GameState): Clock => state.world.clock;
