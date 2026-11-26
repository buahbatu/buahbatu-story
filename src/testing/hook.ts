import type { GameRuntime } from '../core/runtime';
import type { Engine } from '../engine/engine';
import type { GraphicsRuntime } from '../render/setup';
import type { AudioRuntime } from '../systems/audio/runtime';
import { worldCurve } from '../render/curve';
import { createInitialState } from '../core/state';
import { APPEARANCE } from '../entities';
import type { WorldScene } from '../scenes';
import { SCENE } from '../scenes/keys';
import { standHeight } from '../world/map/logic';
import { placeKey } from '../world/travel/logic';
import { phaseOf } from '../render/lighting/logic';
import { uiStore } from '../ui/uiState';
import type { TestApi } from './types';

interface TestHookContext {
  engine: Engine;
  runtime: GameRuntime;
  world: WorldScene;
  graphics: GraphicsRuntime;
  audio: AudioRuntime;
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

function createTestApi({ engine, runtime, world, graphics, audio }: TestHookContext): TestApi {
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
    renderStats: () => ({ ...engine.stats }),
    async setFx(on) {
      engine.fx = on;
      await engine.whenFxReady();
      await nextFrame();
      await nextFrame();
    },
    async setHour(hour) {
      world.setHour(hour);
      await nextFrame();
    },
    graphics: () => ({ ...graphics.settings, tier: graphics.tier, choice: graphics.settings.tier, bend: worldCurve.bend }),
    async setGraphics(change) {
      graphics.update({ ...graphics.settings, ...change });
      uiStore.set({ graphics: graphics.settings });
      await engine.whenFxReady();
      await nextFrame();
    },
    audio: () => ({ settings: structuredClone(audio.settings), ...audio.engine.stats() }),
    lighting: () => {
      const light = world.environment.light;
      return {
        hour: world.environment.hour,
        phase: phaseOf(world.environment.hour),
        fx: engine.fx,
        passes: engine.passes(),
        sunIntensity: light.sunIntensity,
        sun: light.sun,
        fog: light.fog,
        exposure: light.exposure,
        shadowRadius: world.environment.sun.shadow.radius,
        sky: world.world.scene.getObjectByName('sky')?.visible === true,
      };
    },
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
    camera: () => world.cameraState(),
    prompt: () => uiStore.get().prompt,
    dialog: () => world.dialog.snapshot(),
    travel: () => world.travelState(),
    travelCard(area) {
      uiStore.set({ fade: area !== null, place: area === null ? null : placeKey(area) });
    },
    ground: (x, y) => (world.area ? standHeight(world.area, x, y) : null),
    debug: () => ({ overlay: world.debugState(), info: uiStore.get().debug }),
    interactions: () => [...world.interactions()],
    setCamera(change) {
      world.setCamera(change);
    },
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
