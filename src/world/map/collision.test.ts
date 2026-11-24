import { describe, expect, it } from 'vitest';
import { PLAYER } from '../../config/balance';
import { stepMotion, type PlayerMotion } from '../../entities/player/logic';
import { bodyBlocked, rampProgress, rampsOf, shoreDistance, standHeight, walkLevel, waterAt, type AreaData, type MapObject } from './logic';

const W = 10;
const H = 6;
const body = { radius: 0.28, maxStep: 0.35, shallowTiles: 1 };
const lake = Array.from({ length: 5 }, (_, y) => [4, 5, 6, 7, 8].map((x) => [x, y] as [number, number])).flat();

function makeArea(
  opts: { water?: [number, number][]; high?: [number, number][]; collisions?: AreaData['collisions']; objects?: MapObject[] } = {},
): AreaData {
  const terrain = new Array<string>(W * H).fill('grass');
  const heights = new Array<number>(W * H).fill(0);
  for (const [x, y] of opts.water ?? []) terrain[y * W + x] = 'water';
  for (const [x, y] of opts.high ?? []) heights[y * W + x] = 1;
  return {
    id: 't',
    width: W,
    height: H,
    terrain,
    heights,
    farmable: new Array<boolean>(W * H).fill(false),
    collisions: opts.collisions ?? [],
    objects: opts.objects ?? [],
    spawns: { start: { x: 1, y: 1 } },
    tileset: { image: '', columns: 1, rows: 1, terrainTiles: {} },
    settings: {},
  };
}

const plateau = Array.from({ length: H }, (_, y) => [7, 8, 9].map((x) => [x, y] as [number, number])).flat();
const stairs: MapObject = {
  id: 1,
  kind: 'prop',
  name: '',
  x: 6,
  y: 3,
  w: 0,
  h: 0,
  props: { model: 'stairs', w: 2, d: 2, dir: 'e', rise: 1 },
};

describe('bodyBlocked', () => {
  it('kotak tabrakan, air dalam & tepi peta menghalangi; tanah lapang bebas', () => {
    const area = makeArea({ water: lake, collisions: [{ x: 2, y: 3, w: 1, h: 1 }] });
    expect(bodyBlocked(area, 1, 1, 0, body)).toBe(false);
    expect(bodyBlocked(area, 2.5, 3.5, 0, body)).toBe(true);
    expect(bodyBlocked(area, 1.8, 3.5, 0, body)).toBe(true);
    expect(bodyBlocked(area, 1.6, 3.5, 0, body)).toBe(false);
    expect(bodyBlocked(area, 6.5, 2.5, 0, body)).toBe(true);
    expect(bodyBlocked(area, 5.9, 2.5, 0, body)).toBe(true);
    expect(bodyBlocked(area, 4.5, 2.5, 0, body)).toBe(false);
    expect(bodyBlocked(area, 5.5, 4.5, 0, body)).toBe(false);
    expect(bodyBlocked(area, 0.2, 1, 0, body)).toBe(true);
  });

  it('pagar tipis tidak bisa ditembus walau lebih tipis dari badan', () => {
    const area = makeArea({ collisions: [{ x: 3, y: 0, w: 0.1, h: H }] });
    expect(bodyBlocked(area, 3.05, 2, 0, body)).toBe(true);
    expect(bodyBlocked(area, 3.3, 2, 0, body)).toBe(true);
    expect(bodyBlocked(area, 3.4, 2, 0, body)).toBe(false);
  });

  it('tebing tidak bisa dipanjat maupun dilompati turun', () => {
    const area = makeArea({ high: plateau });
    expect(bodyBlocked(area, 7.5, 2, 0, body)).toBe(true);
    expect(bodyBlocked(area, 6.5, 2, 1, body)).toBe(true);
    expect(bodyBlocked(area, 6.8, 2, 0, body)).toBe(true);
    expect(bodyBlocked(area, 8.5, 2, 1, body)).toBe(false);
  });
});

