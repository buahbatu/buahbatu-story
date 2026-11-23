// Teks Phaser yang mendarat di pixel penuh. Origin 0.5 pada teks berlebar ganjil membuat posisi
// jatuh di .5 → tepi huruf jadi setengah transparan (blur). Desain: docs/40-ui-ux.md §1
import type * as Phaser from 'phaser';

/** Pertahankan posisi visual, tapi ubah origin ke (0,0) dan bulatkan koordinat. */
export function snapToPixel<T extends Phaser.GameObjects.Text>(text: T): T {
  const x = Math.round(text.x - text.displayWidth * text.originX);
  const y = Math.round(text.y - text.displayHeight * text.originY);
  return text.setOrigin(0, 0).setPosition(x, y);
}

/** Tengahkan teks (origin 0) secara horizontal di `centerX`, dibulatkan. Panggil ulang setelah setText. */
export function centerOnPixel<T extends Phaser.GameObjects.Text>(text: T, centerX: number): T {
  return text.setOrigin(0, text.originY).setX(Math.round(centerX - text.displayWidth / 2));
}
