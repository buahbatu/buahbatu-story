import { describe, expect, it } from 'vitest';
import { SPRITES, SPRITE_COLORS, spriteRects } from './sprites';

describe('sprite pixel logo judul', () => {
  it('setiap sprite berbentuk persegi panjang & hanya memakai warna terdaftar', () => {
    for (const [name, rows] of Object.entries(SPRITES)) {
      const width = rows[0].length;
      expect(
        rows.every((r) => r.length === width),
        name,
      ).toBe(true);
      const unknown = Array.from(rows.join('')).filter((c) => c !== '.' && !(c in SPRITE_COLORS));
      expect(unknown, name).toEqual([]);
    }
  });

  it('piksel berurutan sewarna digabung jadi satu persegi', () => {
    expect(spriteRects(['RR.Y', '.YYY'])).toEqual([
      { x: 0, y: 0, w: 2, color: SPRITE_COLORS.R },
      { x: 3, y: 0, w: 1, color: SPRITE_COLORS.Y },
      { x: 1, y: 1, w: 3, color: SPRITE_COLORS.Y },
    ]);
  });

  it('jumlah piksel terisi sama dengan karakter berwarna', () => {
    for (const rows of Object.values(SPRITES)) {
      const filled = Array.from(rows.join('')).filter((c) => c !== '.').length;
      expect(spriteRects(rows).reduce((n, r) => n + r.w, 0)).toBe(filled);
    }
  });
});
