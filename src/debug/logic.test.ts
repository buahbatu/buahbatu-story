import { describe, expect, it } from 'vitest';
import type { AreaData, MapObject } from '../world/map/logic';
import { FpsMeter, boxSegments, cliffSegments, debugRequested, deepTiles, gridSegments } from './logic';

const W = 10;
const H = 6;

function makeArea(opts: { water?: [number, number][]; high?: [number, number][]; objects?: MapObject[] } = {}): AreaData {
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
    collisions: [],
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

describe('debugRequested', () => {
  it('hanya ?debug=1 dan hanya bila build mengizinkan', () => {
    expect(debugRequested('?debug=1', true)).toBe(true);
    expect(debugRequested('?area=lembang&debug=1', true)).toBe(true);
    expect(debugRequested('?debug=0', true)).toBe(false);
    expect(debugRequested('', true)).toBe(false);
    expect(debugRequested('?debug=1', false)).toBe(false);
  });
});

describe('FpsMeter', () => {
  it('rata-rata bergulir dalam jendela waktu', () => {
    const m = new FpsMeter(0.5);
    expect(m.read()).toEqual({ fps: 0, ms: 0 });
    for (let i = 0; i < 60; i++) m.push(1 / 60);
    expect(m.read()).toEqual({ fps: 60, ms: 16.7 });
    for (let i = 0; i < 60; i++) m.push(1 / 30);
    expect(m.read().fps).toBe(30);
  });
  it('dt nol (frame pertama) diabaikan', () => {
    const m = new FpsMeter(0.5);
    m.push(0);
    m.push(0.02);
    expect(m.read()).toEqual({ fps: 50, ms: 20 });
  });
});

describe('segmen overlay', () => {
  it('grid menutup setiap petak tepat sekali, mengikuti tinggi tanah', () => {
    const segs = gridSegments(makeArea({ high: plateau }), 0.03);
    expect(segs).toHaveLength(W * H * 2 + W + H);
    expect(segs).toContainEqual([8, 1.03, 2, 9, 1.03, 2]);
    expect(segs).toContainEqual([1, 0.03, 2, 2, 0.03, 2]);
  });
  it('tebing ditandai di tepi beda tinggi, kecuali yang dijembatani tangga; tepi kolam bukan tebing', () => {
    expect(cliffSegments(makeArea({ high: plateau }), 0.35, 0)).toHaveLength(H);
    const withStairs = cliffSegments(makeArea({ high: plateau, objects: [stairs] }), 0.35, 0);
    expect(withStairs).toHaveLength(H - 2);
    expect(withStairs.every((s) => s[0] === 7 && s[1] === 1)).toBe(true);
    expect(cliffSegments(makeArea({ water: [[3, 3]] }), 0.35, 0)).toEqual([]);
  });
  it('air dalam = petak yang jauh dari tepi', () => {
    const lake = Array.from({ length: 5 }, (_, y) => [2, 3, 4, 5, 6].map((x) => [x, y] as [number, number])).flat();
    const deep = deepTiles(makeArea({ water: lake }), { shallowTiles: 1 });
    expect(deep).toContainEqual({ x: 4, y: 2 });
    expect(deep).not.toContainEqual({ x: 2, y: 2 });
  });
  it('kotak = 12 rusuk', () => {
    const b = boxSegments(1, 2, 3, 4, 0, 1);
    expect(b).toHaveLength(12);
    expect(b).toContainEqual([4, 1, 6, 1, 1, 6]);
  });
});
