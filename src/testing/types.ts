import type { Command, DispatchResult } from '../core/commands';
import type { GameEvent } from '../core/events';
import type { GameState } from '../core/state';
import type { SceneKey } from '../scenes/keys';

export interface TestApi {
  ready(): Promise<void>;
  getState(): GameState;
  dispatch(command: Command): DispatchResult;
  setSeed(seed: number): void;
  emit(event: GameEvent): void;
  scene(): SceneKey | null;
  freeze(on: boolean): void;
}

declare global {
  interface Window {
    __BB__?: TestApi;
  }
}
