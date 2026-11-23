import { describe, expect, it } from 'vitest';
import { computeView, type ViewLimits } from './scale';

const limits: ViewLimits = { baseHeight: 360, minHeight: 270, maxHeight: 450, maxWidth: 960 };
const view = (viewportWidth: number, viewportHeight: number, devicePixelRatio = 1) =>
  computeView({ ...limits, viewportWidth, viewportHeight, devicePixelRatio });
const fills = (r: ReturnType<typeof computeView>, w: number, h: number, dpr = 1) => {
  expect(Math.abs(r.width * r.zoom - w)).toBeLessThan(r.zoom);
  expect(Math.abs(r.height * r.zoom - h)).toBeLessThan(r.zoom);
  expect(Number.isInteger(r.pixelScale)).toBe(true);
  expect(r.zoom * dpr).toBeCloseTo(r.pixelScale);
};

describe('computeView (ADR-020: zoom integer, area pandang fleksibel)', () => {
  it.each([
    { w: 1366, h: 657, k: 2, gw: 683, gh: 328, label: 'laptop 1366×768 di Chrome' },
    { w: 1366, h: 768, k: 2, gw: 683, gh: 384, label: 'laptop 1366×768 F11' },
    { w: 1280, h: 720, k: 2, gw: 640, gh: 360, label: '720p' },
    { w: 1920, h: 969, k: 3, gw: 640, gh: 323, label: '1080p di Chrome' },
    { w: 1920, h: 1080, k: 3, gw: 640, gh: 360, label: '1080p F11' },
    { w: 2560, h: 1440, k: 4, gw: 640, gh: 360, label: '1440p' },
  ])('$label ($w×$h) → ×$k, dunia $gw×$gh, penuh layar', ({ w, h, k, gw, gh }) => {
    const r = view(w, h);
    expect(r).toMatchObject({ pixelScale: k, width: gw, height: gh });
    fills(r, w, h);
  });
  it('display scaling 125% (1536×730 CSS) → integer per pixel fisik, penuh', () => {
    const r = view(1536, 730, 1.25);
    expect(r.pixelScale).toBe(3);
    fills(r, 1536, 730, 1.25);
  });
  it.each([
    { w: 780, h: 360, dpr: 3, gw: 780, gh: 360, label: 'Android landscape' },
    { w: 734, h: 343, dpr: 3, gw: 734, gh: 343, label: 'iPhone landscape' },
    { w: 568, h: 320, dpr: 2, gw: 568, gh: 320, label: 'HP kecil' },
  ])('$label → integer & penuh layar (dunia $gw×$gh)', ({ w, h, dpr, gw, gh }) => {
    const r = view(w, h, dpr);
    expect(r).toMatchObject({ width: gw, height: gh });
    fills(r, w, h, dpr);
  });
  it('ultrawide: lebar dunia dibatasi maxWidth (sisanya bingkai)', () => {
    const r = view(5120, 1440);
    expect(r.width).toBe(960);
    expect(r.height).toBe(360);
  });
  it('tinggi dunia selalu dalam batas min–max untuk layar ≥ 540 px fisik', () => {
    for (let h = 540; h <= 2400; h += 7) {
      const r = view(1920, h);
      expect(r.height).toBeGreaterThanOrEqual(limits.minHeight);
      expect(r.height).toBeLessThanOrEqual(limits.maxHeight);
    }
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('DPR tidak valid (%s) dianggap 1', (dpr) => {
    expect(view(1280, 720, dpr)).toMatchObject({ pixelScale: 2, zoom: 2 });
  });
  it('viewport 0 (tab tersembunyi) tidak menghasilkan NaN atau 0', () => {
    const r = view(0, 0);
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
    expect(r.zoom).toBe(1);
  });
});
