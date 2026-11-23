import type * as Phaser from 'phaser';

export function snapToPixel<T extends Phaser.GameObjects.Text>(text: T): T {
  const x = Math.round(text.x - text.displayWidth * text.originX);
  const y = Math.round(text.y - text.displayHeight * text.originY);
  return text.setOrigin(0, 0).setPosition(x, y);
}

export function centerOnPixel<T extends Phaser.GameObjects.Text>(text: T, centerX: number): T {
  return text.setOrigin(0, text.originY).setX(Math.round(centerX - text.displayWidth / 2));
}
