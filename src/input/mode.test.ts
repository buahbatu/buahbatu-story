import { describe, expect, it } from 'vitest';
import { initialMode, nextMode } from './mode';

describe('mode input otomatis (sentuh vs keyboard/mouse)', () => {
  it('awal mengikuti jenis perangkat: HP/tablet/iPad = sentuh, desktop = tidak', () => {
    expect(initialMode(true)).toBe('touch');
    expect(initialMode(false)).toBe('desktop');
  });
  it('sentuhan/pena memunculkan kontrol sentuh', () => {
    expect(nextMode('desktop', { kind: 'pointer', pointerType: 'touch', moved: 0 }, 4)).toBe('touch');
    expect(nextMode('desktop', { kind: 'pointer', pointerType: 'pen', moved: 0 }, 4)).toBe('touch');
  });
  it('keyboard atau mouse yang benar-benar digerakkan menyembunyikannya', () => {
    expect(nextMode('touch', { kind: 'key' }, 4)).toBe('desktop');
    expect(nextMode('touch', { kind: 'pointer', pointerType: 'mouse', moved: 12 }, 4)).toBe('desktop');
  });
  it('getaran mouse kecil diabaikan', () => {
    expect(nextMode('touch', { kind: 'pointer', pointerType: 'mouse', moved: 1 }, 4)).toBe('touch');
  });
});
