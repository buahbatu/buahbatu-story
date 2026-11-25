import type { Engine } from '../engine/engine';
import { GRAPHICS } from './graphics';
import { profile } from '../render/look';
import { computeSmoothView, type ViewResult } from '../utils/scale';

const UI_REFERENCE_HEIGHT = 360;
const PORTRAIT_TOUCH_QUERY = '(orientation: portrait) and (pointer: coarse)';

let dynamicScale = 1;

export function setDynamicScale(scale: number): void {
  dynamicScale = scale;
}

export function currentView(): ViewResult {
  const viewport = window.visualViewport;
  const viewportWidth = viewport?.width ?? window.innerWidth;
  const viewportHeight = viewport?.height ?? window.innerHeight;
  return computeSmoothView({
    viewportWidth,
    viewportHeight,
    devicePixelRatio: window.devicePixelRatio,
    maxDpr: profile().maxDpr,
    maxAspect: GRAPHICS.maxAspect,
    scale: dynamicScale,
  });
}

let refresh: () => void = () => undefined;
export const refreshView = (): void => {
  refresh();
};

export function installViewScaling(engine: Engine): () => void {
  let frame = 0;
  const portrait = window.matchMedia(PORTRAIT_TOUCH_QUERY);
  const apply = () => {
    frame = 0;
    const view = currentView();
    const { width, height, zoom } = engine.view;
    if (view.width !== width || view.height !== height || view.zoom !== zoom || view.ratio !== engine.view.ratio) engine.resize(view);
    const root = document.documentElement.style;
    root.setProperty('--px', `${(view.height * view.zoom) / UI_REFERENCE_HEIGHT}px`);
    root.setProperty('--game-w', `${view.width * view.zoom}px`);
    root.setProperty('--game-h', `${view.height * view.zoom}px`);
    if (portrait.matches) engine.sleep();
    else if (!document.documentElement.hasAttribute('data-frozen')) engine.wake();
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
  refresh = schedule;
  return () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    portrait.removeEventListener('change', schedule);
    dprQuery?.removeEventListener('change', onDprChange);
  };
}
