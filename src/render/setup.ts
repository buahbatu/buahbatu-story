import { GRAPHICS, type Tier } from '../config/graphics';
import { setDynamicScale, refreshView } from '../config/game';
import type { Engine } from '../engine/engine';
import { worldCurve } from './curve';
import { setTier } from './look';
import { parseHour } from './lighting/logic';
import { DynamicResolution, type DeviceInfo } from './quality';
import { parseStored, resolveGraphics, serialize, tierOf, type GraphicsSettings } from './settings';

function readStored(): string | null {
  try {
    return localStorage.getItem(GRAPHICS.storageKey);
  } catch {
    return null;
  }
}

function writeStored(value: string): void {
  try {
    localStorage.setItem(GRAPHICS.storageKey, value);
  } catch {
    return;
  }
}

export interface ProfileTarget {
  applyProfile(): void;
}

export class GraphicsRuntime {
  readonly hour: number | null;
  private current: GraphicsSettings;
  private tierValue: Tier;
  private engine: Engine | null = null;
  private readonly targets: ProfileTarget[] = [];
  private readonly device: DeviceInfo;
  private readonly steady: boolean;
  private dynamic = new DynamicResolution();

  constructor() {
    const params = new URLSearchParams(location.search);
    const nav = navigator as Navigator & { deviceMemory?: number };
    this.steady = import.meta.env.MODE === 'test';
    this.device = {
      coarse: window.matchMedia('(pointer: coarse)').matches,
      memoryGb: this.steady ? undefined : nav.deviceMemory,
      cores: this.steady ? undefined : nav.hardwareConcurrency || undefined,
    };
    const resolved = resolveGraphics(
      { gfx: params.get('gfx'), fx: params.get('fx'), curve: params.get('curve') },
      parseStored(readStored()),
      this.device,
      this.steady,
    );
    this.current = resolved.settings;
    this.tierValue = resolved.tier;
    this.hour = parseHour(params.get('hour'));
    setTier(this.tierValue);
    document.documentElement.dataset.gfx = this.tierValue;
    worldCurve.setMode(GRAPHICS.curve.bend[this.current.curve]);
    worldCurve.setFlat(false, true);
  }

  get settings(): GraphicsSettings {
    return this.current;
  }

  get tier(): Tier {
    return this.tierValue;
  }

  attach(engine: Engine, targets: ProfileTarget[]): void {
    this.engine = engine;
    this.targets.push(...targets);
    engine.fx = this.current.fx;
    engine.onFrame = (dt) => {
      if (this.current.tier !== 'auto' || this.steady || !this.dynamic.push(dt)) return;
      setDynamicScale(this.dynamic.scale);
      refreshView();
    };
  }

  update(next: GraphicsSettings): void {
    const before = this.current;
    this.current = next;
    writeStored(serialize(next));
    if (next.curve !== before.curve) worldCurve.setMode(GRAPHICS.curve.bend[next.curve]);
    const tier = tierOf(next.tier, this.device);
    if (tier !== this.tierValue) {
      this.tierValue = tier;
      setTier(tier);
      document.documentElement.dataset.gfx = tier;
      this.dynamic = new DynamicResolution();
      setDynamicScale(1);
      for (const target of this.targets) target.applyProfile();
      this.engine?.rebuildFx();
      refreshView();
    }
    if (this.engine) this.engine.fx = next.fx;
  }
}
