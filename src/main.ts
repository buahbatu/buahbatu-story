// Entry: buat Phaser.Game (Boot → Preload → Title). Overlay Preact menyusul di P0-08.
// Desain: docs/02-arsitektur.md §2 & §6
import * as Phaser from 'phaser';

import { createGameConfig, installIntegerScaling } from './config/game';
import { SCENES } from './scenes';

const game = new Phaser.Game(createGameConfig('game', SCENES));
installIntegerScaling(game);

// Dipakai verifikasi sementara sampai test hook resmi `window.__BB__` ada (P0-11).
if (import.meta.env.DEV) {
  Object.assign(window, { __PHASER_VERSION__: Phaser.VERSION, __GAME__: game });
}
