import { describe, expect, it } from 'vitest';
import { MOUSE_CAMERA } from '../config/controls';
import { dragGesture, dragModeFor } from './mouse';

describe('seret mouse untuk kamera', () => {
  it('tombol tengah atau Ctrl + kiri memutar, kanan menggeser, kiri biasa tidak apa-apa', () => {
    expect(dragModeFor(1, false)).toBe('rotate');
    expect(dragModeFor(0, true)).toBe('rotate');
    expect(dragModeFor(2, false)).toBe('pan');
    expect(dragModeFor(0, false)).toBeNull();
    expect(dragModeFor(3, false)).toBeNull();
  });

  it('putar mengikuti gerak horizontal, geser mengikuti dua sumbu', () => {
    expect(dragGesture('rotate', 100, 40)).toEqual({ twist: 100 * MOUSE_CAMERA.twistPerPixel });
    expect(dragGesture('rotate', -50, 0).twist).toBeLessThan(0);
    expect(dragGesture('pan', 12, -7)).toEqual({ panX: 12, panY: -7 });
  });
});
