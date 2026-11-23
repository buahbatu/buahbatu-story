export interface FullscreenEnv {
  touch: boolean;
  supported: boolean;
  active: boolean;
  installedApp: boolean;
}

export const shouldEnterFullscreen = (env: FullscreenEnv): boolean => env.touch && env.supported && !env.active && !env.installedApp;

export function installTouchFullscreen(): () => void {
  const touch = window.matchMedia('(pointer: coarse)');
  const installed = window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)');
  const root = document.documentElement;
  const enter = () => {
    const env = {
      touch: touch.matches,
      supported: 'requestFullscreen' in root,
      active: document.fullscreenElement !== null,
      installedApp: installed.matches,
    };
    if (!shouldEnterFullscreen(env)) return;
    root
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation.lock('landscape'))
      .catch(() => undefined);
  };
  document.addEventListener('pointerup', enter);
  return () => {
    document.removeEventListener('pointerup', enter);
  };
}
