export type InputMode = 'touch' | 'desktop';
export type InputSignal = { kind: 'key' } | { kind: 'pointer'; pointerType: string; moved: number };

export const initialMode = (coarse: boolean): InputMode => (coarse ? 'touch' : 'desktop');

export function nextMode(current: InputMode, signal: InputSignal, moveThreshold: number): InputMode {
  if (signal.kind === 'key') return 'desktop';
  if (signal.pointerType === 'touch' || signal.pointerType === 'pen') return 'touch';
  if (signal.pointerType === 'mouse' && signal.moved >= moveThreshold) return 'desktop';
  return current;
}
