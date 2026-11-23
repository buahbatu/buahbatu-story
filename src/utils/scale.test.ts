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
