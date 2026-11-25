import { HEIGHT_STEP, WATER } from '../../config/world';
import { RAMP_DIRS, tileIndex, tileLevel, type AreaData, type MapObject, type RampDir } from '../map/logic';

export interface Waterfall {
  dir: RampDir;
  from: { x: number; z: number };
  to: { x: number; z: number };
  top: number;
  bottom: number;
  normal: { x: number; z: number };
}

type Surface = Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain'>;

const STEP: Record<RampDir, { x: number; z: number }> = { n: { x: 0, z: -1 }, s: { x: 0, z: 1 }, e: { x: 1, z: 0 }, w: { x: -1, z: 0 } };

const inside = (a: Surface, tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < a.width && ty < a.height;

export function isWaterTile(area: Surface, tx: number, ty: number): boolean {
  return inside(area, tx, ty) && area.terrain[tileIndex(area, tx, ty)] === 'water';
}

export function waterSurface(area: Surface, x: number, y: number): number {
  const tx = Math.min(area.width - 1, Math.max(0, Math.floor(x)));
  const ty = Math.min(area.height - 1, Math.max(0, Math.floor(y)));
  return (area.heights[tileIndex(area, tx, ty)] ?? 0) * HEIGHT_STEP + WATER.surface;
}

export function waterfallOf(area: Surface, o: Pick<MapObject, 'x' | 'y' | 'w' | 'h' | 'props'>): Waterfall | null {
  const dir = RAMP_DIRS.find((d) => d === o.props.dir);
  if (!dir) return null;
  const n = STEP[dir];
  const vertical = dir === 'n' || dir === 's';
  const edge = vertical ? (dir === 's' ? o.y + o.h : o.y) : dir === 'e' ? o.x + o.w : o.x;
  const from = vertical ? { x: o.x, z: edge } : { x: edge, z: o.y };
  const to = vertical ? { x: o.x + o.w, z: edge } : { x: edge, z: o.y + o.h };
  const mx = (from.x + to.x) / 2;
  const mz = (from.z + to.z) / 2;
  const up = { x: Math.floor(mx - n.x * 0.5), y: Math.floor(mz - n.z * 0.5) };
  const down = { x: Math.floor(mx + n.x * 0.5), y: Math.floor(mz + n.z * 0.5) };
  if (!isWaterTile(area, up.x, up.y) || !isWaterTile(area, down.x, down.y)) return null;
  const top = waterSurface(area, up.x + 0.5, up.y + 0.5);
  const bottom = waterSurface(area, down.x + 0.5, down.y + 0.5);
  if (top <= bottom) return null;
  return { dir, from, to, top, bottom, normal: n };
}

export const waterfallsOf = (area: Surface & Pick<AreaData, 'objects'>): Waterfall[] =>
  area.objects.flatMap((o) => {
    if (o.kind !== 'waterfall') return [];
    const w = waterfallOf(area, o);
    return w ? [w] : [];
  });

export function foamPuffs(count: number, time: number, radius: number): { x: number; z: number; s: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + time * 0.6;
    const r = radius * (0.45 + 0.35 * Math.abs(Math.sin(i * 1.7 + time * 2.1)));
    return { x: Math.cos(a) * r, z: Math.abs(Math.sin(a)) * r, s: 0.7 + 0.45 * Math.abs(Math.sin(time * 3 + i)) };
  });
}

export const ringPhase = (i: number, rings: number, time: number, life: number): number =>
  ((((time + (i * life) / rings) % life) + life) % life) / life;

export type Side = 'n' | 's' | 'e' | 'w';
export interface Exit {
  side: Side;
  from: number;
  to: number;
}
export interface Rect2 {
  x: number;
  z: number;
  w: number;
  d: number;
}

function runs(cells: boolean[]): [number, number][] {
  const out: [number, number][] = [];
  let start = -1;
  cells.forEach((on, i) => {
    if (on && start < 0) start = i;
    if (!on && start >= 0) {
      out.push([start, i]);
      start = -1;
    }
  });
  if (start >= 0) out.push([start, cells.length]);
  return out;
}

