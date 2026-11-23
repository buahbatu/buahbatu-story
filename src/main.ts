import * as Phaser from 'phaser';
import { createGameConfig, installViewScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { SCENES } from './scenes';
import { mountUi } from './ui';
import { installTouchFullscreen } from './ui/fullscreen';

const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });

const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);

const game = new Phaser.Game(createGameConfig('game', SCENES));
installViewScaling(game);
installTouchFullscreen();

if (import.meta.env.MODE === 'test' || (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ game, runtime });
  });
}
