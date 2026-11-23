// Konstanta teknis lintas sistem (bukan angka balancing; itu di balance.ts).
// Desain: docs/02-arsitektur.md §8, ADR-004 (LPC 32px)

/** Ukuran satu tile dunia dalam pixel. */
export const TILE_SIZE = 32;

/** Urutan gambar. Entity di-sort berdasarkan Y di dalam lapisan `entities`. */
export const DEPTH = {
  ground: 0,
  decor: 10,
  entities: 20,
  above: 30,
  weather: 40,
  lighting: 50,
} as const;

export type DepthLayer = keyof typeof DEPTH;
