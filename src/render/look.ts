import { LinearFilter, LinearMipmapLinearFilter, type Texture } from 'three';
import { GRAPHICS, type Tier, type TierProfile } from '../config/graphics';

let tier: Tier = 'high';

export function setTier(next: Tier): void {
  tier = next;
}

export const currentTier = (): Tier => tier;
export const profile = (): TierProfile => GRAPHICS.tiers[tier];

export function filterTexture<T extends Texture>(texture: T, mipmaps = true): T {
  texture.magFilter = LinearFilter;
  texture.minFilter = mipmaps ? LinearMipmapLinearFilter : LinearFilter;
  texture.generateMipmaps = mipmaps;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
