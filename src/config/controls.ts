import type { Bindings } from '../input/actions';

export const DEFAULT_BINDINGS: Bindings = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE', 'Enter'],
  useTool: ['Space'],
  phone: ['Tab'],
  emote: ['KeyF'],
  talk: ['KeyV'],
  decor: ['KeyB'],
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
