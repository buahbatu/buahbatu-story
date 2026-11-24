import { currentView, installViewScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { DEFAULT_BINDINGS } from './config/controls';
import { Engine } from './engine/engine';
import { InputState, attachKeyboard, attachPointer } from './input';
import { SCENE, createScenes } from './scenes';
import { mountUi } from './ui';
import { installTouchFullscreen } from './ui/fullscreen';

const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });
const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);
const gameRoot = document.getElementById('game');
if (!gameRoot) throw new Error('#game tidak ada');
const { scenes, world } = createScenes();
const input = new InputState(DEFAULT_BINDINGS);
attachKeyboard(input);
attachPointer(input, gameRoot);
world.notify = (key) => {
  runtime.bus.emit({ type: 'ui/toast', key });
};
const engine = new Engine(gameRoot, scenes, currentView(), input);
installViewScaling(engine);
installTouchFullscreen();
void engine.start(SCENE.boot);

if (import.meta.env.MODE === 'test' || (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ engine, runtime, world });
  });
}
