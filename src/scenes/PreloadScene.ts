import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/game';
import { PALETTE, css } from '../config/palette';
import { FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS } from '../config/ui';
import { t } from '../content/i18n';
import { setActiveScene } from '../ui/uiState';
import { waitForFonts } from '../utils/fonts';
import { loadingBarFill } from '../utils/progress';
import { SCENE } from './keys';
import { centerOnPixel } from './pixelText';

const BAR = { width: 240, height: 12, border: 2, gap: 6, fontSize: 10 } as const;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE.preload);
  }
  preload(): void {
    setActiveScene(SCENE.preload);
    const x = Math.floor((GAME_WIDTH - BAR.width) / 2);
    const y = Math.floor((GAME_HEIGHT - BAR.height) / 2);
    const inner = BAR.width - BAR.border * 2;
    this.add.rectangle(x, y, BAR.width, BAR.height).setOrigin(0).setStrokeStyle(BAR.border, PALETTE.cream);
    const fill = this.add.rectangle(x + BAR.border, y + BAR.border, 0, BAR.height - BAR.border * 2, PALETTE.strawberry).setOrigin(0);
    const label = centerOnPixel(
      this.add.text(0, y + BAR.height + BAR.gap, t('boot.loading', { percent: 0 }), {
        color: css(PALETTE.cream),
        fontSize: `${BAR.fontSize}px`,
      }),
      GAME_WIDTH / 2,
    );
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      const { fillWidth, percent } = loadingBarFill(progress, inner);
      fill.width = fillWidth;
      centerOnPixel(label.setText(t('boot.loading', { percent })), GAME_WIDTH / 2);
    });
  }
  create(): void {
    void waitForFonts(document.fonts, FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS).then(() => {
      this.scene.start(SCENE.title);
    });
  }
}
