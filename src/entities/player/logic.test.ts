import { describe, expect, it } from 'vitest';
import { PLAYER } from '../../config/balance';
import { facingOf, stepMotion, yawOf, type PlayerMotion } from './logic';

const start: PlayerMotion = { x: 5, y: 5, facing: 's', anim: 'idle', animTime: 0 };
const bounds = { width: 10, height: 8 };

describe('facingOf', () => {
  it.each([
    [0, 1, 's'],
    [-1, 1, 'sw'],
    [-1, 0, 'w'],
    [-1, -1, 'nw'],
    [0, -1, 'n'],
    [1, -1, 'ne'],
    [1, 0, 'e'],
    [1, 1, 'se'],
  ] as const)('(%s, %s) → %s', (x, y, dir) => {
    expect(facingOf(x, y, 's')).toBe(dir);
  });
  it('diam mempertahankan arah terakhir; arah hampir lurus dibulatkan ke 8 arah', () => {
    expect(facingOf(0, 0, 'ne')).toBe('ne');
    expect(facingOf(0.95, 0.2, 's')).toBe('e');
  });
});

describe('stepMotion', () => {
  it('jalan & lari memakai kecepatan dari balance.ts', () => {
    const walk = stepMotion(start, { x: 1, y: 0 }, false, 0.5, bounds, PLAYER);
    expect(walk.x).toBeCloseTo(5 + PLAYER.walkSpeed * 0.5);
    expect(walk).toMatchObject({ facing: 'e', anim: 'walk' });
    const run = stepMotion(start, { x: 0, y: -1 }, true, 0.5, bounds, PLAYER);
    expect(run.y).toBeCloseTo(5 - PLAYER.runSpeed * 0.5);
    expect(run).toMatchObject({ facing: 'n', anim: 'run' });
  });
  it('tidak keluar tepi peta', () => {
    const far = stepMotion(start, { x: -1, y: 1 }, true, 10, bounds, PLAYER);
    expect(far.x).toBe(PLAYER.edgeMargin);
    expect(far.y).toBe(bounds.height - PLAYER.edgeMargin);
  });
  it('diam → idle, posisi & arah tetap; ganti animasi mengulang waktu animasi', () => {
    const walking = stepMotion(start, { x: 0, y: 1 }, false, 0.3, bounds, PLAYER);
    const walking2 = stepMotion(walking, { x: 0, y: 1 }, false, 0.3, bounds, PLAYER);
    expect(walking.animTime).toBe(0);
    expect(walking2.animTime).toBeCloseTo(0.3);
    const idle = stepMotion(walking2, { x: 0, y: 0 }, false, 0.3, bounds, PLAYER);
    expect(idle).toMatchObject({ x: walking2.x, y: walking2.y, facing: 's', anim: 'idle', animTime: 0 });
  });
});

describe('jeda belok', () => {
  const moving: PlayerMotion = { ...start, facing: 'sw', anim: 'walk' };
  it('dari diam langsung berbalik', () => {
    expect(stepMotion(start, { x: -1, y: 0 }, false, 0.016, bounds, PLAYER).facing).toBe('w');
  });
  it('saat bergerak, arah baru dipakai setelah ditahan turnDelay; melepas tombol diagonal tidak berurutan tetap menghadap diagonal', () => {
    const a = stepMotion(moving, { x: -1, y: 0 }, false, 0.016, bounds, PLAYER);
    expect(a.facing).toBe('sw');
    expect(stepMotion(a, { x: 0, y: 0 }, false, 0.016, bounds, PLAYER).facing).toBe('sw');
    let m = a;
    for (let i = 0; i < 5; i++) m = stepMotion(m, { x: -1, y: 0 }, false, 0.016, bounds, PLAYER);
    expect(m.facing).toBe('w');
    expect(m.turn).toBeUndefined();
  });
  it('frame lambat (dt besar) tetap butuh minimal 2 frame untuk berbelok', () => {
    const slow = stepMotion(moving, { x: -1, y: 0 }, false, 0.1, bounds, PLAYER);
    expect(slow.facing).toBe('sw');
    expect(stepMotion(slow, { x: -1, y: 0 }, false, 0.1, bounds, PLAYER).facing).toBe('w');
  });
});

describe('yawOf', () => {
  it.each([
    ['s', 0],
    ['w', -Math.PI / 2],
    ['n', -Math.PI],
    ['e', (-3 * Math.PI) / 2],
  ] as const)('%s → model menghadap arah gerak', (dir, yaw) => {
    expect(yawOf(dir)).toBeCloseTo(yaw);
  });
  it('arah hadap sama dengan atan2 vektor gerak (sumbu z = selatan)', () => {
    const yaw = yawOf('sw');
    expect(Math.sin(yaw)).toBeCloseTo(-Math.SQRT1_2);
    expect(Math.cos(yaw)).toBeCloseTo(Math.SQRT1_2);
  });
});
