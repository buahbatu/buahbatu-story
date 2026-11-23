import type { Command, DispatchResult } from '../core/commands';
import type { GameEvent } from '../core/events';
import type { GameState } from '../core/state';
import type { Direction, PlayerMotion } from '../entities';
import type { Action, MoveVector } from '../input';
import type { SceneKey } from '../scenes/keys';

export interface AreaInfo {
  id: string;
  width: number;
  height: number;
  props: Record<string, number>;
}

export interface TestApi {
  ready(): Promise<void>;
  getState(): GameState;
  dispatch(command: Command): DispatchResult;
  setSeed(seed: number): void;
  emit(event: GameEvent): void;
  scene(): SceneKey | null;
  freeze(on: boolean): void;
  view(): { width: number; height: number; zoom: number; pixelScale: number };
  enterArea(id: string, spawn?: string): Promise<AreaInfo | null>;
  actions(): Action[];
  player(): (PlayerMotion & { area: string }) | null;
  placePlayer(x: number, y: number, facing: Direction): void;
  move(): MoveVector;
}

declare global {
  interface Window {
    __BB__?: TestApi;
  }
}
