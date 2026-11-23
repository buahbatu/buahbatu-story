// Entry: runtime game (state + Command) → overlay Preact → Phaser.Game (Boot → Preload → Title).
// Desain: docs/02-arsitektur.md §2, §3 & §6, ADR-005
import * as Phaser from 'phaser';

import { createGameConfig, installIntegerScaling } from './config/game';
import { hashSeed } from './core/rng';
import { GameRuntime } from './core/runtime';
import { SCENES } from './scenes';
import { mountUi } from './ui';

// Belum ada save & login: dunia lokal baru tiap boot (save lokal P2-08, household cloud P5).
const createdAt = new Date().toISOString();
const runtime = GameRuntime.create({ householdId: 'local', seed: hashSeed(createdAt), createdAt });

const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, runtime.bus);

const game = new Phaser.Game(createGameConfig('game', SCENES));
installIntegerScaling(game);

// Test hook (docs/50 §2). Kondisi ditulis langsung dengan import.meta.env supaya di build production
// bernilai `false` saat build dan seluruh kode hook dibuang dari bundle.
if (
  import.meta.env.MODE === 'test' ||
  (import.meta.env.DEV && new URLSearchParams(location.search).has('test'))
) {
  void import('./testing/hook').then(({ installTestHook }) => {
    installTestHook({ game, runtime });
  });
}
