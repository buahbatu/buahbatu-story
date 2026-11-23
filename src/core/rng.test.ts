import { describe, expect, it } from 'vitest';

import { createRng, hashSeed, nextFloat, normalizeSeed } from './rng';

const sequence = (seed: number, n: number) => {
  const holder = { rngState: seed };
  const rng = createRng(holder);
  return Array.from({ length: n }, () => rng.float());
};

describe('nextFloat', () => {
  it('murni: input sama → output sama', () => {
    expect(nextFloat(42)).toEqual(nextFloat(42));
  });

  it('nilai selalu 0 ≤ x < 1 dan state uint32', () => {
    let state = 123;
    for (let i = 0; i < 10_000; i++) {
      const [value, next] = nextFloat(state);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      expect(next).toBe(next >>> 0);
      state = next;
    }
  });
});

describe('createRng — determinisme', () => {
  it('seed sama → urutan identik (host & klien konsisten)', () => {
    expect(sequence(42, 50)).toEqual(sequence(42, 50));
  });

  it('seed berbeda → urutan berbeda', () => {
    expect(sequence(42, 10)).not.toEqual(sequence(43, 10));
  });

  it('urutan seed 42 terkunci (mendeteksi perubahan algoritma yang merusak save lama)', () => {
    expect(sequence(42, 3).map((x) => x.toFixed(10))).toMatchInlineSnapshot(`
      [
        "0.6011037519",
        "0.4482905590",
        "0.8524657935",
      ]
    `);
  });

  it('menulis state berikutnya ke holder', () => {
    const holder = { rngState: 7 };
    createRng(holder).float();
    expect(holder.rngState).toBe(nextFloat(7)[1]);
  });
});

describe('createRng — helper', () => {
  it('int inklusif di kedua ujung dan merata kasar', () => {
    const rng = createRng({ rngState: 1 });
    const counts = new Map<number, number>();
    for (let i = 0; i < 6000; i++) {
      const n = rng.int(1, 6);
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6]);
    for (const c of counts.values()) expect(c).toBeGreaterThan(800);
  });

  it('int menerima min > max', () => {
    const rng = createRng({ rngState: 5 });
    for (let i = 0; i < 100; i++) {
      const n = rng.int(3, 1);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it('chance(0) tidak pernah, chance(1) selalu', () => {
    const rng = createRng({ rngState: 9 });
    for (let i = 0; i < 200; i++) {
      expect(rng.chance(0)).toBe(false);
      expect(rng.chance(1)).toBe(true);
    }
  });

  it('pick: undefined untuk array kosong, selalu anggota untuk array berisi', () => {
    const rng = createRng({ rngState: 3 });
    expect(rng.pick<string>([])).toBeUndefined();
    for (let i = 0; i < 50; i++) expect(['a', 'b', 'c']).toContain(rng.pick(['a', 'b', 'c']));
  });

  it('weighted mengikuti bobot dan mengabaikan bobot ≤ 0', () => {
    const rng = createRng({ rngState: 11 });
    const counts = { common: 0, rare: 0, never: 0 };
    for (let i = 0; i < 10_000; i++) {
      const v = rng.weighted([
        { value: 'common' as const, weight: 9 },
        { value: 'rare' as const, weight: 1 },
        { value: 'never' as const, weight: 0 },
      ]);
      if (v) counts[v]++;
    }
    expect(counts.never).toBe(0);
    expect(counts.common / 10_000).toBeGreaterThan(0.85);
    expect(counts.rare / 10_000).toBeGreaterThan(0.07);
  });

  it('weighted undefined kalau total bobot 0', () => {
    expect(createRng({ rngState: 1 }).weighted([{ value: 'x', weight: 0 }])).toBeUndefined();
  });
});

describe('seed helper', () => {
  it('hashSeed stabil dan uint32', () => {
    expect(hashSeed('household-abc')).toBe(hashSeed('household-abc'));
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
    expect(hashSeed('x')).toBe(hashSeed('x') >>> 0);
  });

  it.each([
    [42, 42],
    [-1, 4294967295],
    [3.9, 3],
    [Number.NaN, 0],
  ])('normalizeSeed(%s) = %s', (input, expected) => {
    expect(normalizeSeed(input)).toBe(expected);
  });
});
