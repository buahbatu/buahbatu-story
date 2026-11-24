import type { MoveVector } from './logic';

export interface Stick extends MoveVector {
  power: number;
  knobX: number;
  knobY: number;
}

export function readStick(dx: number, dy: number, rules: { radius: number; deadZone: number }): Stick {
  const len = Math.hypot(dx, dy);
  const clamped = Math.min(len, rules.radius);
  const knobX = len > 0 ? (dx / len) * clamped : 0;
  const knobY = len > 0 ? (dy / len) * clamped : 0;
  const raw = clamped / rules.radius;
  if (raw <= rules.deadZone) return { x: 0, y: 0, power: 0, knobX, knobY };
  const power = (raw - rules.deadZone) / (1 - rules.deadZone);
  return { x: (dx / len) * power, y: (dy / len) * power, power, knobX, knobY };
}

export const stickRuns = (s: Pick<Stick, 'power'>, runAt: number): boolean => s.power >= runAt;
