// Entry sementara (P0-01): membuktikan Vite + TypeScript + Phaser 4 berjalan.
// Konfigurasi final (resolusi, scaling, scene) menyusul di P0-05 dan P0-06.
import * as Phaser from 'phaser';

import { TILE_SIZE as TILE } from './config/constants';

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 360;

const PALETTE = {
  sky: 0x87b5d9,
  hillFar: 0x5f9f6b,
  hillNear: 0x3f7a4f,
  soil: 0x7a5236,
} as const;

class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('Placeholder');
  }

  create(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.sky).fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    g.fillStyle(PALETTE.hillFar).fillEllipse(VIEW_WIDTH * 0.3, VIEW_HEIGHT * 0.72, VIEW_WIDTH, VIEW_HEIGHT * 0.5);
    g.fillStyle(PALETTE.hillNear).fillRect(0, VIEW_HEIGHT - TILE * 3, VIEW_WIDTH, TILE * 3);
    // Satu baris petak tanah sebagai penanda grid 32px (ADR-004).
    g.fillStyle(PALETTE.soil);
    for (let x = TILE; x < VIEW_WIDTH - TILE; x += TILE * 2) {
      g.fillRect(x, VIEW_HEIGHT - TILE * 2, TILE, TILE);
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  pixelArt: true,
  backgroundColor: '#1d1a2f',
  scene: [PlaceholderScene],
});

// Dipakai verifikasi sementara sampai test hook resmi `window.__BB__` ada (P0-11).
if (import.meta.env.DEV) {
  Object.assign(window, { __PHASER_VERSION__: Phaser.VERSION, __GAME__: game });
}
