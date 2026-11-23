import * as Phaser from 'phaser';
import { createGameConfig, installIntegerScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { SCENES } from './scenes';
import { mountUi } from './ui';

const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });

const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);

const game = new Phaser.Game(createGameConfig('game', SCENES));
installIntegerScaling(game);

if (import.meta.env.MODE === 'test' || (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ game, runtime });
  });
}
