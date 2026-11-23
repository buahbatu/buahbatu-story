import { HEIGHT_STEP, MAP_LAYERS, OBJECT_RULES, TILE_PX, WATER_DEPTH } from '../../config/world';
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

export function elevation(area: Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain'>, x: number, y: number): number {
  const tx = Math.min(area.width - 1, Math.max(0, Math.floor(x)));
  const ty = Math.min(area.height - 1, Math.max(0, Math.floor(y)));
  const i = tileIndex(area, tx, ty);
  return (area.heights[i] ?? 0) * HEIGHT_STEP - (area.terrain[i] === 'water' ? WATER_DEPTH : 0);
}

export function isBlocked(area: AreaData, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= area.width || y >= area.height) return true;
  if (area.terrain[tileIndex(area, Math.floor(x), Math.floor(y))] === 'water') return true;
  return area.collisions.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

export function doorTargets(area: AreaData): string[] {
  return [...new Set(area.objects.filter((o) => o.kind === 'door' || o.kind === 'edge').map((o) => String(o.props.targetArea)))];
}
