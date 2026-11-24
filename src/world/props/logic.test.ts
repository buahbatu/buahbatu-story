import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ASSET_LOOK, PROP_ASSETS, PROP_MODELS } from '../../config/world';
import { assetsFor, fenceLayout, fitScale, pickIndex, projectUVs, varied } from './logic';

describe('pickIndex', () => {
  it('memetakan seed 0..1 ke indeks yang valid', () => {
    expect(pickIndex(4, 0)).toBe(0);
    expect(pickIndex(4, 0.49)).toBe(1);
    expect(pickIndex(4, 0.999)).toBe(3);
    expect(pickIndex(4, 1)).toBe(3);
    expect(pickIndex(0, 0.5)).toBe(0);
  });

  it('memakai semua varian untuk seed yang tersebar', () => {
    const seen = new Set(Array.from({ length: 40 }, (_, i) => pickIndex(3, i / 40)));
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });
});

describe('varied', () => {
  it('tetap dalam rentang ±amount dan deterministik', () => {
    for (let i = 0; i < 50; i++) {
      const v = varied(i / 50, 0.12);
      expect(v).toBeGreaterThanOrEqual(0.88);
      expect(v).toBeLessThanOrEqual(1.12);
      expect(varied(i / 50, 0.12)).toBe(v);
    }
  });
});

describe('fitScale', () => {
  it('menghitung skala ke ukuran target', () => {
    expect(fitScale(2, 4)).toBe(2);
    expect(fitScale(0, 4)).toBe(1);
  });
});

describe('fenceLayout', () => {
  it('membagi panjang pagar ke segmen yang pas tanpa celah', () => {
    const { count, stretch, offsets } = fenceLayout(9, 2.5);
    expect(count).toBe(4);
    expect(stretch).toBeCloseTo(0.9);
    expect(offsets[0]).toBeCloseTo(-3.375);
    expect(offsets.at(-1)).toBeCloseTo(3.375);
  });

  it('minimal satu segmen untuk pagar pendek', () => {
    expect(fenceLayout(0.4, 2.5).count).toBe(1);
  });
});

describe('assetsFor', () => {
  it('mengumpulkan file unik per model prop dan mengabaikan model tanpa aset', () => {
    expect(assetsFor(['bush', 'pot', 'farmhouse', 'tidak_ada', 'constructor', 7])).toEqual(
      [...new Set([...PROP_ASSETS.bush, ...PROP_ASSETS.pot])].sort(),
    );
  });

  it('semua aset terdaftar ada di public/assets/models dan dipakai model prop yang sah', () => {
    for (const [model, files] of Object.entries(PROP_ASSETS)) {
      expect(PROP_MODELS).toContain(model);
      for (const file of files) expect(existsSync(`public/assets/models/${file}.glb`), file).toBe(true);
    }
  });

  it('warna alami terdefinisi sebagai hex', () => {
    for (const hex of Object.values(ASSET_LOOK.colors)) expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('projectUVs', () => {
  it('memproyeksikan UV dari sumbu normal yang dominan', () => {
    const position = [1, 2, 3, 1, 2, 3, 1, 2, 3];
    const normal = [0, 1, 0, 0.9, 0.1, 0.2, 0.1, 0.2, -0.9];
    expect([...projectUVs(position, normal, 2)]).toEqual([2, 6, 6, 4, 2, 4]);
  });

  it('jumlah UV mengikuti jumlah titik', () => {
    expect(projectUVs([], [], 3)).toHaveLength(0);
    expect(projectUVs([0, 0, 0, 1, 1, 1], [0, 0, 1, 0, 0, 1], 1)).toHaveLength(4);
  });
});
