import { MOUSE_CAMERA } from '../config/controls';

export type DragMode = 'pan' | 'rotate';

export function dragModeFor(button: number, ctrlKey: boolean): DragMode | null {
  if (button === MOUSE_CAMERA.rotateButton || (button === 0 && ctrlKey)) return 'rotate';
  if (button === MOUSE_CAMERA.panButton) return 'pan';
  return null;
}

export function dragGesture(mode: DragMode, dx: number, dy: number): { panX?: number; panY?: number; twist?: number } {
  return mode === 'rotate' ? { twist: dx * MOUSE_CAMERA.twistPerPixel } : { panX: dx, panY: dy };
}
