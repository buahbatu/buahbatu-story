// Title (placeholder): latar bukit Lembang, judul, tagline, versi.
// Login & pilih household menyusul di P5-04 (Preact overlay). Desain: docs/02-arsitektur.md §6, docs/50 §9
import * as Phaser from 'phaser';

import { TILE_SIZE as TILE } from '../config/constants';
import { GAME_HEIGHT as H, GAME_WIDTH as W } from '../config/game';
import { PALETTE, css } from '../config/palette';
import { t } from '../content/i18n';
import { SCENE } from './keys';

const LAYOUT = {
  titleY: 84,
  titleSize: 28,
  taglineSize: 12,
  noteSize: 10,
  lineGap: 8,
  margin: 6,
} as const;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE.title);
  }

  create(): void {
    this.drawBackdrop();

    const shadow = css(PALETTE.night);
    const title = this.add
      .text(W / 2, LAYOUT.titleY, t('game.title'), {
        color: css(PALETTE.cream),
        fontSize: `${LAYOUT.titleSize}px`,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(2, 2, shadow, 0, false, true);

    this.add
      .text(W / 2, title.y + title.height / 2 + LAYOUT.lineGap, t('title.tagline'), {
        color: css(PALETTE.cream),
        fontSize: `${LAYOUT.taglineSize}px`,
      })
      .setOrigin(0.5, 0)
      .setShadow(1, 1, shadow, 0, false, true);

    this.add
      .text(W / 2, H - TILE * 3 - LAYOUT.lineGap * 3, t('title.comingSoon'), {
        color: css(PALETTE.cream),
        fontSize: `${LAYOUT.noteSize}px`,
      })
      .setOrigin(0.5, 1)
      .setShadow(1, 1, shadow, 0, false, true);

    this.add
      .text(W - LAYOUT.margin, H - LAYOUT.margin, t('title.version', { version: __APP_VERSION__ }), {
        color: css(PALETTE.cream),
        fontSize: `${LAYOUT.noteSize}px`,
      })
      .setOrigin(1, 1);
  }

  /** Langit, bukit, dan petak kebun. Diganti tilemap asli di P1. */
  private drawBackdrop(): void {
    const g = this.add.graphics();
    // Langit bertingkat (gradasi ala pixel art), makin terang mendekati cakrawala.
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
