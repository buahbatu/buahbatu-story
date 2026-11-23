export const PALETTE = {
  night: 0x1d1a2f,
  sky: 0x87b5d9,
  skyLight: 0xa7c9e2,
  horizon: 0xf3d3b0,
  hillFar: 0x5f9f6b,
  hillNear: 0x3f7a4f,
  soil: 0x7a5236,
  cream: 0xf4e9d1,
  strawberry: 0xd9465b,
  dusk: 0xf29e4c,
} as const;

export const css = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;
