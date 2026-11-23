import * as Phaser from 'phaser';
import { TILE_SIZE as TILE } from '../config/constants';
import { PALETTE } from '../config/palette';
import { setActiveScene } from '../ui/uiState';
import { SCENE } from './keys';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE.title);
  }
  create(): void {
    this.drawBackdrop();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.redraw);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.redraw));
    setActiveScene(SCENE.title);
  }
  private readonly redraw = (): void => {
    this.children.removeAll(true);
    this.drawBackdrop();
  };
  private drawBackdrop(): void {
    const { width: W, height: H } = this.scale;
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
