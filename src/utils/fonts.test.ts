import { describe, expect, it } from 'vitest';
import { waitForFonts } from './fonts';

const never = () => new Promise<never>(() => undefined);

describe('waitForFonts', () => {
  it('loaded kalau semua font termuat', async () => {
    const loader = { load: () => Promise.resolve([]) };
    await expect(waitForFonts(loader, ['16px "A"', '16px "B"'], 1000)).resolves.toBe('loaded');
  });
  it('timeout kalau font tidak kunjung termuat (game tetap lanjut)', async () => {
    const loader = { load: never };
    const instant = (callback: () => void) => {
      callback();
    };
    await expect(waitForFonts(loader, ['16px "A"'], 1000, instant)).resolves.toBe('timeout');
  });
  it('failed (bukan error) kalau salah satu gagal', async () => {
    const loader = { load: () => Promise.reject(new Error('offline')) };
    await expect(waitForFonts(loader, ['16px "A"'], 1000)).resolves.toBe('failed');
  });
  it('failed kalau browser tidak punya document.fonts', async () => {
    await expect(waitForFonts(undefined, ['16px "A"'], 1000)).resolves.toBe('failed');
  });
});
