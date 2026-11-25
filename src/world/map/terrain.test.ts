import { describe, expect, it } from 'vitest';
import { HEIGHT_STEP, WATER, WATER_DEPTH } from '../../config/world';
import { cornerHill, elevation, hillAt, hillShape, type MapObject } from './logic';
import { atlasRect, buildTerrain, buildWater, scatterTufts, tileHash } from './terrain';

const tileset = { image: 'x.png', columns: 4, rows: 2, terrainTiles: { grass: 0, water: 1, sand: 2, cliff: 5 } };
const area = (terrain: string[], heights: number[], width = terrain.length, height = 1, objects: MapObject[] = []) => ({
  width,
  height,
  terrain,
  heights,
  tileset,
  objects,
});
const normalsOf = (mesh: ReturnType<typeof buildTerrain>) =>
  Array.from({ length: mesh.normals.length / 12 }, (_, q) => mesh.normals.slice(q * 12, q * 12 + 3).map((v) => Math.round(v) + 0));

describe('elevation', () => {
  it('ketinggian × HEIGHT_STEP, air lebih rendah, di luar peta dijepit ke tepi', () => {
    const a = area(['grass', 'water', 'grass'], [0, 0, 2]);
    expect(elevation(a, 0.5, 0.5)).toBe(0);
    expect(elevation(a, 1.2, 0.9)).toBe(-WATER_DEPTH);
    expect(elevation(a, 2.9, 0)).toBe(2 * HEIGHT_STEP);
    expect(elevation(a, 99, -5)).toBe(2 * HEIGHT_STEP);
  });
});

describe('atlasRect', () => {
  it('memetakan id tile ke UV atlas dengan inset & sumbu v terbalik', () => {
    const [u0, u1, vTop, vBottom] = atlasRect(tileset, 5);
    expect(u0).toBeCloseTo(0.25, 1);
    expect(u1).toBeCloseTo(0.5, 1);
    expect(vTop).toBeCloseTo(0.5, 1);
    expect(vBottom).toBeCloseTo(0, 1);
    expect(u0).toBeGreaterThan(0.25);
    expect(vBottom).toBeGreaterThan(0);
  });
  it('fraksi tinggi memotong tile dari atas', () => {
    const [, , vTop, vBottom] = atlasRect(tileset, 0, 0.5);
    expect(vTop - vBottom).toBeCloseTo(0.245, 3);
  });
});

describe('buildTerrain', () => {
  it('peta datar: satu permukaan per tile menghadap atas, tanpa dinding', () => {
    const mesh = buildTerrain(area(['grass', 'grass', 'grass'], [0, 0, 0]));
    expect(mesh.quads).toEqual({ top: 3, side: 0 });
    expect(mesh.positions).toHaveLength(3 * 4 * 3);
    expect(mesh.indices).toHaveLength(3 * 6);
    expect(normalsOf(mesh)).toEqual([
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ]);
  });
  it('dataran tinggi: dinding tebing menghadap keluar ke tile yang lebih rendah', () => {
    const mesh = buildTerrain(area(['grass', 'grass', 'grass'], [0, 1, 0]));
    expect(mesh.quads).toEqual({ top: 3, side: 2 });
    const normals = normalsOf(mesh);
    expect(normals).toContainEqual([1, 0, 0]);
    expect(normals).toContainEqual([-1, 0, 0]);
    const uvU = mesh.uvs[2 * 8] ?? 0;
    expect(uvU).toBeGreaterThan(0.25);
    expect(uvU).toBeLessThan(0.5);
  });
  it('tebing lebih dari 1 satuan dipecah per satuan supaya tekstur tidak gepeng', () => {
    const mesh = buildTerrain(area(['grass', 'grass'], [0, 3]));
    expect(mesh.quads.side).toBe(Math.ceil(3 * HEIGHT_STEP));
    const ys = mesh.positions.filter((_, i) => i % 3 === 1);
    expect(Math.max(...ys)).toBeCloseTo(3 * HEIGHT_STEP);
  });
  it('tepi air memakai tekstur tile di atasnya (pasir), bukan tebing', () => {
    const mesh = buildTerrain(area(['sand', 'water'], [0, 0]));
    expect(mesh.quads.side).toBe(1);
    const sideU = mesh.uvs[1 * 8] ?? 0;
    expect(sideU).toBeGreaterThan(0.5);
    expect(sideU).toBeLessThan(0.75);
  });
  it('arah dinding utara/selatan pada peta 2D', () => {
    const mesh = buildTerrain(area(['grass', 'grass', 'grass'], [0, 1, 0], 1, 3));
    expect(normalsOf(mesh).filter(([x, y]) => x === 0 && y === 0)).toEqual([
      [0, 0, 1],
      [0, 0, -1],
    ]);
  });
});

