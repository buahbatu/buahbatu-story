import * as Phaser from 'phaser';
import { computeScale } from '../utils/scale';

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const BACKGROUND_COLOR = '#1d1a2f';

export function createGameConfig(parent: string, scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
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

export function installIntegerScaling(game: Phaser.Game): () => void {
  let frame = 0;
  const apply = () => {
    frame = 0;
    const { zoom } = currentScale();
    if (game.scale.zoom !== zoom) game.scale.setZoom(zoom);
    const root = document.documentElement.style;
    root.setProperty('--zoom', String(zoom));
    root.setProperty('--game-w', `${GAME_WIDTH * zoom}px`);
    root.setProperty('--game-h', `${GAME_HEIGHT * zoom}px`);
  };
  const schedule = () => {
    if (frame === 0) frame = requestAnimationFrame(apply);
  };
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
