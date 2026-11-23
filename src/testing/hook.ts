import type { GameRuntime } from '../core/runtime';
import type { Engine } from '../engine/engine';
import { createInitialState } from '../core/state';
import { SCENE } from '../scenes/keys';
import { uiStore } from '../ui/uiState';
import type { TestApi } from './types';

interface TestHookContext {
  engine: Engine;
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

function createTestApi({ engine, runtime }: TestHookContext): TestApi {
  return {
    async ready() {
      await waitForTitle();
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
    view: () => ({ ...engine.view }),
    freeze(on) {
      if (on) engine.freezeAt(0);
      else engine.wake();
      document.documentElement.toggleAttribute('data-frozen', on);
    },
  };
}

export function installTestHook(context: TestHookContext): void {
  window.__BB__ = createTestApi(context);
}
