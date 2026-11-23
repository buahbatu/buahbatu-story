import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game';
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
      snapToPixel(this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t('boot.contentError'), { color: css(PALETTE.cream) }).setOrigin(0.5));
      return;
    }
    this.scene.start(SCENE.preload);
  }
}
