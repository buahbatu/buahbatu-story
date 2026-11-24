import type { MoveVector } from '../../input/logic';

export const DIRECTIONS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'] as const;
export type Direction = (typeof DIRECTIONS)[number];
export type PlayerAnim = 'idle' | 'walk' | 'run';

export interface PlayerMotion {
  x: number;
  y: number;
  facing: Direction;
  anim: PlayerAnim;
  animTime: number;
  turn?: { facing: Direction; time: number };
}

export interface MotionRules {
  walkSpeed: number;
  runSpeed: number;
  edgeMargin: number;
  turnDelay: number;
}

export function facingOf(x: number, y: number, fallback: Direction): Direction {
  if (x === 0 && y === 0) return fallback;
  const deg = (Math.atan2(-x, y) * 180) / Math.PI;
  const index = (Math.round((deg + 360) / 45) % 8) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  return DIRECTIONS[index];
}

export function stepMotion(
  m: PlayerMotion,
  move: MoveVector,
  running: boolean,
  dt: number,
  bounds: { width: number; height: number },
  rules: MotionRules,
): PlayerMotion {
  const moving = move.x !== 0 || move.y !== 0;
  const anim: PlayerAnim = moving ? (running ? 'run' : 'walk') : 'idle';
  const speed = running ? rules.runSpeed : rules.walkSpeed;
  const clamp = (v: number, max: number) => Math.min(max - rules.edgeMargin, Math.max(rules.edgeMargin, v));
  const wanted = facingOf(move.x, move.y, m.facing);
  const step = Math.min(dt, rules.turnDelay / 2);
  const turnTime = wanted === m.turn?.facing ? m.turn.time + step : step;
  const instant = m.anim === 'idle' || wanted === m.facing;
  const facing = instant || turnTime >= rules.turnDelay ? wanted : m.facing;
  return {
    x: moving ? clamp(m.x + move.x * speed * dt, bounds.width) : m.x,
    y: moving ? clamp(m.y + move.y * speed * dt, bounds.height) : m.y,
    facing,
    anim,
    animTime: anim === m.anim ? m.animTime + dt : 0,
    ...(moving && facing !== wanted ? { turn: { facing: wanted, time: turnTime } } : {}),
  };
}

export function yawOf(facing: Direction): number {
  const i = DIRECTIONS.indexOf(facing);
  return (-i * Math.PI) / 4;
}
