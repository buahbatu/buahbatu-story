import { ECONOMY, RELATIONSHIP, TIME } from '../../config/balance';
import { normalizeSeed } from '../rng';

export const SCHEMA_VERSION = 1;

export type PlayerId = 'A' | 'B';
export const PLAYER_IDS: readonly PlayerId[] = ['A', 'B'];

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type RelationshipStage = 'stranger' | 'acquaintance' | 'friend' | 'courting' | 'dating' | 'engaged' | 'married';

export type FlagValue = boolean | number | string;

export interface Clock {
  day: number;
  season: Season;
  year: number;
  minute: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  wallet: number;
}

export interface GameState {
  meta: { schemaVersion: number; householdId: string; createdAt: string };
  world: {
    clock: Clock;
    rngState: number;
    flags: Record<string, FlagValue>;
  };
  household: {
    stage: RelationshipStage;
    bond: { friendship: number; romance: number };
    sharedWallet: number | null;
  };
  players: Record<PlayerId, PlayerState>;
}

export interface InitialStateOptions {
  householdId: string;
  seed: number;
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

export const selectPlayer = (state: GameState, id: PlayerId): PlayerState => state.players[id];
export const selectPartnerId = (id: PlayerId): PlayerId => (id === 'A' ? 'B' : 'A');
export const selectFlag = (state: GameState, key: string): FlagValue | undefined => state.world.flags[key];
export const selectClock = (state: GameState): Clock => state.world.clock;
