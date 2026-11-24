import { describe, expect, it } from 'vitest';
import { HEIGHT_STEP, WATER, WATER_DEPTH } from '../../config/world';
import { elevation } from './logic';
import { atlasRect, buildTerrain, buildWater, scatterTufts, tileHash } from './terrain';

const tileset = { image: 'x.png', columns: 4, rows: 2, terrainTiles: { grass: 0, water: 1, sand: 2, cliff: 5 } };
const area = (terrain: string[], heights: number[], width = terrain.length, height = 1) => ({ width, height, terrain, heights, tileset });
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
  it('rumput 3D hanya di petak rumput, tidak di petak terhalang, & deterministik', () => {
    const a = area(['grass', 'dirt', 'grass_flowers', 'water'], [0, 0, 0, 0]);
    const tufts = scatterTufts(a, () => false, 1);
    expect(tufts.every((t) => t.x < 1 || (t.x >= 2 && t.x < 3))).toBe(true);
    expect(scatterTufts(a, () => false, 1)).toEqual(tufts);
    expect(scatterTufts(a, () => true, 1)).toEqual([]);
  });
});
