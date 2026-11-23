// Boot: cek konten, lalu lanjut ke Preload. Desain: docs/02-arsitektur.md §6
import * as Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../config/game';
import { PALETTE, css } from '../config/palette';
import { assertContentValid } from '../content';
import { t } from '../content/i18n';
import { SCENE } from './keys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.boot);
  }

  create(): void {
    try {
      assertContentValid();
    } catch (error) {
      // Konten rusak = bug build; tampilkan pesan ramah, detailnya di console untuk developer.
      console.error(error);
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t('boot.contentError'), { color: css(PALETTE.cream) })
        .setOrigin(0.5);
      return;
    }
    this.scene.start(SCENE.preload);
  }
}
