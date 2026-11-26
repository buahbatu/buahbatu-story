import { describe, expect, it } from 'vitest';
import { DynamicResolution, autoTier, chooseFx, chooseTier, isTier } from './quality';

describe('tingkat kualitas grafis', () => {
  it('otomatis: desktop Tinggi, HP/tablet Seimbang, perangkat lemah Rendah', () => {
    expect(autoTier({ coarse: false })).toBe('high');
    expect(autoTier({ coarse: true, memoryGb: 8, cores: 8 })).toBe('balanced');
    expect(autoTier({ coarse: true, memoryGb: 2 })).toBe('low');
    expect(autoTier({ coarse: false, cores: 2 })).toBe('low');
  });

  it('urutan pilihan: ?gfx= > tersimpan > otomatis; nilai asing diabaikan', () => {
    expect(chooseTier('high', 'low', { coarse: true })).toEqual({ tier: 'high', forced: true });
    expect(chooseTier('retro', null, { coarse: false })).toEqual({ tier: 'high', forced: false });
    expect(chooseTier(null, 'low', { coarse: false })).toEqual({ tier: 'low', forced: true });
    expect(chooseTier('ultra', 'nope', { coarse: true })).toEqual({ tier: 'balanced', forced: false });
    expect(isTier('high')).toBe(true);
    expect(isTier(3)).toBe(false);
  });
});

describe('resolusi dinamis', () => {
  const rules = { window: 1, lowFps: 40, highFps: 56, step: 0.1, minScale: 0.6, cooldown: 2 };
  const run = (d: DynamicResolution, fps: number, seconds: number) => {
    let changed = 0;
    for (let t = 0; t < seconds * fps; t++) if (d.push(1 / fps)) changed++;
    return changed;
  };

  it('FPS rendah menurunkan skala bertahap sampai batas bawah, dengan jeda antar perubahan', () => {
    const d = new DynamicResolution(rules);
    expect(run(d, 20, 1.05)).toBe(1);
    expect(d.scale).toBeCloseTo(0.9);
    run(d, 20, 1.05);
    expect(d.scale).toBeCloseTo(0.9);
    run(d, 20, 30);
    expect(d.scale).toBeCloseTo(0.6);
  });

  it('FPS tinggi menaikkan kembali sampai 1; FPS sedang tidak mengubah', () => {
    const d = new DynamicResolution(rules);
    run(d, 20, 30);
    run(d, 60, 30);
    expect(d.scale).toBe(1);
    run(d, 48, 10);
    expect(d.scale).toBe(1);
  });

  it('dt nol (saat dibekukan/tes) tidak dihitung', () => {
    const d = new DynamicResolution(rules);
    for (let i = 0; i < 100; i++) expect(d.push(0)).toBe(false);
    expect(d.scale).toBe(1);
  });
});

describe('efek pasca-proses', () => {
  it('aktif bawaan, mati di mode tes, bisa dipaksa lewat ?fx', () => {
    expect(chooseFx(null, false)).toBe(true);
    expect(chooseFx(null, true)).toBe(false);
    expect(chooseFx('on', true)).toBe(true);
    expect(chooseFx('off', false)).toBe(false);
    expect(chooseFx('aneh', false)).toBe(true);
  });
});
