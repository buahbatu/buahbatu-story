// Konfigurasi Phaser: resolusi dasar, pixel art, physics, dan integer scaling saat resize.
// Desain: docs/02-arsitektur.md §2 & §6, docs/40-ui-ux.md §1 & §7
import * as Phaser from 'phaser';

import { computeScale } from '../utils/scale';

/** Resolusi dasar dunia game (16:9). Di-scale integer: ×2 = 1280×720, ×3 = 1920×1080. */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const BACKGROUND_COLOR = '#1d1a2f';

export function createGameConfig(
  parent: string,
  scenes: Phaser.Types.Scenes.SceneType[],
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: BACKGROUND_COLOR,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.NONE,
      // Centering diurus CSS (grid place-items center di index.html). autoCenter Phaser menggeser
      // canvas 2px di display scaling 125% sehingga tepi kanan/bawah terpotong.
      autoCenter: Phaser.Scale.NO_CENTER,
      zoom: currentScale().zoom,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: scenes,
  };
}

function currentScale() {
  const viewport = window.visualViewport;
  return computeScale({
    viewportWidth: viewport?.width ?? window.innerWidth,
    viewportHeight: viewport?.height ?? window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    baseWidth: GAME_WIDTH,
    baseHeight: GAME_HEIGHT,
  });
}

/**
 * Hitung ulang zoom saat ukuran jendela, rotasi HP, atau display scaling berubah.
 * Mengembalikan fungsi untuk melepas listener.
 */
export function installIntegerScaling(game: Phaser.Game): () => void {
  let frame = 0;
  const apply = () => {
    frame = 0;
    const { zoom } = currentScale();
    if (game.scale.zoom !== zoom) game.scale.setZoom(zoom);
  };
  const schedule = () => {
    if (frame === 0) frame = requestAnimationFrame(apply);
  };

  // DPR berubah saat jendela pindah monitor atau zoom browser diubah.
  let dprQuery: MediaQueryList | undefined;
  const watchDpr = () => {
    dprQuery?.removeEventListener('change', onDprChange);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener('change', onDprChange);
  };
  const onDprChange = () => {
    watchDpr();
    schedule();
  };

  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  watchDpr();
  apply();

  return () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    dprQuery?.removeEventListener('change', onDprChange);
  };
}
