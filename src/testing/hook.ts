import type { GameRuntime } from '../core/runtime';
import type { Engine } from '../engine/engine';
import { createInitialState } from '../core/state';
import { APPEARANCE } from '../entities';
import type { WorldScene } from '../scenes';
import { SCENE } from '../scenes/keys';
import { uiStore } from '../ui/uiState';
import type { TestApi } from './types';

interface TestHookContext {
  engine: Engine;
  runtime: GameRuntime;
  world: WorldScene;
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

function createTestApi({ engine, runtime, world }: TestHookContext): TestApi {
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
    async enterArea(id, spawn) {
      world.goto(id, spawn);
      await engine.start(SCENE.world);
      await nextFrame();
      const area = world.area;
      if (area?.id !== id) return null;
      const props: Record<string, number> = {};
      world.world.scene.traverse((node) => {
        if (node.name.startsWith('prop:')) props[node.name.slice(5)] = (props[node.name.slice(5)] ?? 0) + 1;
      });
      return { id, width: area.width, height: area.height, props };
    },
    async playerLook(look) {
      await world.setLook(typeof look === 'string' ? APPEARANCE[look] : look);
    },
    placePlayer(x, y, facing) {
      world.place(x, y, facing);
    },
    actions: () => engine.input.down(),
    clock: () => engine.elapsed,
    occluding: () => world.occlusion.occluding(),
    water: () => world.waterState(),
    player: () => (world.player && world.area ? { ...world.player, area: world.area.id } : null),
    move: () => engine.input.move(),
    freeze(on) {
      if (on) {
        world.resetPose();
        engine.freezeAt(0);
      } else engine.wake();
      document.documentElement.toggleAttribute('data-frozen', on);
    },
  };
}

export function installTestHook(context: TestHookContext): void {
  window.__BB__ = createTestApi(context);
}
