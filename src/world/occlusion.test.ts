import { describe, expect, it } from 'vitest';
import { fadeStep } from './occlusion';

describe('fadeStep', () => {
  it('bergerak menuju target tanpa melewatinya', () => {
    expect(fadeStep(1, 0.3, 0.1, 5)).toBeCloseTo(0.5);
    expect(fadeStep(0.5, 0.3, 0.1, 5)).toBe(0.3);
    expect(fadeStep(0.3, 1, 0.1, 5)).toBeCloseTo(0.8);
    expect(fadeStep(0.9, 1, 0.1, 5)).toBe(1);
  });
});
