import { describe, expect, it } from 'vitest';
import { computeScale } from './scale';

const base = { baseWidth: 640, baseHeight: 360 };

describe('computeScale', () => {
  it.each([
    { w: 1280, h: 720, zoom: 2 },
    { w: 1920, h: 1080, zoom: 3 },
    { w: 2560, h: 1440, zoom: 4 },
    { w: 640, h: 360, zoom: 1 },
  ])('DPR 1, $w×$h → ×$zoom', ({ w, h, zoom }) => {
    expect(computeScale({ ...base, viewportWidth: w, viewportHeight: h, devicePixelRatio: 1 })).toEqual({
      zoom,
      devicePixelsPerGamePixel: zoom,
      integer: true,
    });
  });
  it('membulatkan ke bawah, tidak pernah melebihi layar', () => {
    const r = computeScale({ ...base, viewportWidth: 1366, viewportHeight: 657, devicePixelRatio: 1 });
    expect(r.zoom).toBe(1);
    expect(640 * r.zoom).toBeLessThanOrEqual(1366);
    expect(360 * r.zoom).toBeLessThanOrEqual(657);
  });
  it('dibatasi sisi yang paling sempit (layar lebar)', () => {
    const r = computeScale({ ...base, viewportWidth: 3440, viewportHeight: 1000, devicePixelRatio: 1 });
    expect(r.zoom).toBe(2);
  });
  it('display scaling 125%: pixel fisik tetap bulat (×3 fisik = zoom CSS 2,4)', () => {
    const r = computeScale({ ...base, viewportWidth: 1536, viewportHeight: 864, devicePixelRatio: 1.25 });
    expect(r.devicePixelsPerGamePixel).toBe(3);
    expect(r.zoom).toBeCloseTo(2.4);
    expect(Number.isInteger(640 * r.zoom * 1.25)).toBe(true);
  });
  it('HP retina landscape (844×390, DPR 3) → ×3 fisik = zoom CSS 1', () => {
    const r = computeScale({ ...base, viewportWidth: 844, viewportHeight: 390, devicePixelRatio: 3 });
    expect(r).toEqual({ zoom: 1, devicePixelsPerGamePixel: 3, integer: true });
  });
  it('iPhone landscape (734×343, DPR 3) → pecahan ×2,86 yang memenuhi layar (ADR-018)', () => {
    const r = computeScale({ ...base, viewportWidth: 734, viewportHeight: 343, devicePixelRatio: 3 });
    expect(r.integer).toBe(false);
    expect(r.devicePixelsPerGamePixel).toBeCloseTo((343 * 3) / 360, 2);
    expect(360 * r.zoom).toBeLessThanOrEqual(343);
    expect(360 * r.zoom).toBeGreaterThan(343 - 1);
    expect(Number.isInteger(Math.round(640 * r.zoom * 3 * 1e6) / 1e6)).toBe(true);
  });
  it('Android landscape (780×360, DPR 3) → tetap integer ×3', () => {
    const r = computeScale({ ...base, viewportWidth: 780, viewportHeight: 360, devicePixelRatio: 3 });
    expect(r).toEqual({ zoom: 1, devicePixelsPerGamePixel: 3, integer: true });
  });
  it.each([
    { w: 1920, h: 960, dpr: 1, zoom: 2 },
    { w: 1366, h: 657, dpr: 1, zoom: 1 },
    { w: 1536, h: 750, dpr: 1.25, zoom: 1.6 },
  ])('desktop DPR < 2 ($w×$h @$dpr) selalu integer walau tidak penuh', ({ w, h, dpr, zoom }) => {
    const r = computeScale({ ...base, viewportWidth: w, viewportHeight: h, devicePixelRatio: dpr });
    expect(r.integer).toBe(true);
    expect(r.zoom).toBeCloseTo(zoom);
  });
  it('Retina yang hampir penuh tetap integer (fill ≥ 80%)', () => {
    const r = computeScale({ ...base, viewportWidth: 1440, viewportHeight: 800, devicePixelRatio: 2 });
    expect(r).toEqual({ zoom: 2, devicePixelsPerGamePixel: 4, integer: true });
  });
  it('layar lebih kecil dari 640×360 → diperkecil pecahan, ditandai tidak integer', () => {
    const r = computeScale({ ...base, viewportWidth: 568, viewportHeight: 320, devicePixelRatio: 1 });
    expect(r.integer).toBe(false);
    expect(r.zoom).toBeCloseTo(568 / 640);
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('DPR tidak valid (%s) dianggap 1', (dpr) => {
    const r = computeScale({ ...base, viewportWidth: 1280, viewportHeight: 720, devicePixelRatio: dpr });
    expect(r.zoom).toBe(2);
  });
  it('viewport 0 (tab tersembunyi) tidak menghasilkan NaN', () => {
    const r = computeScale({ ...base, viewportWidth: 0, viewportHeight: 0, devicePixelRatio: 1 });
    expect(r.zoom).toBe(1);
  });
});
