export const TIERS = ['low', 'balanced', 'high'] as const;
export type Tier = (typeof TIERS)[number];

export interface TierProfile {
  maxDpr: number;
  shadowMap: number;
}

export const GRAPHICS = {
  tiers: {
    low: { maxDpr: 1, shadowMap: 1024 },
    balanced: { maxDpr: 1.5, shadowMap: 2048 },
    high: { maxDpr: 2, shadowMap: 2048 },
  } satisfies Record<Tier, TierProfile>,
  maxAspect: 640 / 240,
  storageKey: 'bb.graphics',
  dynamic: { window: 2, lowFps: 40, highFps: 56, step: 0.1, minScale: 0.6, cooldown: 3 },
  auto: { lowMemoryGb: 3, lowCores: 4 },
} as const;