export function riverExits(area: Surface): Exit[] {
  const low = (tx: number, ty: number) => isWaterTile(area, tx, ty) && (area.heights[tileIndex(area, tx, ty)] ?? 0) === 0;
  const { width: W, height: H } = area;
  const row = (ty: number) => Array.from({ length: W }, (_, x) => low(x, ty));
  const col = (tx: number) => Array.from({ length: H }, (_, y) => low(tx, y));
  return [
    ...runs(row(0)).map(([from, to]) => ({ side: 'n' as const, from, to })),
    ...runs(row(H - 1)).map(([from, to]) => ({ side: 's' as const, from, to })),
    ...runs(col(0)).map(([from, to]) => ({ side: 'w' as const, from, to })),
    ...runs(col(W - 1)).map(([from, to]) => ({ side: 'e' as const, from, to })),
  ];
}

export function exitRect(e: Exit, area: Pick<AreaData, 'width' | 'height'>, margin: number): Rect2 {
  const span = e.to - e.from;
  switch (e.side) {
    case 'n':
      return { x: e.from, z: -margin, w: span, d: margin };
    case 's':
      return { x: e.from, z: area.height, w: span, d: margin };
    case 'w':
      return { x: -margin, z: e.from, w: margin, d: span };
    case 'e':
      return { x: area.width, z: e.from, w: margin, d: span };
  }
}

function cut(strip: Rect2, gaps: Rect2[], alongX: boolean): Rect2[] {
  const [a0, a1] = alongX ? [strip.x, strip.x + strip.w] : [strip.z, strip.z + strip.d];
  const holes = gaps
    .map((g): [number, number] => (alongX ? [g.x, g.x + g.w] : [g.z, g.z + g.d]))
    .filter(([s, e]) => e > a0 && s < a1)
    .sort((p, q) => p[0] - q[0]);
  const out: Rect2[] = [];
  let at = a0;
  const end: [number, number] = [a1, a1];
  for (const [s, e] of [...holes, end]) {
    if (s > at) out.push(alongX ? { ...strip, x: at, w: s - at } : { ...strip, z: at, d: s - at });
    at = Math.max(at, e);
  }
  return out;
}

export function skirtLayout(area: Surface, margin: number): { grass: Rect2[]; beds: Rect2[] } {
  const { width: W, height: H } = area;
  const beds = riverExits(area).map((e) => exitRect(e, area, margin));
  const of = (side: Side) => beds.filter((_, i) => riverExits(area)[i]?.side === side);
  const grass = [
    ...cut({ x: -margin, z: -margin, w: W + margin * 2, d: margin }, of('n'), true),
    ...cut({ x: -margin, z: H, w: W + margin * 2, d: margin }, of('s'), true),
    ...cut({ x: -margin, z: 0, w: margin, d: H }, of('w'), false),
    ...cut({ x: W, z: 0, w: margin, d: H }, of('e'), false),
  ];
  return { grass, beds };
}

export interface EdgeWall {
  side: Side;
  from: number;
  to: number;
  height: number;
}

export function edgeWalls(area: Surface): EdgeWall[] {
  const { width: W, height: H } = area;
  const out: EdgeWall[] = [];
  const scan = (side: Side, length: number, at: (i: number) => number) => {
    let start = 0;
    for (let i = 1; i <= length; i++) {
      const prev = at(start);
      if (i < length && at(i) === prev) continue;
      if (prev > 0) out.push({ side, from: start, to: i, height: prev });
      start = i;
    }
  };
  scan('n', W, (x) => tileLevel(area, x, 0));
  scan('s', W, (x) => tileLevel(area, x, H - 1));
  scan('w', H, (y) => tileLevel(area, 0, y));
  scan('e', H, (y) => tileLevel(area, W - 1, y));
  return out;
}
