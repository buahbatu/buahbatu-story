import type { InputState } from './logic';
import { dragGesture, dragModeFor, type DragMode } from './mouse';

const WHEEL_STEP = 100;

export function attachPointer(input: InputState, target: HTMLElement): () => void {
  const touches = new Map<number, { x: number; y: number }>();
  let drag: { x: number; y: number; mode: DragMode } | null = null;
  const pair = () => {
    const [a, b] = [...touches.values()];
    if (!a || !b) return null;
    return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, dist: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    input.addGesture({ zoom: Math.sign(e.deltaY) * Math.min(1, Math.abs(e.deltaY) / WHEEL_STEP) });
  };
  const down = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      return;
    }
    const mode = dragModeFor(e.button, e.ctrlKey);
    if (!mode) return;
    if (e.button === 1) e.preventDefault();
    drag = { x: e.clientX, y: e.clientY, mode };
    target.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
      const before = pair();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = pair();
      if (!before || !after) return;
      input.addGesture({
        zoom: before.dist > 0 && after.dist > 0 ? -Math.log(after.dist / before.dist) * 10 : 0,
        panX: after.mx - before.mx,
        panY: after.my - before.my,
        twist: after.angle - before.angle,
      });
      return;
    }
    if (!drag) return;
    input.addGesture(dragGesture(drag.mode, e.clientX - drag.x, e.clientY - drag.y));
    drag = { ...drag, x: e.clientX, y: e.clientY };
  };
  const up = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (drag && e.pointerType !== 'touch') drag = null;
  };
  const menu = (e: MouseEvent) => {
    e.preventDefault();
  };
  target.addEventListener('wheel', wheel, { passive: false });
  target.addEventListener('pointerdown', down);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', up);
  target.addEventListener('pointercancel', up);
  target.addEventListener('contextmenu', menu);
  return () => {
    target.removeEventListener('wheel', wheel);
    target.removeEventListener('pointerdown', down);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', up);
    target.removeEventListener('pointercancel', up);
    target.removeEventListener('contextmenu', menu);
  };
}