describe('tangga (ramp)', () => {
  const area = makeArea({ high: plateau, objects: [stairs] });

  it('tinggi naik bertahap dari dasar ke puncak tangga', () => {
    const [ramp] = rampsOf(area);
    expect(ramp).toMatchObject({ x: 5, y: 2, w: 2, h: 2, dir: 'e', base: 0, rise: 1 });
    if (!ramp) return;
    expect(rampProgress(ramp, 5, 3)).toBe(0);
    expect(rampProgress(ramp, 6, 3)).toBeCloseTo(0.5);
    expect(standHeight(area, 6, 3)).toBeCloseTo(0.5);
    expect(standHeight(area, 4, 3)).toBe(0);
    expect(standHeight(area, 8, 3)).toBe(1);
  });

  it('pemain bisa naik tangga sampai ke dataran tinggi, tapi tidak dari samping tebing', () => {
    let m: PlayerMotion = { x: 3, y: 3, facing: 'e', anim: 'idle', animTime: 0 };
    const blocked = (x: number, y: number, fx: number, fy: number) => bodyBlocked(area, x, y, walkLevel(area, fx, fy), PLAYER);
    for (let i = 0; i < 60; i++) m = stepMotion(m, { x: 1, y: 0 }, false, 1 / 30, area, PLAYER, blocked);
    expect(m.x).toBeGreaterThan(7.5);
    expect(standHeight(area, m.x, m.y)).toBe(1);
    let side: PlayerMotion = { x: 3, y: 0.6, facing: 'e', anim: 'idle', animTime: 0 };
    for (let i = 0; i < 60; i++) side = stepMotion(side, { x: 1, y: 0 }, false, 1 / 30, area, PLAYER, blocked);
    expect(side.x).toBeLessThan(7);
  });
});

describe('stepMotion dengan tabrakan', () => {
  const area = makeArea({ collisions: [{ x: 4, y: 0, w: 1, h: 3 }] });
  const blocked = (x: number, y: number) => bodyBlocked(area, x, y, 0, PLAYER);

  it('berhenti di depan dinding tanpa menembus walau frame lambat', () => {
    let m: PlayerMotion = { x: 2, y: 1, facing: 'e', anim: 'idle', animTime: 0 };
    for (let i = 0; i < 10; i++) m = stepMotion(m, { x: 1, y: 0 }, true, 0.25, area, PLAYER, blocked);
    expect(m.x).toBeLessThanOrEqual(4 - PLAYER.radius + 1e-9);
    expect(m.x).toBeGreaterThan(3.5);
  });

  it('meluncur sepanjang dinding saat bergerak diagonal', () => {
    let m: PlayerMotion = { x: 3.6, y: 1, facing: 'se', anim: 'idle', animTime: 0 };
    for (let i = 0; i < 30; i++) m = stepMotion(m, { x: Math.SQRT1_2, y: Math.SQRT1_2 }, false, 1 / 30, area, PLAYER, blocked);
    expect(m.y).toBeGreaterThan(2);
    expect(m.x).toBeLessThan(4);
  });

  it('kalau sudah terjebak di dalam objek, pemain tetap bisa keluar', () => {
    let m: PlayerMotion = { x: 4.5, y: 1, facing: 'w', anim: 'idle', animTime: 0 };
    for (let i = 0; i < 30; i++) m = stepMotion(m, { x: -1, y: 0 }, false, 1 / 30, area, PLAYER, blocked);
    expect(m.x).toBeLessThan(4);
  });
});

describe('air dangkal & dalam', () => {
  const area = makeArea({ water: lake });

  it('jarak ke tepi menentukan dangkal/dalam', () => {
    expect(shoreDistance(area)[2 * W + 6]).toBe(3);
    expect(waterAt(area, 4.5, 2.5, 1)).toBe('shallow');
    expect(waterAt(area, 6.5, 2.5, 1)).toBe('deep');
    expect(waterAt(area, 2.5, 2.5, 1)).toBe('none');
    expect(waterAt(area, -1, 2, 1)).toBe('none');
  });

  it('pemain bisa melangkah ke air dangkal, terendam lebih rendah dari daratan, tapi berhenti sebelum air dalam', () => {
    expect(walkLevel(area, 4.5, 2.5)).toBe(0);
    expect(standHeight(area, 4.5, 2.5)).toBeLessThan(0);
    let m: PlayerMotion = { x: 2.5, y: 2.5, facing: 'e', anim: 'idle', animTime: 0 };
    const blocked = (x: number, y: number, fx: number, fy: number) => bodyBlocked(area, x, y, walkLevel(area, fx, fy), PLAYER);
    for (let i = 0; i < 90; i++) m = stepMotion(m, { x: 1, y: 0 }, false, 1 / 30, area, PLAYER, blocked);
    expect(waterAt(area, m.x, m.y, 1)).toBe('shallow');
    expect(m.x).toBeLessThanOrEqual(6 - PLAYER.radius + 1e-9);
  });
});
