import { describe, expect, it } from 'vitest';
import { HEIGHT_STEP, WATER, WATER_DEPTH } from '../../config/world';
import type { AreaData, MapObject } from '../map/logic';
import { edgeWalls, foamPuffs, riverExits, ringPhase, skirtLayout, waterSurface, waterfallOf, waterfallsOf } from './logic';

const W = 6;
const H = 8;
function area(): AreaData {
  const terrain: string[] = Array.from({ length: W * H }, () => 'grass');
  const heights = Array.from({ length: W * H }, (_, i) => (Math.floor(i / W) < 4 ? 1 : 0));
  for (let y = 0; y < H; y++) for (const x of [2, 3]) terrain[y * W + x] = 'water';
  return {
    id: 't',
    width: W,
    height: H,
    terrain,
    heights,
    farmable: [],
    collisions: [],
    objects: [],
    spawns: {},
    tileset: { image: '', columns: 1, rows: 1, terrainTiles: {} },
    settings: {},
  };
}
const fall = (props: MapObject['props'], x = 2, y = 3.5, w = 2, h = 0.5): MapObject => ({
  id: 1,
  kind: 'waterfall',
  name: '',
  x,
  y,
  w,
  h,
  props,
});

describe('permukaan air mengikuti ketinggian petak', () => {
  it('air di dataran tingkat 1 lebih tinggi satu langkah dari air di bawah', () => {
    const a = area();
    expect(waterSurface(a, 2.5, 1.5)).toBeCloseTo(HEIGHT_STEP + WATER.surface);
    expect(waterSurface(a, 2.5, 6.5)).toBeCloseTo(WATER.surface);
    expect(waterSurface(a, -3, 99)).toBeCloseTo(WATER.surface);
  });
});

describe('air terjun', () => {
  it('arah s: garis jatuh di tepi selatan kotak, dari permukaan atas ke bawah', () => {
    const w = waterfallOf(area(), fall({ dir: 's' }));
    expect(w).toMatchObject({ dir: 's', from: { x: 2, z: 4 }, to: { x: 4, z: 4 }, normal: { x: 0, z: 1 } });
    expect(w?.top).toBeCloseTo(HEIGHT_STEP + WATER.surface);
    expect(w?.bottom).toBeCloseTo(WATER.surface);
  });

  it('arah n (aliran naik) ditolak karena air harus jatuh ke bawah', () => {
    expect(waterfallOf(area(), fall({ dir: 'n' }, 2, 4, 2, 0.5))).toBeNull();
  });

  it('ditolak kalau tidak ada air di atas atau di bawah, atau arah tidak dikenal', () => {
    expect(waterfallOf(area(), fall({ dir: 's' }, 0, 3.5, 1, 0.5))).toBeNull();
    expect(waterfallOf(area(), fall({ dir: 'x' }))).toBeNull();
  });

  it('arah e/w memakai tepi vertikal', () => {
    const a = area();
    for (let y = 0; y < H; y++) {
      a.terrain[y * W + 4] = 'water';
      a.heights[y * W + 4] = 0;
      a.heights[y * W + 3] = 1;
    }
    const w = waterfallOf(a, fall({ dir: 'e' }, 3.5, 5, 0.5, 2));
    expect(w).toMatchObject({ from: { x: 4, z: 5 }, to: { x: 4, z: 7 }, normal: { x: 1, z: 0 } });
  });

  it('waterfallsOf hanya mengambil objek waterfall yang sah', () => {
    const a = area();
    a.objects = [fall({ dir: 's' }), { ...fall({ dir: 'n' }), id: 2 }, { ...fall({ dir: 's' }), id: 3, kind: 'zone' }];
    expect(waterfallsOf(a)).toHaveLength(1);
  });
});

