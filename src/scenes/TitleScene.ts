// Title (placeholder): latar bukit Lembang, judul, tagline. Versi tampil di overlay Preact.
// Login & pilih household menyusul di P5-04 (Preact overlay). Desain: docs/02-arsitektur.md §6, docs/40 §1
import * as Phaser from 'phaser';

import { TILE_SIZE as TILE } from '../config/constants';
import { GAME_HEIGHT as H, GAME_WIDTH as W } from '../config/game';
import { PALETTE, css } from '../config/palette';
import { FONT } from '../config/ui';
import { t } from '../content/i18n';
import { setActiveScene } from '../ui/uiState';
import { SCENE } from './keys';
import { snapToPixel } from './pixelText';

/** Ukuran font kelipatan desain font-nya (Press Start 2P = 8px) supaya tepi huruf tajam. */
const LAYOUT = {
  titleY: 80,
  titleSize: 24,
  taglineSize: 16,
  noteSize: 12,
  lineGap: 10,
} as const;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE.title);
  }

  create(): void {
    setActiveScene(SCENE.title);
    this.drawBackdrop();

    const shadow = css(PALETTE.night);
    const title = snapToPixel(
      this.add
        .text(W / 2, LAYOUT.titleY, t('game.title'), {
          fontFamily: `"${FONT.title}"`,
          fontSize: `${LAYOUT.titleSize}px`,
          color: css(PALETTE.cream),
        })
        .setOrigin(0.5)
        .setShadow(2, 2, shadow, 0, false, true),
    );

    snapToPixel(
      this.add
        .text(W / 2, title.y + title.height + LAYOUT.lineGap, t('title.tagline'), {
          fontFamily: `"${FONT.body}"`,
          fontSize: `${LAYOUT.taglineSize}px`,
          color: css(PALETTE.cream),
        })
        .setOrigin(0.5, 0)
        .setShadow(1, 1, shadow, 0, false, true),
    );

    snapToPixel(
      this.add
        .text(W / 2, H - TILE * 3 - LAYOUT.lineGap * 2, t('title.comingSoon'), {
          fontFamily: `"${FONT.body}"`,
          fontSize: `${LAYOUT.noteSize}px`,
          color: css(PALETTE.cream),
        })
        .setOrigin(0.5, 1)
        .setShadow(1, 1, shadow, 0, false, true),
    );
  }

  /** Langit bertingkat, bukit, dan petak kebun. Diganti tilemap asli di P1. */
  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.sky).fillRect(0, 0, W, H);
    g.fillStyle(PALETTE.skyLight).fillRect(0, H - TILE * 7, W, TILE * 2);
    g.fillStyle(PALETTE.horizon).fillRect(0, H - TILE * 5, W, TILE * 2);
    g.fillStyle(PALETTE.hillFar).fillEllipse(W * 0.25, H * 0.75, W * 0.9, H * 0.55);
    g.fillStyle(PALETTE.hillFar).fillEllipse(W * 0.85, H * 0.8, W * 0.7, H * 0.45);
    g.fillStyle(PALETTE.hillNear).fillRect(0, H - TILE * 3, W, TILE * 3);
    for (let x = TILE; x < W - TILE; x += TILE * 2) {
      g.fillStyle(PALETTE.soil).fillRect(x, H - TILE * 2, TILE, TILE);
      g.fillStyle(PALETTE.strawberry).fillRect(x + TILE / 2 - 2, H - TILE * 2 + TILE / 2 - 2, 4, 4);
    }
  }
}
