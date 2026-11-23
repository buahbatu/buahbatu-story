// Entry: buat Phaser.Game. Scene Boot/Preload/Title menyusul di P0-06, overlay Preact di P0-08.
// Desain: docs/02-arsitektur.md §2 & §6
import * as Phaser from 'phaser';

import { TILE_SIZE as TILE } from './config/constants';
import { GAME_HEIGHT as H, GAME_WIDTH as W, createGameConfig, installIntegerScaling } from './config/game';

const PALETTE = {
  sky: 0x87b5d9,
  hillFar: 0x5f9f6b,
  hillNear: 0x3f7a4f,
  soil: 0x7a5236,
  light: 0xf4e9d1,
} as const;

/** Placeholder sementara (diganti P0-06). Pola papan catur 1px untuk menguji ketajaman scaling. */
class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('Placeholder');
  }

  create(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.sky).fillRect(0, 0, W, H);
    g.fillStyle(PALETTE.hillFar).fillEllipse(W * 0.3, H * 0.72, W, H * 0.5);
    g.fillStyle(PALETTE.hillNear).fillRect(0, H - TILE * 3, W, TILE * 3);
    g.fillStyle(PALETTE.soil);
    for (let x = TILE; x < W - TILE; x += TILE * 2) {
      g.fillRect(x, H - TILE * 2, TILE, TILE);
    }
    g.fillStyle(PALETTE.light);
    for (let y = 0; y < TILE / 2; y++) {
      for (let x = y % 2; x < TILE / 2; x += 2) g.fillRect(TILE / 2 + x, TILE / 2 + y, 1, 1);
    }
  }
}

const game = new Phaser.Game(createGameConfig('game', [PlaceholderScene]));
installIntegerScaling(game);

// Dipakai verifikasi sementara sampai test hook resmi `window.__BB__` ada (P0-11).
if (import.meta.env.DEV) {
  Object.assign(window, { __PHASER_VERSION__: Phaser.VERSION, __GAME__: game });
}
