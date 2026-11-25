import { GRAPHICS, TIERS, type Tier } from '../config/graphics';

export interface DeviceInfo {
  coarse: boolean;
  memoryGb?: number;
  cores?: number;
}

export const isTier = (value: unknown): value is Tier => typeof value === 'string' && (TIERS as readonly string[]).includes(value);

export function autoTier(d: DeviceInfo): Tier {
  const weak =
    (d.memoryGb !== undefined && d.memoryGb < GRAPHICS.auto.lowMemoryGb) || (d.cores !== undefined && d.cores < GRAPHICS.auto.lowCores);
  if (weak) return 'low';
  return d.coarse ? 'balanced' : 'high';
}

export function chooseTier(param: string | null, stored: string | null, device: DeviceInfo): { tier: Tier; forced: boolean } {
  if (isTier(param)) return { tier: param, forced: true };
  if (isTier(stored)) return { tier: stored, forced: true };
  return { tier: autoTier(device), forced: false };
}

export interface DynamicRules {
  window: number;
  lowFps: number;
  highFps: number;
  step: number;
  minScale: number;
  cooldown: number;
}

export class DynamicResolution {
  scale = 1;
  private frames = 0;
  private elapsed = 0;
  private wait = 0;
  private readonly rules: DynamicRules;

  constructor(rules: DynamicRules = GRAPHICS.dynamic) {
    this.rules = rules;
  }

  push(dt: number): boolean {
    if (dt <= 0) return false;
    this.wait = Math.max(0, this.wait - dt);
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed < this.rules.window) return false;
    const fps = this.frames / this.elapsed;
    this.frames = 0;
    this.elapsed = 0;
    if (this.wait > 0) return false;
    const next =
      fps < this.rules.lowFps
        ? Math.max(this.rules.minScale, this.scale - this.rules.step)
        : fps > this.rules.highFps
          ? Math.min(1, this.scale + this.rules.step)
          : this.scale;
    if (Math.abs(next - this.scale) < 1e-6) return false;
    this.scale = Math.round(next * 100) / 100;
    this.wait = this.rules.cooldown;
    return true;
  }
}
