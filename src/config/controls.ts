import type { Bindings } from '../input/actions';

export const DEFAULT_BINDINGS: Bindings = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE', 'Enter'],
  useTool: ['KeyC'],
  phone: ['Tab'],
  emote: ['KeyF'],
  talk: ['KeyV'],
  jump: ['Space'],
  decor: ['KeyG'],
  log: ['KeyL'],
  cameraLeft: ['KeyQ'],
  cameraRight: ['KeyR'],
  zoomIn: ['Equal', 'NumpadAdd'],
  zoomOut: ['Minus', 'NumpadSubtract'],
  hotbarNext: ['BracketRight'],
  hotbarPrev: ['BracketLeft'],
  hotbar1: ['Digit1'],
  hotbar2: ['Digit2'],
  hotbar3: ['Digit3'],
  hotbar4: ['Digit4'],
  hotbar5: ['Digit5'],
  hotbar6: ['Digit6'],
  hotbar7: ['Digit7'],
  hotbar8: ['Digit8'],
  hotbar9: ['Digit9'],
  hotbar10: ['Digit0'],
};

export const MAX_KEYS_PER_ACTION = 2;

export const TOUCH_CONTROLS = {
  radius: 34,
  deadZone: 0.18,
  runAt: 0.92,
  mouseMove: 6,
  buttons: [
    { action: 'interact', icon: 'hand', label: 'touch.interact', size: 66 },
    { action: 'jump', icon: 'jump', label: 'touch.jump', size: 46 },
    { action: 'run', icon: 'run', label: 'touch.run', size: 46 },
    { action: 'useTool', icon: 'tool', label: 'touch.tool', size: 46 },
  ],
} as const;

export const MOUSE_CAMERA = {
  twistPerPixel: 0.008,
  rotateButton: 1,
  panButton: 2,
} as const;

export const CONTROLS_HINT = {
  showMs: 9000,
} as const;
