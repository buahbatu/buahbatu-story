import { describe, expect, it } from 'vitest';
import { shouldEnterFullscreen, type FullscreenEnv } from './fullscreen';

const base: FullscreenEnv = { touch: true, supported: true, active: false, installedApp: false };

describe('shouldEnterFullscreen', () => {
  it('HP di browser, belum layar penuh → masuk layar penuh saat disentuh', () => {
    expect(shouldEnterFullscreen(base)).toBe(true);
  });
  it.each([
    ['desktop (mouse)', { touch: false }],
    ['browser tanpa Fullscreen API (Safari iPhone)', { supported: false }],
    ['sudah layar penuh', { active: true }],
    ['dibuka dari ikon home screen (PWA)', { installedApp: true }],
  ])('%s → tidak', (_, patch) => {
    expect(shouldEnterFullscreen({ ...base, ...patch })).toBe(false);
  });
});
