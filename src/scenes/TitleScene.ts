import * as Phaser from 'phaser';
import { TILE_SIZE as TILE } from '../config/constants';
import { PALETTE, css } from '../config/palette';
import { FONT } from '../config/ui';
import { t } from '../content/i18n';
import { setActiveScene } from '../ui/uiState';
import { SCENE } from './keys';
import { snapToPixel } from './pixelText';

const LAYOUT = { titleY: 80, titleSize: 24, taglineSize: 16, noteSize: 12, lineGap: 10 } as const;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE.title);
  }
  create(): void {
    setActiveScene(SCENE.title);
    this.layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.relayout);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.relayout));
  }
  private readonly relayout = (): void => {
    this.children.removeAll(true);
    this.layout();
  };
  private layout(): void {
    const { width: W, height: H } = this.scale;
    this.drawBackdrop(W, H);
    const shadow = css(PALETTE.night);
    const text = (y: number, key: Parameters<typeof t>[0], font: string, size: number, originY: number, offset: number) =>
      snapToPixel(
        this.add
          .text(W / 2, y, t(key), { fontFamily: `"${font}"`, fontSize: `${size}px`, color: css(PALETTE.cream) })
          .setOrigin(0.5, originY)
          .setShadow(offset, offset, shadow, 0, false, true),
      );
    const title = text(LAYOUT.titleY, 'game.title', FONT.title, LAYOUT.titleSize, 0.5, 2);
    text(title.y + title.height + LAYOUT.lineGap, 'title.tagline', FONT.body, LAYOUT.taglineSize, 0, 1);
    text(H - TILE * 3 - LAYOUT.lineGap * 2, 'title.comingSoon', FONT.body, LAYOUT.noteSize, 1, 1);
  }
  private drawBackdrop(W: number, H: number): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.sky).fillRect(0, 0, W, H);
    g.fillStyle(PALETTE.skyLight).fillRect(0, H - TILE * 7, W, TILE * 2);
    g.fillStyle(PALETTE.horizon).fillRect(0, H - TILE * 5, W, TILE * 2);
    g.fillStyle(PALETTE.hillFar).fillEllipse(W * 0.25, H * 0.75, W * 0.9, H * 0.55);
    g.fillStyle(PALETTE.hillFar).fillEllipse(W * 0.85, H * 0.8, W * 0.7, H * 0.45);
    g.fillStyle(PALETTE.hillNear).fillRect(0, H - TILE * 3, W, TILE * 3);
    const plots = Math.floor((W - TILE) / (TILE * 2));
    const startX = Math.floor((W - (plots * 2 - 1) * TILE) / 2);
    for (let i = 0; i < plots; i++) {
      const x = startX + i * TILE * 2;
      g.fillStyle(PALETTE.soil).fillRect(x, H - TILE * 2, TILE, TILE);
      g.fillStyle(PALETTE.strawberry).fillRect(x + TILE / 2 - 2, H - TILE * 2 + TILE / 2 - 2, 4, 4);
    }
  }
}