describe('animasi buih & riak (fungsi waktu, deterministik)', () => {
  it('buih tetap di depan tirai (z ≥ 0) dan dalam jari-jari', () => {
    for (const t of [0, 0.7, 3.3])
      for (const p of foamPuffs(7, t, 1)) {
        expect(p.z).toBeGreaterThanOrEqual(0);
        expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(1.0001);
      }
    expect(foamPuffs(5, 1.2, 1)).toEqual(foamPuffs(5, 1.2, 1));
  });

  it('fase riak 0..1 berulang & tersebar rata', () => {
    expect(ringPhase(0, 3, 0, 1.5)).toBe(0);
    expect(ringPhase(1, 3, 0, 1.5)).toBeCloseTo(1 / 3);
    expect(ringPhase(0, 3, 1.5, 1.5)).toBeCloseTo(0);
    expect(ringPhase(0, 3, -0.3, 1.5)).toBeGreaterThanOrEqual(0);
  });
});

describe('sungai tidak buntu: keluar peta lewat tepi', () => {
  const flat = (w: number, h: number, water: [number, number][]): AreaData => {
    const terrain = Array.from({ length: w * h }, () => 'grass');
    for (const [x, y] of water) terrain[y * w + x] = 'water';
    return { ...area(), width: w, height: h, terrain, heights: Array.from({ length: w * h }, () => 0), objects: [] };
  };

  it('air setinggi tanah dasar di tepi peta jadi pintu keluar sungai per sisi', () => {
    const a = flat(5, 4, [
      [0, 1],
      [0, 2],
      [2, 3],
      [3, 3],
      [4, 0],
    ]);
    expect(riverExits(a)).toEqual([
      { side: 'n', from: 4, to: 5 },
      { side: 's', from: 2, to: 4 },
      { side: 'w', from: 1, to: 3 },
      { side: 'e', from: 0, to: 1 },
    ]);
  });

  it('air di dataran tinggi di tepi peta (mata air) tidak diteruskan keluar', () => {
    const a = area();
    expect(riverExits(a).filter((e) => e.side === 'n')).toEqual([]);
    expect(riverExits(a).filter((e) => e.side === 's')).toEqual([{ side: 's', from: 2, to: 4 }]);
  });

  it('rumput di luar peta diberi celah selebar sungai; celah diisi alur sungai sepanjang margin', () => {
    const a = flat(6, 4, [
      [0, 1],
      [0, 2],
    ]);
    const { grass, beds } = skirtLayout(a, 10);
    expect(beds).toEqual([{ x: -10, z: 1, w: 10, d: 2 }]);
    const west = grass.filter((g) => g.x === -10 && g.z >= 0 && g.z < 4);
    expect(west).toEqual([
      { x: -10, z: 0, w: 10, d: 1 },
      { x: -10, z: 3, w: 10, d: 1 },
    ]);
    const area2 = (r: { w: number; d: number }) => r.w * r.d;
    const total = (6 + 20) * (4 + 20) - 6 * 4;
    expect(grass.reduce((s, g) => s + area2(g), 0) + beds.reduce((s, b) => s + area2(b), 0)).toBeCloseTo(total);
  });
});

describe('dinding tepi peta untuk dataran tinggi (tidak tembus langit)', () => {
  it('petak tinggi di tepi peta diberi dinding setinggi petaknya, dikelompokkan per tinggi', () => {
    const walls = edgeWalls(area());
    expect(walls.filter((w) => w.side === 'w')).toEqual([{ side: 'w', from: 0, to: 4, height: HEIGHT_STEP }]);
    expect(walls.filter((w) => w.side === 'n')).toEqual([
      { side: 'n', from: 0, to: 2, height: HEIGHT_STEP },
      { side: 'n', from: 2, to: 4, height: expect.closeTo(HEIGHT_STEP - WATER_DEPTH) as number },
      { side: 'n', from: 4, to: 6, height: HEIGHT_STEP },
    ]);
    expect(walls.filter((w) => w.side === 's')).toEqual([]);
  });
});
