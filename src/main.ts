import { currentView, installViewScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { Engine } from './engine/engine';
import { SCENE, createScenes } from './scenes';
import { mountUi } from './ui';
import { installTouchFullscreen } from './ui/fullscreen';

const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });
const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);
const gameRoot = document.getElementById('game');
if (!gameRoot) throw new Error('#game tidak ada');
const engine = new Engine(gameRoot, createScenes(), currentView());
installViewScaling(engine);
installTouchFullscreen();
void engine.start(SCENE.boot);

if (import.meta.env.MODE === 'test' || (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ engine, runtime });
  });
}
