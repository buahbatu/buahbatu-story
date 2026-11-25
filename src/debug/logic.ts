import { HEIGHT_STEP } from '../config/world';
import { cornerHill, elevation, rampsOf, shoreDistance, tileIndex, type AreaData, type Body } from '../world/map/logic';

export type Segment = readonly [number, number, number, number, number, number];

export const debugRequested = (search: string, allowed: boolean): boolean => allowed && new URLSearchParams(search).get('debug') === '1';

export class FpsMeter {
  private samples: number[] = [];
  private total = 0;
  private readonly window: number;

  constructor(window: number) {
    this.window = window;
  }

  push(dt: number): void {
    if (dt <= 0) return;
    this.samples.push(dt);
    this.total += dt;
    while (this.samples.length > 1 && this.total - (this.samples[0] ?? 0) >= this.window) this.total -= this.samples.shift() ?? 0;
  }

  read(): { fps: number; ms: number } {
    if (this.samples.length === 0 || this.total <= 0) return { fps: 0, ms: 0 };
    const avg = this.total / this.samples.length;
    return { fps: Math.round(1 / avg), ms: Math.round(avg * 10000) / 10 };
  }
}

export function gridSegments(area: AreaData, lift: number): Segment[] {
  const out: Segment[] = [];
  const e = 1e-6;
  const at = (x: number, y: number, tx: number, ty: number) => elevation(area, Math.min(x, tx + 1 - e), Math.min(y, ty + 1 - e)) + lift;
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      const a = at(x, y, x, y);
      out.push([x, a, y, x + 1, at(x + 1, y, x, y), y], [x, a, y, x, at(x, y + 1, x, y), y + 1]);
      if (x === area.width - 1) out.push([x + 1, at(x + 1, y, x, y), y, x + 1, at(x + 1, y + 1, x, y), y + 1]);
      if (y === area.height - 1) out.push([x, at(x, y + 1, x, y), y + 1, x + 1, at(x + 1, y + 1, x, y), y + 1]);
    }
  return out;
}

export function cliffSegments(area: AreaData, maxStep: number, lift: number): Segment[] {
  const ramps = rampsOf(area);
  const level = (x: number, y: number) => (area.heights[tileIndex(area, x, y)] ?? 0) * HEIGHT_STEP;
  const onRamp = (x: number, y: number) => ramps.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  const out: Segment[] = [];
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      const h = level(x, y);
      if (x + 1 < area.width) {
        const top = Math.max(h, level(x + 1, y)) + lift;
        if (Math.abs(level(x + 1, y) - h) > maxStep && !onRamp(x + 1, y + 0.5))
          out.push([x + 1, top + cornerHill(area, x + 1, y), y, x + 1, top + cornerHill(area, x + 1, y + 1), y + 1]);
      }
      if (y + 1 < area.height) {
        const top = Math.max(h, level(x, y + 1)) + lift;
        if (Math.abs(level(x, y + 1) - h) > maxStep && !onRamp(x + 0.5, y + 1))
          out.push([x, top + cornerHill(area, x, y + 1), y + 1, x + 1, top + cornerHill(area, x + 1, y + 1), y + 1]);
      }
    }
  return out;
}

export function deepTiles(area: AreaData, body: Pick<Body, 'shallowTiles'>): { x: number; y: number }[] {
  const shore = shoreDistance(area);
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) if ((shore[tileIndex(area, x, y)] ?? 0) > body.shallowTiles) out.push({ x, y });
  return out;
}

export function boxSegments(x: number, z: number, w: number, d: number, y0: number, y1: number): Segment[] {
  const c = [
    [x, z],
    [x + w, z],
    [x + w, z + d],
    [x, z + d],
  ] as const;
  const out: Segment[] = [];
  c.forEach(([ax, az], i) => {
    const [bx, bz] = c[(i + 1) % 4] ?? c[0];
    out.push([ax, y0, az, bx, y0, bz], [ax, y1, az, bx, y1, bz], [ax, y0, az, ax, y1, az]);
  });
  return out;
}
