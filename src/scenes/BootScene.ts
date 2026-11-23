import * as Phaser from 'phaser';

import { PALETTE, css } from '../config/palette';
import { assertContentValid } from '../content';
import { t } from '../content/i18n';
import { setActiveScene } from '../ui/uiState';
import { logger } from '../core/logger';
import { SCENE } from './keys';
import { snapToPixel } from './pixelText';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.boot);
  }
  create(): void {
    setActiveScene(SCENE.boot);
    try {
      assertContentValid();
    } catch (error) {
      logger.error(error);
      snapToPixel(
        this.add.text(this.scale.width / 2, this.scale.height / 2, t('boot.contentError'), { color: css(PALETTE.cream) }).setOrigin(0.5),
      );
      return;
    }
    this.scene.start(SCENE.preload);
  }
}
