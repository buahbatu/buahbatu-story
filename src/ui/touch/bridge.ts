import { TOUCH_CONTROLS } from '../../config/controls';
import type { Action, InputState } from '../../input';
import type { MoveVector } from '../../input/logic';
import { initialMode, nextMode, type InputMode, type InputSignal } from '../../input/mode';
import { uiStore } from '../uiState';

let target: InputState | null = null;

export function connectTouch(input: InputState): () => void {
  target = input;
  const coarse = window.matchMedia('(pointer: coarse)');
  const forced = new URLSearchParams(location.search).get('touch');
  let mode: InputMode = initialMode(coarse.matches);
  let last: { x: number; y: number } | null = null;
  const apply = () => {
    const touch = forced === null ? mode === 'touch' : forced === '1';
    if (uiStore.get().touch === touch) return;
    if (!touch) target?.releaseAll();
    uiStore.set({ touch });
  };
  const signal = (s: InputSignal) => {
    mode = nextMode(mode, s, TOUCH_CONTROLS.mouseMove);
    apply();
  };
  const key = () => {
    signal({ kind: 'key' });
  };
  const pointer = (e: PointerEvent) => {
    const moved = e.type === 'pointerdown' ? Infinity : last ? Math.hypot(e.clientX - last.x, e.clientY - last.y) : 0;
    if (e.pointerType === 'mouse') last = last && moved < TOUCH_CONTROLS.mouseMove ? last : { x: e.clientX, y: e.clientY };
    signal({ kind: 'pointer', pointerType: e.pointerType, moved });
  };
  const device = () => {
    mode = initialMode(coarse.matches);
    apply();
  };
  apply();
  window.addEventListener('keydown', key, true);
  window.addEventListener('pointerdown', pointer, true);
  window.addEventListener('pointermove', pointer, true);
  coarse.addEventListener('change', device);
  return () => {
    window.removeEventListener('keydown', key, true);
    window.removeEventListener('pointerdown', pointer, true);
    window.removeEventListener('pointermove', pointer, true);
    coarse.removeEventListener('change', device);
    target = null;
  };
}

export const touchStick = (v: MoveVector): void => target?.setStick(v);
export const touchAction = (action: Action, down: boolean, source?: string): void => target?.setVirtual(action, down, source);
