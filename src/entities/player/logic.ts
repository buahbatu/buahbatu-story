import type { MoveVector } from '../../input/logic';

export const DIRECTIONS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'] as const;
export type Direction = (typeof DIRECTIONS)[number];
export type PlayerAnim = 'idle' | 'walk' | 'run' | 'jump';

export interface PlayerMotion {
  x: number;
  y: number;
  facing: Direction;
  anim: PlayerAnim;
  animTime: number;
  turn?: { facing: Direction; time: number };
  air?: number;
}

export interface MotionRules {
  walkSpeed: number;
  runSpeed: number;
  edgeMargin: number;
  turnDelay: number;
}

const MAX_SUBSTEP = 0.1;

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
  blocked: (x: number, y: number, fromX: number, fromY: number) => boolean = () => false,
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
  let x = m.x;
  let y = m.y;
  if (moving) {
    const free = !blocked(x, y, x, y);
    const steps = Math.max(1, Math.ceil((Math.hypot(move.x, move.y) * speed * dt) / MAX_SUBSTEP));
    for (let i = 0; i < steps; i++) {
      const nx = clamp(x + (move.x * speed * dt) / steps, bounds.width);
      if (!free || !blocked(nx, y, x, y)) x = nx;
      const ny = clamp(y + (move.y * speed * dt) / steps, bounds.height);
      if (!free || !blocked(x, ny, x, y)) y = ny;
    }
  }
  return {
    x,
    y,
    facing,
    anim,
    animTime: anim === m.anim ? m.animTime + dt : 0,
    ...(moving && facing !== wanted ? { turn: { facing: wanted, time: turnTime } } : {}),
    ...(m.air === undefined ? {} : { air: m.air }),
  };
}

export function yawOf(facing: Direction): number {
  const i = DIRECTIONS.indexOf(facing);
  return (-i * Math.PI) / 4;
}

export interface JumpRules {
  jumpTime: number;
  jumpHeight: number;
}

export function stepJump(m: PlayerMotion, pressed: boolean, dt: number, rules: JumpRules): PlayerMotion {
  if (m.air !== undefined) {
    const air = m.air + dt;
    if (air < rules.jumpTime) return { ...m, air, anim: 'jump', animTime: air };
    const landed = { ...m, anim: m.anim === 'jump' ? ('idle' as const) : m.anim, animTime: 0 };
    delete landed.air;
    return landed;
  }
  return pressed ? { ...m, air: 0, anim: 'jump', animTime: 0 } : m;
}

export function jumpHeight(m: Pick<PlayerMotion, 'air'>, rules: JumpRules): number {
  if (m.air === undefined) return 0;
  const t = Math.min(1, Math.max(0, m.air / rules.jumpTime));
  return 4 * rules.jumpHeight * t * (1 - t);
}
