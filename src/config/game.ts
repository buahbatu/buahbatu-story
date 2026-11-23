import * as Phaser from 'phaser';
import { computeView, type ViewLimits, type ViewResult } from '../utils/scale';

export const VIEW_LIMITS: ViewLimits = { baseHeight: 360, minHeight: 270, maxHeight: 450, maxWidth: 960 };
export const BACKGROUND_COLOR = '#1d1a2f';
export const PORTRAIT_TOUCH_QUERY = '(orientation: portrait) and (pointer: coarse)';

export function currentView(): ViewResult {
  const viewport = window.visualViewport;
  return computeView({
    ...VIEW_LIMITS,
    viewportWidth: viewport?.width ?? window.innerWidth,
    viewportHeight: viewport?.height ?? window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  });
}

export function createGameConfig(parent: string, scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
  const { width, height, zoom } = currentView();
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: BACKGROUND_COLOR,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER, zoom },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: scenes,
  };
}

export function installViewScaling(game: Phaser.Game): () => void {
  let frame = 0;
  const portrait = window.matchMedia(PORTRAIT_TOUCH_QUERY);
  const apply = () => {
    frame = 0;
    const { width, height, zoom } = currentView();
    if (game.scale.width !== width || game.scale.height !== height) game.scale.resize(width, height);
    if (game.scale.zoom !== zoom) game.scale.setZoom(zoom);
    const root = document.documentElement.style;
    root.setProperty('--zoom', String(zoom));
    root.setProperty('--game-w', `${width * zoom}px`);
    root.setProperty('--game-h', `${height * zoom}px`);
    if (portrait.matches) game.loop.sleep();
    else if (!document.documentElement.hasAttribute('data-frozen')) game.loop.wake();
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
  portrait.addEventListener('change', schedule);
  watchDpr();
  apply();
  return () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    portrait.removeEventListener('change', schedule);
    dprQuery?.removeEventListener('change', onDprChange);
  };
}
