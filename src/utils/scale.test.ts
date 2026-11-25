import { describe, expect, it } from 'vitest';
import { computeSmoothView } from './scale';

describe('computeSmoothView (ADR-030: resolusi penuh)', () => {
  const smooth = (vw: number, vh: number, dpr = 1, maxDpr = 2, scale = 1) =>
    computeSmoothView({ viewportWidth: vw, viewportHeight: vh, devicePixelRatio: dpr, maxDpr, maxAspect: 640 / 240, scale });

  it('kanvas memenuhi layar persis (tanpa sisa bingkai) dengan zoom 1', () => {
    expect(smooth(1280, 720)).toEqual({ zoom: 1, pixelScale: 1, width: 1280, height: 720, ratio: 1 });
    expect(smooth(1366, 657)).toMatchObject({ width: 1366, height: 657 });
  });

  it('rasio piksel = DPR dibatasi tingkat kualitas × skala dinamis', () => {
    expect(smooth(915, 412, 3, 1.5).ratio).toBe(1.5);
    expect(smooth(915, 412, 3, 1.5, 0.8).ratio).toBe(1.2);
    expect(smooth(1280, 720, 1, 2, 0.7).ratio).toBe(0.7);
  });

  it('layar super lebar dibatasi rasio maksimal (sisi kiri-kanan tidak ditarik)', () => {
    expect(smooth(3440, 1000)).toMatchObject({ width: Math.floor(1000 * (640 / 240)), height: 1000 });
  });
});
