import { GRAPHICS } from '../config/graphics';
import { setDynamicScale, refreshView } from '../config/game';
import type { Engine } from '../engine/engine';
import { setTier } from './look';
import { DynamicResolution, chooseTier } from './quality';

function readStored(): string | null {
  try {
    return localStorage.getItem(GRAPHICS.storageKey);
  } catch {
    return null;
  }
}

export function initGraphics(): { forced: boolean } {
  const stored = readStored();
  const nav = navigator as Navigator & { deviceMemory?: number };
  const steady = import.meta.env.MODE === 'test';
  const { tier, forced } = chooseTier(new URLSearchParams(location.search).get('gfx'), steady ? null : stored, {
    coarse: window.matchMedia('(pointer: coarse)').matches,
    memoryGb: steady ? undefined : nav.deviceMemory,
    cores: steady ? undefined : nav.hardwareConcurrency || undefined,
  });
  setTier(tier);
  document.documentElement.dataset.gfx = tier;
  return { forced };
}

export function watchFrameRate(engine: Engine, forced: boolean): void {
  if (forced || import.meta.env.MODE === 'test') return;
  const dynamic = new DynamicResolution();
  engine.onFrame = (dt) => {
    if (!dynamic.push(dt)) return;
    setDynamicScale(dynamic.scale);
    refreshView();
  };
}
