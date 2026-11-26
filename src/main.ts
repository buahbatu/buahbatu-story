import { currentView, installViewScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { DEFAULT_BINDINGS } from './config/controls';
import { Engine } from './engine/engine';
import { InputState, attachKeyboard, attachPointer } from './input';
import { SCENE, createScenes } from './scenes';
import { mountUi } from './ui';
import { installTouchFullscreen } from './ui/fullscreen';
import { connectTouch } from './ui/touch/bridge';
import { debugRequested } from './debug/logic';
import { GraphicsRuntime } from './render/setup';
import { connectGraphics } from './ui/graphicsBridge';
import { uiStore } from './ui/uiState';

const graphics = new GraphicsRuntime();
const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });
const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);
const gameRoot = document.getElementById('game');
if (!gameRoot) throw new Error('#game tidak ada');
const { scenes, world, title } = createScenes();
const input = new InputState(DEFAULT_BINDINGS);
attachKeyboard(input, window, () => uiStore.get().settingsOpen);
uiStore.subscribe((s) => {
  if (s.settingsOpen) input.releaseAll();
});
attachPointer(input, gameRoot);
connectTouch(input);
world.notify = (key) => {
  runtime.bus.emit({ type: 'ui/toast', key });
};
if (debugRequested(location.search, __DEBUG_ALLOWED__)) world.enableDebug();
const engine = new Engine(gameRoot, scenes, currentView(), input);
if (graphics.hour !== null) world.setHour(graphics.hour);
installViewScaling(engine);
graphics.attach(engine, [world.environment, title.environment]);
connectGraphics(graphics);
installTouchFullscreen();
void engine.start(SCENE.boot);

if (import.meta.env.MODE === 'test' || (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ engine, runtime, world, graphics });
  });
}
