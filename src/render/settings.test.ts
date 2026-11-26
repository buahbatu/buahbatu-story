import { describe, expect, it } from 'vitest';
import { GRAPHICS } from '../config/graphics';
import { bendAt, isCurve, parseStored, resolveGraphics, serialize, tierOf } from './settings';

const desktop = { coarse: false };
const none = { gfx: null, fx: null, curve: null };

describe('simpanan pengaturan grafis', () => {
  it('membaca format lama (hanya nama tingkat)', () => {
    expect(parseStored('low')).toEqual({ tier: 'low' });
  });

  it('membaca JSON dan membuang nilai tidak dikenal', () => {
    expect(parseStored(serialize({ tier: 'auto', fx: false, curve: 'strong' }))).toEqual({ tier: 'auto', fx: false, curve: 'strong' });
    expect(parseStored('{"tier":"ultra","fx":"ya","curve":"bulat"}')).toEqual({});
  });

  it('data rusak atau kosong diabaikan', () => {
    expect(parseStored(null)).toEqual({});
    expect(parseStored('{rusak')).toEqual({});
    expect(parseStored('42')).toEqual({});
    expect(parseStored('null')).toEqual({});
  });

  it('isCurve hanya menerima tiga mode', () => {
    expect(isCurve('soft')).toBe(true);
    expect(isCurve('bulat')).toBe(false);
  });
});

describe('resolveGraphics', () => {
  it('bawaan: otomatis, efek nyala, lengkung halus', () => {
    expect(resolveGraphics(none, {}, desktop, false)).toEqual({
      settings: { tier: 'auto', fx: true, curve: GRAPHICS.curve.default },
      tier: 'high',
      forced: false,
    });
  });

  it('mode tes: efek mati kecuali disimpan atau dipaksa', () => {
    expect(resolveGraphics(none, {}, desktop, true).settings.fx).toBe(false);
    expect(resolveGraphics(none, { fx: true }, desktop, true).settings.fx).toBe(true);
    expect(resolveGraphics({ ...none, fx: 'on' }, { fx: false }, desktop, true).settings.fx).toBe(true);
  });

  it('parameter URL mengalahkan simpanan', () => {
    const r = resolveGraphics({ gfx: 'low', fx: 'off', curve: 'off' }, { tier: 'high', fx: true, curve: 'strong' }, desktop, false);
    expect(r).toEqual({ settings: { tier: 'low', fx: false, curve: 'off' }, tier: 'low', forced: true });
  });

  it('simpanan dipakai bila tanpa parameter', () => {
    const r = resolveGraphics(none, { tier: 'balanced', curve: 'strong' }, desktop, false);
    expect(r.tier).toBe('balanced');
    expect(r.forced).toBe(true);
    expect(r.settings.curve).toBe('strong');
  });

  it('tierOf otomatis mengikuti perangkat', () => {
    expect(tierOf('auto', { coarse: true })).toBe('balanced');
    expect(tierOf('low', desktop)).toBe('low');
  });
});

describe('rumus lengkung', () => {
  const dir = { x: 0, z: -1 };

  it('nol di titik fokus, naik kuadrat menjauh searah kamera', () => {
    expect(bendAt(0, 0, dir, 0.01, 0.25)).toBe(0);
    expect(bendAt(0, -10, dir, 0.01, 0.25)).toBeCloseTo(1);
    expect(bendAt(0, -20, dir, 0.01, 0.25)).toBeCloseTo(4);
    expect(bendAt(0, 10, dir, 0.01, 0.25)).toBeCloseTo(1);
  });

  it('ke samping lebih landai sesuai faktor side', () => {
    expect(bendAt(10, 0, dir, 0.01, 0.25)).toBeCloseTo(0.25);
  });

  it('mode Mati tidak menekuk', () => {
    expect(bendAt(30, -30, dir, GRAPHICS.curve.bend.off, 0.25)).toBe(0);
  });

  it('Kuat lebih melengkung dari Halus', () => {
    expect(bendAt(0, -20, dir, GRAPHICS.curve.bend.strong, 0.25)).toBeGreaterThan(bendAt(0, -20, dir, GRAPHICS.curve.bend.soft, 0.25));
  });
});
