import { describe, expect, it } from 'vitest';
import { LIGHTING, type LightKey } from '../../config/lighting';
import { lightingAt, mixColor, parseHex, parseHour, phaseOf, sunOffset, withAtmosphere, wrapHour } from './logic';

const first = LIGHTING.keys[0];
if (!first) throw new Error('titik kunci kosong');
const base: LightKey = first;
const key = (hour: number, over: { exposure?: number; tint?: string } = {}): LightKey => ({
  ...base,
  hour,
  exposure: over.exposure ?? base.exposure,
  tint: over.tint ?? base.tint,
});

describe('warna', () => {
  it('parseHex membaca #rrggbb dan menolak format lain', () => {
    expect(parseHex('#ff8000')).toBe(0xff8000);
    expect(() => parseHex('ff8000')).toThrow();
    expect(() => parseHex('#fff')).toThrow();
  });

  it('mixColor mencampur per kanal dan membatasi t', () => {
    expect(mixColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(mixColor(0x102030, 0x405060, 0)).toBe(0x102030);
    expect(mixColor(0x102030, 0x405060, 2)).toBe(0x405060);
  });
});

describe('lightingAt', () => {
  const keys = [key(6, { exposure: 1, tint: '#000000' }), key(18, { exposure: 2, tint: '#ffffff' })];

  it('tepat di titik kunci memakai nilainya', () => {
    expect(lightingAt(6, keys).exposure).toBe(1);
    expect(lightingAt(18, keys).tint).toBe(0xffffff);
  });

  it('di tengah dua titik kunci bercampur halus', () => {
    const mid = lightingAt(12, keys);
    expect(mid.exposure).toBeCloseTo(1.5);
    expect(mid.tint).toBe(0x808080);
  });

  it('melewati tengah malam tanpa lompatan', () => {
    expect(lightingAt(0, keys).exposure).toBeCloseTo(1.5);
    expect(lightingAt(24, keys).exposure).toBeCloseTo(lightingAt(0, keys).exposure);
    expect(lightingAt(-6, keys).exposure).toBeCloseTo(2);
  });

  it('berubah kontinu sepanjang hari pada titik kunci asli', () => {
    let prev = lightingAt(0, LIGHTING.keys);
    for (let m = 5; m <= 24 * 60; m += 5) {
      const next = lightingAt(m / 60, LIGHTING.keys);
      expect(Math.abs(next.sunIntensity - prev.sunIntensity)).toBeLessThan(0.1);
      expect(Math.abs(next.elevation - prev.elevation)).toBeLessThan(3);
      prev = next;
    }
  });

  it('siang lebih terang dari malam, sore lebih hangat dari siang', () => {
    const noon = lightingAt(12.5, LIGHTING.keys);
    const night = lightingAt(22, LIGHTING.keys);
    const dusk = lightingAt(17.5, LIGHTING.keys);
    expect(noon.sunIntensity).toBeGreaterThan(night.sunIntensity * 2);
    expect(noon.day).toBe(1);
    expect(night.day).toBe(0);
    const warmth = (c: number) => ((c >> 16) & 0xff) - (c & 0xff);
    expect(warmth(dusk.sun)).toBeGreaterThan(warmth(noon.sun));
    expect(warmth(night.tint)).toBeLessThan(0);
  });

  it('menolak daftar kosong', () => {
    expect(() => lightingAt(1, [])).toThrow();
  });

  it('satu titik kunci berlaku sepanjang hari', () => {
    expect(lightingAt(3, [key(9, { exposure: 1.2 })]).exposure).toBe(1.2);
  });
});

describe('arah matahari', () => {
  it('elevasi 90 tepat di atas, 0 di cakrawala', () => {
    const top = sunOffset({ elevation: 90, azimuth: 0 }, 10);
    expect(top.y).toBeCloseTo(10);
    expect(Math.hypot(top.x, top.z)).toBeCloseTo(0);
    const east = sunOffset({ elevation: 0, azimuth: 90 }, 10);
    expect(east.x).toBeCloseTo(10);
    expect(east.y).toBeCloseTo(0);
  });

  it('matahari selalu di atas cakrawala pada titik kunci asli', () => {
    for (let h = 0; h < 24; h += 0.25) expect(sunOffset(lightingAt(h, LIGHTING.keys), 1).y).toBeGreaterThan(0);
  });
});

describe('atmosfer area', () => {
  const base = lightingAt(12.5, LIGHTING.keys);

  it('warna area dicampur saat siang dan diabaikan saat malam', () => {
    const day = withAtmosphere(base, { fog: '#000000' }, 0.5);
    expect(day.fog).not.toBe(base.fog);
    const night = lightingAt(23, LIGHTING.keys);
    expect(withAtmosphere(night, { fog: '#000000', sky: '#000000' }, 0.5)).toEqual(night);
  });

  it('tanpa warna area tidak berubah', () => {
    expect(withAtmosphere(base, {}, 1)).toEqual(base);
  });
});

describe('jam', () => {
  it('wrapHour membungkus ke 0–24', () => {
    expect(wrapHour(25)).toBe(1);
    expect(wrapHour(-1)).toBe(23);
    expect(wrapHour(Number.NaN)).toBe(0);
  });

  it('phaseOf memberi fase hari', () => {
    expect(phaseOf(3)).toBe('night');
    expect(phaseOf(6)).toBe('dawn');
    expect(phaseOf(9)).toBe('morning');
    expect(phaseOf(12)).toBe('noon');
    expect(phaseOf(16)).toBe('afternoon');
    expect(phaseOf(18)).toBe('dusk');
    expect(phaseOf(21)).toBe('night');
  });

  it('parseHour menerima 0–23.99 saja', () => {
    expect(parseHour('17.5')).toBe(17.5);
    expect(parseHour('0')).toBe(0);
    expect(parseHour('24')).toBeNull();
    expect(parseHour('abc')).toBeNull();
    expect(parseHour('')).toBeNull();
    expect(parseHour(null)).toBeNull();
  });
});
