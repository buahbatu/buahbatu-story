import type { Action, InputState } from '../../input';
import type { MoveVector } from '../../input/logic';
import { uiStore } from '../uiState';

let target: InputState | null = null;

export function connectTouch(input: InputState): () => void {
  target = input;
  const coarse = window.matchMedia('(pointer: coarse)');
  const forced = new URLSearchParams(location.search).get('touch');
  const sync = () => {
    uiStore.set({ touch: forced === null ? coarse.matches : forced === '1' });
  };
  sync();
  coarse.addEventListener('change', sync);
  return () => {
    coarse.removeEventListener('change', sync);
    target = null;
  };
}

export const touchStick = (v: MoveVector): void => target?.setStick(v);
export const touchAction = (action: Action, down: boolean): void => target?.setVirtual(action, down);
