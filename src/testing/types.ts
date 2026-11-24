import type { Command, DispatchResult } from '../core/commands';
import type { GameEvent } from '../core/events';
import type { GameState } from '../core/state';
import type { Appearance, Direction, PlayerMotion } from '../entities';
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
  clock(): number;
  occluding(): string[];
  dialog(): { open: boolean; dialogId: string | null; line: number; done: number };
  prompt(): { key: string; text: string; x: number; y: number } | null;
  interactions(): { id: number; kind: string; action: string; area: string }[];
  setCamera(change: { yaw?: number; zoom?: number }): void;
  camera(): { yaw: number; zoom: number; focus: { x: number; y: number }; pan: { x: number; y: number } };
  water(): { inWater: boolean; wetness: number; particles: number; ripples: number; splashes: number };
  player(): (PlayerMotion & { area: string }) | null;
  placePlayer(x: number, y: number, facing: Direction): void;
  playerLook(look: 'A' | 'B' | Appearance): Promise<void>;
  move(): MoveVector;
}

declare global {
  interface Window {
    __BB__?: TestApi;
  }
}
