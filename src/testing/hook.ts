// Implementasi test hook `window.__BB__`. Dimuat lewat dynamic import HANYA di mode test / dev ?test=1.
// Desain: docs/50-testing-deploy.md §2
import type * as Phaser from 'phaser';

import type { GameRuntime } from '../core/runtime';
import { createInitialState } from '../core/state';
import { SCENE } from '../scenes/keys';
import { uiStore } from '../ui/uiState';
import type { TestApi } from './types';

export interface TestHookContext {
  game: Phaser.Game;
  runtime: GameRuntime;
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

function waitForTitle(): Promise<void> {
  return new Promise((resolve) => {
    if (uiStore.get().scene === SCENE.title) {
      resolve();
      return;
    }
    const off = uiStore.subscribe((state) => {
      if (state.scene !== SCENE.title) return;
      off();
      resolve();
    });
  });
}

export function createTestApi({ game, runtime }: TestHookContext): TestApi {
  return {
    async ready() {
      await waitForTitle();
      // Dua frame: Phaser selesai menggambar Title & Preact selesai render overlay.
      await nextFrame();
      await nextFrame();
    },
    getState: () => structuredClone(runtime.getState()),
    dispatch: (command) => runtime.dispatch(command),
    setSeed(seed) {
      const { meta } = runtime.getState();
      runtime.reset(createInitialState({ householdId: meta.householdId, createdAt: meta.createdAt, seed }));
    },
    emit: (event) => {
      runtime.bus.emit(event);
    },
    scene: () => uiStore.get().scene,
    freeze(on) {
      if (on) game.loop.sleep();
      else game.loop.wake();
      document.documentElement.toggleAttribute('data-frozen', on);
    },
  };
}

export function installTestHook(context: TestHookContext): void {
  window.__BB__ = createTestApi(context);
}
