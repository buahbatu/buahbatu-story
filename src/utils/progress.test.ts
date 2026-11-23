import { describe, expect, it } from 'vitest';
import { loadingBarFill } from './progress';

describe('loadingBarFill', () => {
  it.each([
    { progress: 0, fillWidth: 0, percent: 0 },
    { progress: 0.5, fillWidth: 100, percent: 50 },
    { progress: 1, fillWidth: 200, percent: 100 },
    { progress: 0.999, fillWidth: 199, percent: 99 },
  ])('progress $progress → $fillWidth px, $percent%', ({ progress, fillWidth, percent }) => {
    expect(loadingBarFill(progress, 200)).toEqual({ fillWidth, percent });
  });
  it.each([-0.5, 1.7, Number.NaN])('nilai aneh (%s) dijepit ke 0–100%%', (progress) => {
    const { percent } = loadingBarFill(progress, 200);
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });
  it('lebar isi selalu bilangan bulat (tepi bar tajam)', () => {
    expect(Number.isInteger(loadingBarFill(1 / 3, 199).fillWidth)).toBe(true);
  });
});
