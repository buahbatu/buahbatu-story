import { GRAPHICS } from '../config/graphics';
import { setDynamicScale, refreshView } from '../config/game';
import type { Engine } from '../engine/engine';
import { setTier } from './look';
import { parseHour } from './lighting/logic';
import { DynamicResolution, chooseTier, chooseFx } from './quality';

function readStored(): string | null {
  try {
    return localStorage.getItem(GRAPHICS.storageKey);
  } catch {
    return null;
  }
}

export interface GraphicsChoice {
  forced: boolean;
  fx: boolean;
  hour: number | null;
}

export function initGraphics(): GraphicsChoice {
  const stored = readStored();
  const params = new URLSearchParams(location.search);
  const nav = navigator as Navigator & { deviceMemory?: number };
  const steady = import.meta.env.MODE === 'test';
  const { tier, forced } = chooseTier(params.get('gfx'), steady ? null : stored, {
    coarse: window.matchMedia('(pointer: coarse)').matches,
    memoryGb: steady ? undefined : nav.deviceMemory,
    cores: steady ? undefined : nav.hardwareConcurrency || undefined,
  });
  setTier(tier);
  document.documentElement.dataset.gfx = tier;
  return { forced, fx: chooseFx(params.get('fx'), steady), hour: parseHour(params.get('hour')) };
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
