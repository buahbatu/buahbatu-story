export const TILE_SIZE = 32;

export const DEPTH = {
  ground: 0,
  decor: 10,
  entities: 20,
  above: 30,
  weather: 40,
  lighting: 50,
} as const;

export type DepthLayer = keyof typeof DEPTH;
