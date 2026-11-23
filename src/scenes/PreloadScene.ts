// Preload: loading bar + muat aset umum. Desain: docs/02-arsitektur.md §6
import * as Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../config/game';
import { PALETTE, css } from '../config/palette';
import { t } from '../content/i18n';
import { loadingBarFill } from '../utils/progress';
import { SCENE } from './keys';

const BAR = { width: 240, height: 12, border: 2, gap: 6, fontSize: 10 } as const;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE.preload);
  }

  preload(): void {
    const x = Math.floor((GAME_WIDTH - BAR.width) / 2);
    const y = Math.floor((GAME_HEIGHT - BAR.height) / 2);
    const inner = BAR.width - BAR.border * 2;

    this.add.rectangle(x, y, BAR.width, BAR.height).setOrigin(0).setStrokeStyle(BAR.border, PALETTE.cream);
    const fill = this.add
      .rectangle(x + BAR.border, y + BAR.border, 0, BAR.height - BAR.border * 2, PALETTE.strawberry)
      .setOrigin(0);
    const label = this.add
      .text(GAME_WIDTH / 2, y + BAR.height + BAR.gap, t('boot.loading', { percent: 0 }), {
        color: css(PALETTE.cream),
        fontSize: `${BAR.fontSize}px`,
      })
      .setOrigin(0.5, 0);

    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      const { fillWidth, percent } = loadingBarFill(progress, inner);
      fill.width = fillWidth;
      label.setText(t('boot.loading', { percent }));
    });

    // Aset umum (atlas, tileset, font bitmap) didaftarkan di sini mulai P1-01.
  }

  create(): void {
    this.scene.start(SCENE.title);
  }
}
