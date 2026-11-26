export const TIERS = ['low', 'balanced', 'high'] as const;
export type Tier = (typeof TIERS)[number];

export interface FxProfile {
  ssao: 'off' | 'half' | 'full';
  tiltShift: boolean;
  multisampling: number;
}

export interface TierProfile {
  maxDpr: number;
  shadowMap: number;
  shadowRadius: number;
  fx: FxProfile;
}

export const GRAPHICS = {
  tiers: {
    low: { maxDpr: 1, shadowMap: 1024, shadowRadius: 2, fx: { ssao: 'off', tiltShift: false, multisampling: 2 } },
    balanced: { maxDpr: 1.5, shadowMap: 2048, shadowRadius: 3, fx: { ssao: 'half', tiltShift: true, multisampling: 4 } },
    high: { maxDpr: 2, shadowMap: 2048, shadowRadius: 4, fx: { ssao: 'full', tiltShift: true, multisampling: 4 } },
  } satisfies Record<Tier, TierProfile>,
  maxAspect: 640 / 240,
  storageKey: 'bb.graphics',
  dynamic: { window: 2, lowFps: 40, highFps: 56, step: 0.1, minScale: 0.6, cooldown: 3 },
  auto: { lowMemoryGb: 3, lowCores: 4 },
} as const;

export const FX = {
  ssao: { radius: 1.1, falloff: 0.8, intensity: 2.6, color: '#1c1830' },
  bloom: { threshold: 0.82, smoothing: 0.25, radius: 0.7 },
  tiltShift: { offset: 0, focusArea: 1, feather: 0.5 },
} as const;
