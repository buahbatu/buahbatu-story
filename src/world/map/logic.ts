import { BRIDGE, HEIGHT_STEP, HILL, MAP_LAYERS, OBJECT_RULES, TILE_PX, WATER_DEPTH } from '../../config/world';
import { tiledMapSchema, type PropertyValue, type TiledMap, type TiledObject } from './schema';

export type ObjectKind = keyof typeof OBJECT_RULES;
export type Props = Record<string, PropertyValue>;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapObject extends Rect {
  id: number;
  kind: ObjectKind;
  name: string;
  props: Props;
}

export interface AreaData {
  id: string;
  width: number;
  height: number;
  terrain: string[];
  heights: number[];
  farmable: boolean[];
  collisions: Rect[];
  objects: MapObject[];
  spawns: Record<string, { x: number; y: number }>;
  tileset: { image: string; columns: number; rows: number; terrainTiles: Record<string, number> };
  settings: Props;
}

export interface ParseResult {
  area: AreaData | null;
  issues: string[];
}

const toProps = (list?: { name: string; value: PropertyValue }[]): Props => Object.fromEntries((list ?? []).map((p) => [p.name, p.value]));
const isKind = (kind: string): kind is ObjectKind => kind in OBJECT_RULES;

function tileProps(map: TiledMap): Map<number, Props> {
  const byGid = new Map<number, Props>();
  for (const set of map.tilesets) for (const tile of set.tiles ?? []) byGid.set(set.firstgid + tile.id, toProps(tile.properties));
  return byGid;
}

function toObject(o: TiledObject, issues: string[]): MapObject | null {
  const kind = o.type ?? o.class ?? '';
  if (!isKind(kind)) {
    issues.push(`objek #${o.id} tipe tidak dikenal: "${kind}"`);
    return null;
  }
  const props = toProps(o.properties);
  for (const key of OBJECT_RULES[kind])
    if (props[key] === undefined || props[key] === '') issues.push(`objek #${o.id} (${kind}) wajib punya properti "${key}"`);
  const rect = { x: o.x / TILE_PX, y: o.y / TILE_PX, w: o.width / TILE_PX, h: o.height / TILE_PX };
  return { id: o.id, kind, name: o.name, props, ...rect };
}