describe('tampilan tanah alami (P1-04b)', () => {
  it('tileHash deterministik di [0,1) & berbeda antar petak', () => {
    expect(tileHash(3, 4)).toBe(tileHash(3, 4));
    expect(tileHash(3, 4)).not.toBe(tileHash(4, 3));
    for (let i = 0; i < 50; i++) {
      const h = tileHash(i, i * 7, i % 3);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });
  it('setiap vertex punya warna; dinding tebing lebih gelap dari permukaan', () => {
    const mesh = buildTerrain(area(['grass', 'grass'], [0, 1]));
    expect(mesh.colors).toHaveLength(mesh.positions.length);
    const sideShade = mesh.colors[4 * 3 * 2] ?? 1;
    expect(sideShade).toBeLessThan(0.9);
  });
  it('air: satu permukaan transparan per petak air, di bawah tanah & di atas dasar kolam', () => {
    const water = buildWater(area(['grass', 'water', 'water'], [0, 0, 0]));
    expect(water.indices).toHaveLength(2 * 6);
    const ys = water.positions.filter((_, i) => i % 3 === 1);
    expect(new Set(ys)).toEqual(new Set([WATER.surface]));
    expect(WATER.surface).toBeLessThan(0);
    expect(WATER.surface).toBeGreaterThan(-WATER_DEPTH);
  });
  it('air di dataran tinggi (sungai antar-ketinggian) ikut naik sesuai tingkatnya', () => {
    const water = buildWater(area(['water', 'water'], [2, 0]));
    const ys = water.positions.filter((_, i) => i % 3 === 1);
    expect(ys.slice(0, 4).every((y) => Math.abs(y - (2 * HEIGHT_STEP + WATER.surface)) < 1e-9)).toBe(true);
    expect(ys.slice(4).every((y) => y === WATER.surface)).toBe(true);
  });
  it('rumput 3D hanya di petak rumput, tidak di petak terhalang, & deterministik', () => {
    const a = area(['grass', 'dirt', 'grass_flowers', 'water'], [0, 0, 0, 0]);
    const tufts = scatterTufts(a, () => false, 1);
    expect(tufts.every((t) => t.x < 1 || (t.x >= 2 && t.x < 3))).toBe(true);
    expect(scatterTufts(a, () => false, 1)).toEqual(tufts);
    expect(scatterTufts(a, () => true, 1)).toEqual([]);
  });
});

const hill = (cx: number, cy: number, r: number, height: number, flat = 0): MapObject => ({
  id: 9,
  kind: 'hill',
  name: '',
  x: cx - r,
  y: cy - r,
  w: r * 2,
  h: r * 2,
  props: { height, flat },
});
const grassField = (n: number, objects: MapObject[]) =>
  area(new Array<string>(n * n).fill('grass'), new Array<number>(n * n).fill(0), n, n, objects);

describe('kontur bukit & lembah (objek hill)', () => {
  it('bentuk halus: puncak datar sesuai flat, nol di tepi elips', () => {
    expect(hillShape(0, 0.3)).toBe(1);
    expect(hillShape(0.3, 0.3)).toBe(1);
    expect(hillShape(1, 0.3)).toBe(0);
    expect(hillShape(0.65, 0.3)).toBeCloseTo(0.5);
  });
  it('bukit menaikkan sudut petak, lembah (tinggi negatif) menurunkan, di luar elips tetap 0', () => {
    const a = grassField(12, [hill(6, 6, 4, 2, 0.25), hill(6, 6, 2, -0.5)]);
    expect(cornerHill(a, 6, 6)).toBeCloseTo(1.5);
    expect(cornerHill(a, 6, 2)).toBeCloseTo(0);
    expect(cornerHill(a, 0, 0)).toBe(0);
    expect(elevation(a, 1, 1)).toBe(0);
  });
  it('tinggi di dalam petak mengikuti dua segitiga mesh (kontinu, tanpa loncatan di batas petak)', () => {
    const a = grassField(12, [hill(6, 6, 5, 2)]);
    for (const [x, y] of [
      [4, 5],
      [5, 4],
      [7, 7],
    ] as const) {
      expect(hillAt(a, x, y)).toBeCloseTo(cornerHill(a, x, y));
      expect(hillAt(a, x - 1e-9, y)).toBeCloseTo(hillAt(a, x, y), 6);
      expect(hillAt(a, x, y - 1e-9)).toBeCloseTo(hillAt(a, x, y), 6);
    }
    const mid = hillAt(a, 4.5, 5.5);
    expect(mid).toBeGreaterThan(Math.min(cornerHill(a, 4, 5), cornerHill(a, 5, 6)) - 1e-9);
  });
  it('mesh: petak di lereng jadi 2 segitiga ber-normal miring, petak datar tetap 4 titik', () => {
    const flat = buildTerrain(grassField(4, []));
    expect(flat.positions.length / 3).toBe(16 * 4);
    const m = buildTerrain(grassField(8, [hill(4, 4, 3, 1)]));
    expect(m.positions.length / 3).toBeGreaterThan(64 * 4);
    const tilted = m.normals.filter((_, i) => i % 3 === 1).some((ny) => ny < 0.99);
    expect(tilted).toBe(true);
    expect(m.quads.top).toBe(64);
  });
  it('dinding tebing ikut terangkat bila tebing berada di lereng', () => {
    const t = new Array<string>(36).fill('grass');
    const h = new Array<number>(36).fill(0);
    for (let y = 0; y < 6; y++) for (let x = 3; x < 6; x++) h[y * 6 + x] = 1;
    const m = buildTerrain(area(t, h, 6, 6, [hill(3, 3, 3, 0.8, 0.4)]));
    const ys = m.positions.filter((_, i) => i % 3 === 1);
    expect(Math.max(...ys)).toBeCloseTo(1.8);
    expect(m.quads.side).toBe(6);
  });
});
