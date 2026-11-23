// Entry: buat Phaser.Game (Boot → Preload → Title) + overlay Preact di atasnya.
// Desain: docs/02-arsitektur.md §2, §3 & §6, ADR-005
import * as Phaser from 'phaser';

import { createGameConfig, installIntegerScaling } from './config/game';
import { EventBus } from './core/events';
import { SCENES } from './scenes';
import { mountUi } from './ui';

const bus = new EventBus();

const uiRoot = document.getElementById('ui');
if (uiRoot) mountUi(uiRoot, bus);

const game = new Phaser.Game(createGameConfig('game', SCENES));
installIntegerScaling(game);

// Dipakai verifikasi sementara sampai test hook resmi `window.__BB__` ada (P0-11).
if (import.meta.env.DEV) {
  Object.assign(window, { __PHASER_VERSION__: Phaser.VERSION, __GAME__: game, __BUS__: bus });
}