export function parseArea(id: string, input: unknown): ParseResult {
  const parsed = tiledMapSchema.safeParse(input);
  if (!parsed.success) return { area: null, issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  const map = parsed.data;
  const issues: string[] = [];
  const names = map.layers.map((l) => l.name);
  if (names.join() !== MAP_LAYERS.join()) issues.push(`urutan layer wajib ${MAP_LAYERS.join(' → ')}, dapat ${names.join(' → ')}`);
  const size = map.width * map.height;
  const tiles = (name: string) => {
    const layer = map.layers.find((l) => l.name === name);
    if (layer?.type !== 'tilelayer') return new Array<number>(size).fill(0);
    if (layer.data.length !== size) issues.push(`layer ${name} harus berisi ${size} tile, dapat ${layer.data.length}`);
    return layer.data;
  };
  const objects = (name: string) => {
    const layer = map.layers.find((l) => l.name === name);
    return layer?.type === 'objectgroup' ? layer.objects : [];
  };
  const props = tileProps(map);
  const terrain = tiles('Ground').map((gid, i) => {
    const t = props.get(gid)?.terrain;
    if (typeof t !== 'string') issues.push(`Ground tile ${i % map.width},${Math.floor(i / map.width)} tanpa properti "terrain"`);
    return typeof t === 'string' ? t : 'grass';
  });
  const heights = tiles('Height').map((gid) => Number(props.get(gid)?.height ?? 0));
  const farmable = tiles('Farmable').map((gid) => gid !== 0 && props.get(gid)?.farmable === true);
  const collisions = objects('Collision').map((o) => ({ x: o.x / TILE_PX, y: o.y / TILE_PX, w: o.width / TILE_PX, h: o.height / TILE_PX }));
  const parsedObjects = objects('Objects')
    .map((o) => toObject(o, issues))
    .filter((o): o is MapObject => o !== null);
  const spawns: AreaData['spawns'] = {};
  for (const o of parsedObjects.filter((x) => x.kind === 'spawn')) {
    const key = String(o.props.id);
    if (key in spawns) issues.push(`spawn "${key}" duplikat`);
    spawns[key] = { x: o.x + o.w / 2, y: o.y + o.h / 2 };
  }
  if (Object.keys(spawns).length === 0) issues.push('peta wajib punya minimal satu objek spawn');
  const set = map.tilesets[0];
  const terrainTiles: Record<string, number> = {};
  for (const tile of set?.tiles ?? []) {
    const t = toProps(tile.properties).terrain;
    if (typeof t === 'string') terrainTiles[t] = tile.id;
  }
  const area: AreaData = {
    id,
    width: map.width,
    height: map.height,
    terrain,
    heights,
    farmable,
    collisions,
    objects: parsedObjects,
    spawns,
    settings: toProps(map.properties),
    tileset: {
      image: set?.image ?? '',
      columns: set?.columns ?? 1,
      rows: Math.ceil((set?.imageheight ?? TILE_PX) / TILE_PX),
      terrainTiles,
    },
  };
  return { area: issues.length === 0 ? area : null, issues };
}

export const tileIndex = (area: Pick<AreaData, 'width'>, x: number, y: number): number => y * area.width + x;

type Surface = Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain' | 'objects'>;

export function tileLevel(area: Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain'>, tx: number, ty: number): number {
  const i = tileIndex(area, Math.min(area.width - 1, Math.max(0, tx)), Math.min(area.height - 1, Math.max(0, ty)));
  return (area.heights[i] ?? 0) * HEIGHT_STEP - (area.terrain[i] === 'water' ? WATER_DEPTH : 0);
}

export function hillShape(d: number, flat: number): number {
  if (d >= 1) return 0;
  const t = d <= flat ? 1 : (1 - d) / (1 - flat);
  return t * t * (3 - 2 * t);
}

const hillCache = new WeakMap<object, Float32Array>();

export function hillGrid(area: Surface): Float32Array {
  const cached = hillCache.get(area);
  if (cached) return cached;
  const W = area.width + 1;
  const grid = new Float32Array(W * (area.height + 1));
  for (const o of area.objects) {
    if (o.kind !== 'hill' || o.w <= 0 || o.h <= 0) continue;
    const height = Number(o.props.height);
    const flat = Number(o.props.flat ?? HILL.flat);
    const [cx, cy, rx, ry] = [o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2];
    for (let y = Math.max(0, Math.floor(o.y)); y <= Math.min(area.height, Math.ceil(o.y + o.h)); y++)
      for (let x = Math.max(0, Math.floor(o.x)); x <= Math.min(area.width, Math.ceil(o.x + o.w)); x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        grid[y * W + x] = (grid[y * W + x] ?? 0) + height * hillShape(d, flat);
      }
  }
  hillCache.set(area, grid);
  return grid;
}

export const cornerHill = (area: Surface, cx: number, cy: number): number => hillGrid(area)[cy * (area.width + 1) + cx] ?? 0;

export function hillAt(area: Surface, x: number, y: number): number {
  const tx = Math.min(area.width - 1, Math.max(0, Math.floor(x)));
  const ty = Math.min(area.height - 1, Math.max(0, Math.floor(y)));
  const u = Math.min(1, Math.max(0, x - tx));
  const v = Math.min(1, Math.max(0, y - ty));
  const a = cornerHill(area, tx, ty);
  const b = cornerHill(area, tx, ty + 1);
  const c = cornerHill(area, tx + 1, ty + 1);
  const d = cornerHill(area, tx + 1, ty);
  return v >= u ? a + (c - b) * u + (b - a) * v : a + (d - a) * u + (c - d) * v;
}

export function elevation(area: Surface, x: number, y: number): number {
  return tileLevel(area, Math.floor(x), Math.floor(y)) + hillAt(area, x, y);
}

export function isBlocked(area: AreaData, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= area.width || y >= area.height) return true;
  if (area.terrain[tileIndex(area, Math.floor(x), Math.floor(y))] === 'water') return true;
  return area.collisions.some((r) => inside(r, x, y));
}

export function doorTargets(area: AreaData): string[] {
  return [...new Set(area.objects.filter((o) => o.kind === 'door' || o.kind === 'edge').map((o) => String(o.props.targetArea)))];
}

export const RAMP_DIRS = ['n', 's', 'e', 'w'] as const;
export type RampDir = (typeof RAMP_DIRS)[number];
export interface Ramp extends Rect {
  dir: RampDir;
  base: number;
  rise: number;
}

const rampCache = new WeakMap<AreaData, Ramp[]>();
const UP: Record<RampDir, [number, number]> = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

export function rampsOf(area: AreaData): Ramp[] {
  const cached = rampCache.get(area);
  if (cached) return cached;
  const ramps = area.objects
    .filter((o) => o.kind === 'prop' && o.props.model === 'stairs')
    .map((o) => {
      const w = Number(o.props.w ?? 1);
      const h = Number(o.props.d ?? 1);
      const dir = RAMP_DIRS.find((d) => d === o.props.dir) ?? 'n';
      const [ux, uy] = UP[dir];
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;
      const base = elevation(area, cx - (ux * w) / 2 + ux * 0.01, cy - (uy * h) / 2 + uy * 0.01);
      return { x: cx - w / 2, y: cy - h / 2, w, h, dir, base, rise: Number(o.props.rise ?? 1) * HEIGHT_STEP };
    });
  rampCache.set(area, ramps);
  return ramps;
}

