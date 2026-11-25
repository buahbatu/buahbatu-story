import { describe, expect, it } from 'vitest';
import { roadLayout, type RoadOptions } from './logic';

const rules = { dash: 1, gap: 1, line: 0.1, edgeInset: 0.2, curb: { width: 0.2 } };
const opts = (o: Partial<RoadOptions> = {}): RoadOptions => ({
  sidewalk: 0,
  markings: true,
  curb: true,
  bounds: { width: 20, height: 20 },
  extend: 0,
  ...o,
});

describe('tata letak jalan', () => {
  it('arah mengikuti sisi terpanjang', () => {
    expect(roadLayout({ x: 2, y: 5, w: 10, h: 4 }, opts(), rules).along).toBe('x');
    expect(roadLayout({ x: 2, y: 2, w: 3, h: 10 }, opts(), rules).along).toBe('y');
  });

  it('garis tengah putus-putus di tengah lebar, tidak keluar ujung jalan', () => {
    const l = roadLayout({ x: 2, y: 5, w: 10, h: 4 }, opts(), rules);
    expect(l.dashes).toHaveLength(5);
    for (const d of l.dashes) {
      expect(d.y + d.h / 2).toBeCloseTo(7);
      expect(d.h).toBeCloseTo(0.1);
      expect(d.x).toBeGreaterThanOrEqual(2);
      expect(d.x + d.w).toBeLessThanOrEqual(12);
    }
    expect(l.dashes[1]?.x).toBeCloseTo((l.dashes[0]?.x ?? 0) + 2);
  });

  it('garis tepi di kedua sisi dengan jarak dari kanstin', () => {
    const l = roadLayout({ x: 2, y: 5, w: 10, h: 4 }, opts(), rules);
    expect(l.edges.map((e) => [e.y, e.h])).toEqual([
      [expect.closeTo(5.2), expect.closeTo(0.1)],
      [expect.closeTo(8.7), expect.closeTo(0.1)],
    ]);
  });

  it('kanstin menempel di luar kedua sisi panjang; bisa dimatikan', () => {
    const l = roadLayout({ x: 2, y: 5, w: 10, h: 4 }, opts(), rules);
    expect(l.curbs.map((c) => [c.y, c.y + c.h])).toEqual([
      [4.8, 5],
      [9, expect.closeTo(9.2)],
    ]);
    expect(roadLayout({ x: 2, y: 5, w: 10, h: 4 }, opts({ curb: false, markings: false }), rules)).toMatchObject({
      curbs: [],
      dashes: [],
      edges: [],
    });
  });

  it('jalan yang menyentuh tepi peta diteruskan ke luar peta bersama trotoarnya', () => {
    const l = roadLayout({ x: 0, y: 5, w: 20, h: 4 }, opts({ extend: 10, sidewalk: 2 }), rules);
    expect([l.surface.x, l.surface.x + l.surface.w]).toEqual([-10, 30]);
    expect(l.curbs[0]).toMatchObject({ x: -10, w: 40 });
    expect(l.walks).toHaveLength(4);
    expect(l.walks[0]).toMatchObject({ x: -10, w: 10, y: 3, h: 2 });
    expect(l.dashes.some((d) => d.x < 0) && l.dashes.some((d) => d.x > 20)).toBe(true);
    const inside = roadLayout({ x: 3, y: 5, w: 10, h: 4 }, opts({ extend: 10, sidewalk: 2 }), rules);
    expect(inside.walks).toEqual([]);
    expect(inside.surface.x).toBe(3);
  });

  it('garis tengah tetap selaras dengan pola di dalam peta walau diperpanjang', () => {
    const base = roadLayout({ x: 0, y: 5, w: 20, h: 4 }, opts(), rules).dashes.map((d) => d.x);
    const ext = roadLayout({ x: 0, y: 5, w: 20, h: 4 }, opts({ extend: 6 }), rules).dashes.map((d) => d.x);
    for (const x of base) expect(ext).toContainEqual(expect.closeTo(x));
  });
});
