import { CURVES, GRAPHICS, type Curve, type Tier } from '../config/graphics';
import { autoTier, chooseFx, isTier, type DeviceInfo } from './quality';

export type TierChoice = Tier | 'auto';

export interface GraphicsSettings {
  tier: TierChoice;
  fx: boolean;
  curve: Curve;
}

export interface ResolvedGraphics {
  settings: GraphicsSettings;
  tier: Tier;
  forced: boolean;
}

export const isCurve = (value: unknown): value is Curve => typeof value === 'string' && (CURVES as readonly string[]).includes(value);
export const isTierChoice = (value: unknown): value is TierChoice => value === 'auto' || isTier(value);

export function parseStored(raw: string | null): Partial<GraphicsSettings> {
  if (raw === null) return {};
  if (isTier(raw)) return { tier: raw };
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return {};
    const { tier, fx, curve } = data as Record<string, unknown>;
    return {
      ...(isTierChoice(tier) ? { tier } : {}),
      ...(typeof fx === 'boolean' ? { fx } : {}),
      ...(isCurve(curve) ? { curve } : {}),
    };
  } catch {
    return {};
  }
}

export const serialize = (settings: GraphicsSettings): string => JSON.stringify(settings);

export function tierOf(choice: TierChoice, device: DeviceInfo): Tier {
  return choice === 'auto' ? autoTier(device) : choice;
}

export function resolveGraphics(
  params: { gfx: string | null; fx: string | null; curve: string | null },
  stored: Partial<GraphicsSettings>,
  device: DeviceInfo,
  steady: boolean,
): ResolvedGraphics {
  const tierChoice: TierChoice = isTier(params.gfx) ? params.gfx : (stored.tier ?? 'auto');
  const fx = params.fx === 'on' || params.fx === 'off' ? chooseFx(params.fx, steady) : (stored.fx ?? chooseFx(null, steady));
  const curve: Curve = isCurve(params.curve) ? params.curve : (stored.curve ?? GRAPHICS.curve.default);
  return {
    settings: { tier: tierChoice, fx, curve },
    tier: tierOf(tierChoice, device),
    forced: tierChoice !== 'auto',
  };
}

export function bendAt(dx: number, dz: number, dir: { x: number; z: number }, bend: number, side: number): number {
  const along = dx * dir.x + dz * dir.z;
  const across = dx * dir.z - dz * dir.x;
  return bend * (along * along + side * across * across);
}