export function rampProgress(r: Ramp, x: number, y: number): number {
  const t = { n: (r.y + r.h - y) / r.h, s: (y - r.y) / r.h, e: (x - r.x) / r.w, w: (r.x + r.w - x) / r.w }[r.dir];
  return Math.min(1, Math.max(0, t));
}

const inside = (r: Rect, x: number, y: number) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export interface Bridge extends Rect {
  along: 'x' | 'y';
  deck: number;
  style: string;
}

const bridgeCache = new WeakMap<AreaData, Bridge[]>();

export function bridgesOf(area: AreaData): Bridge[] {
  const cached = bridgeCache.get(area);
  if (cached) return cached;
  const bridges = area.objects
    .filter((o) => o.kind === 'bridge')
    .map((o) => {
      const along = o.w >= o.h ? 'x' : 'y';
      const [ax, ay, bx, by] =
        along === 'x'
          ? [o.x - 0.5, o.y + o.h / 2, o.x + o.w + 0.5, o.y + o.h / 2]
          : [o.x + o.w / 2, o.y - 0.5, o.x + o.w / 2, o.y + o.h + 0.5];
      const deck = Math.max(elevation(area, ax, ay), elevation(area, bx, by)) + BRIDGE.deck;
      return { x: o.x, y: o.y, w: o.w, h: o.h, along, deck, style: String(o.props.style ?? 'wood') } as const;
    });
  bridgeCache.set(area, bridges);
  return bridges;
}

export const bridgeAt = (area: AreaData, x: number, y: number): Bridge | null => bridgesOf(area).find((b) => inside(b, x, y)) ?? null;

export function standHeight(area: AreaData, x: number, y: number): number {
  const bridge = bridgeAt(area, x, y);
  if (bridge) return bridge.deck;
  const ramp = rampsOf(area).find((r) => inside(r, x, y));
  return ramp ? ramp.base + rampProgress(ramp, x, y) * ramp.rise : elevation(area, x, y);
}

export interface Body {
  radius: number;
  maxStep: number;
  shallowTiles: number;
}

export type WaterDepth = 'none' | 'shallow' | 'deep';
const shoreCache = new WeakMap<AreaData, number[]>();

export function shoreDistance(area: AreaData): number[] {
  const cached = shoreCache.get(area);
  if (cached) return cached;
  const dist = area.terrain.map((t) => (t === 'water' ? Infinity : 0));
  const queue: number[] = [];
  dist.forEach((d, i) => {
    if (d === 0) queue.push(i);
  });
  for (const i of queue) {
    const x = i % area.width;
    const y = Math.floor(i / area.width);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= area.width || ny >= area.height) continue;
        const j = tileIndex(area, nx, ny);
        if ((dist[j] ?? 0) > (dist[i] ?? 0) + 1) {
          dist[j] = (dist[i] ?? 0) + 1;
          queue.push(j);
        }
      }
  }
  shoreCache.set(area, dist);
  return dist;
}

export function waterAt(area: AreaData, x: number, y: number, shallowTiles: number): WaterDepth {
  if (x < 0 || y < 0 || x >= area.width || y >= area.height) return 'none';
  const d = shoreDistance(area)[tileIndex(area, Math.floor(x), Math.floor(y))] ?? 0;
  return d === 0 ? 'none' : d <= shallowTiles ? 'shallow' : 'deep';
}

export function walkLevel(area: AreaData, x: number, y: number): number {
  const bridge = bridgeAt(area, x, y);
  if (bridge) return bridge.deck;
  const lowered = area.terrain[tileIndex(area, Math.floor(x), Math.floor(y))] === 'water' ? WATER_DEPTH : 0;
  return standHeight(area, x, y) + (x >= 0 && y >= 0 && x < area.width && y < area.height ? lowered : 0);
}

export function bodyBlocked(area: AreaData, x: number, y: number, from: number, body: Body): boolean {
  const r = body.radius;
  if (x - r < 0 || y - r < 0 || x + r > area.width || y + r > area.height) return true;
  const here = walkLevel(area, x, y);
  if (Math.abs(here - from) > body.maxStep) return true;
  const shore = shoreDistance(area);
  if (!bridgeAt(area, x, y))
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r - 1e-6); ty++)
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r - 1e-6); tx++)
        if ((shore[tileIndex(area, tx, ty)] ?? 0) > body.shallowTiles) return true;
  for (const [dx, dy] of [
    [-r, -r],
    [r, -r],
    [-r, r],
    [r, r],
  ] as const)
    if (Math.abs(walkLevel(area, x + dx, y + dy) - here) > body.maxStep) return true;
  return area.collisions.some((c) => x + r > c.x && x - r < c.x + c.w && y + r > c.y && y - r < c.y + c.h);
}
