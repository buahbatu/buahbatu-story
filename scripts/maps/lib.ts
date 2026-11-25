import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const TERRAIN = {
  grass: 0,
  grass_flowers: 1,
  dirt: 2,
  path: 3,
  tilled: 4,
  sand: 5,
  water: 6,
  stone: 7,
  wood_floor: 8,
  cliff: 9,
  asphalt: 14,
  paving: 15,
  ceramic: 16,
  carpet: 17,
} as const;
export type Terrain = keyof typeof TERRAIN;
type Value = string | number | boolean;
type Props = Record<string, Value>;

const T = 16;
const HEIGHT_TILE = { 1: 10, 2: 11, 3: 12 } as const;
const FARM_TILE = 13;
const property = ([name, value]: [string, Value]) => ({
  name,
  type: typeof value === 'number' ? 'float' : typeof value === 'boolean' ? 'bool' : 'string',
  value,
});

export class MapBuilder {
  readonly ground: number[];
  readonly height: number[];
  readonly farm: number[];
  private readonly objects: object[] = [];
  private readonly collisions: object[] = [];
  private nextId = 1;
  private seed: number;
  readonly width: number;
  readonly heightTiles: number;
  private readonly settings: Props;

  constructor(width: number, heightTiles: number, seed: number, settings: Props = {}) {
    this.width = width;
    this.heightTiles = heightTiles;
    this.settings = settings;
    const size = width * heightTiles;
    this.ground = new Array<number>(size).fill(TERRAIN.grass + 1);
    this.height = new Array<number>(size).fill(0);
    this.farm = new Array<number>(size).fill(0);
    this.seed = seed;
  }

  rnd(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  private set(layer: number[], x: number, y: number, value: number): void {
    if (x >= 0 && y >= 0 && x < this.width && y < this.heightTiles) layer[y * this.width + x] = value;
  }

  paint(terrain: Terrain, x0: number, y0: number, w: number, h: number): this {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(this.ground, x, y, TERRAIN[terrain] + 1);
    return this;
  }

  sprinkle(terrain: Terrain, chance: number, only: Terrain = 'grass'): this {
    for (let i = 0; i < this.ground.length; i++)
      if (this.ground[i] === TERRAIN[only] + 1 && this.rnd() < chance) this.ground[i] = TERRAIN[terrain] + 1;
    return this;
  }

  ellipse(terrain: Terrain, cx: number, cy: number, rx: number, ry: number, rim?: Terrain): this {
    for (let y = 0; y < this.heightTiles; y++)
      for (let x = 0; x < this.width; x++) {
        const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
        if (d <= 1) this.set(this.ground, x, y, TERRAIN[terrain] + 1);
        else if (rim && d <= 1.6) this.set(this.ground, x, y, TERRAIN[rim] + 1);
      }
    return this;
  }

  raise(level: 1 | 2 | 3, x0: number, y0: number, w: number, h: number): this {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(this.height, x, y, HEIGHT_TILE[level] + 1);
    return this;
  }

  hill(cx: number, cy: number, rx: number, ry: number, height: number, flat?: number): this {
    return this.object('hill', cx - rx, cy - ry, flat === undefined ? { height } : { height, flat }, rx * 2, ry * 2);
  }

  farmland(x0: number, y0: number, w: number, h: number): this {
    this.paint('tilled', x0, y0, w, h);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(this.farm, x, y, FARM_TILE + 1);
    return this;
  }

  object(type: string, x: number, y: number, props: Props = {}, w = 0, h = 0, name = ''): this {
    this.objects.push({
      id: this.nextId++,
      name,
      type,
      x: x * T,
      y: y * T,
      width: w * T,
      height: h * T,
      rotation: 0,
      visible: true,
      ...(w === 0 && h === 0 ? { point: true } : {}),
      properties: Object.entries(props).map(property),
    });
    return this;
  }

  prop(model: string, x: number, y: number, props: Props = {}): this {
    return this.object('prop', x, y, { model, ...props });
  }

  exit(cx: number, wallY: number, targetArea: string, targetSpawn: string): this {
    return this.object('door', cx - 0.5, wallY - 0.5, { targetArea, targetSpawn }, 1, 0.5).prop('exit_door', cx, wallY);
  }

  block(x: number, y: number, w: number, h: number): this {
    this.collisions.push({
      id: this.nextId++,
      name: '',
      x: x * T,
      y: y * T,
      width: w * T,
      height: h * T,
      rotation: 0,
      visible: true,
      properties: [],
    });
    return this;
  }

  building(
    x: number,
    y: number,
    w: number,
    d: number,
    props: Props,
    door?: { targetArea: string; targetSpawn: string; doorX?: number },
  ): this {
    this.prop('building', x, y, { w, d, ...props });
    this.block(x - w / 2, y - d / 2, w, d);
    if (door)
      this.object('door', x - 0.5 + (door.doorX ?? 0), y + d / 2, { targetArea: door.targetArea, targetSpawn: door.targetSpawn }, 1, 0.5);
    return this;
  }

  tree(model: 'tree' | 'pine', x: number, y: number, scale = 1): this {
    this.prop(model, x, y, { scale });
    return this.block(x - 0.3, y - 0.3, 0.6, 0.6);
  }

  fence(x0: number, y0: number, x1: number, y1: number, style = 'wood'): this {
    const vertical = x0 === x1;
    const length = vertical ? y1 - y0 : x1 - x0;
    this.prop('fence', (x0 + x1) / 2, (y0 + y1) / 2, { length, style, rotation: vertical ? 90 : 0 });
    return vertical ? this.block(x0 - 0.15, y0, 0.3, length) : this.block(x0, y0 - 0.15, length, 0.3);
  }

  item(model: string, x: number, y: number, w: number, d: number, props: Props = {}): this {
    this.prop(model, x, y, props);
    return this.block(x - w / 2, y - d / 2, w, d);
  }

  solid(model: string, x: number, y: number, size: number, props: Props = {}): this {
    this.prop(model, x, y, props);
    return this.block(x - size / 2, y - size / 2, size, size);
  }

  toJSON(): object {
    const tileLayer = (id: number, name: string, data: number[]) => ({
      id,
      name,
      type: 'tilelayer',
      width: this.width,
      height: this.heightTiles,
      x: 0,
      y: 0,
      opacity: 1,
      visible: true,
      data,
    });
    const group = (id: number, name: string, objects: object[]) => ({
      id,
      name,
      type: 'objectgroup',
      draworder: 'topdown',
      x: 0,
      y: 0,
      opacity: 1,
      visible: true,
      objects,
    });
    const tiles = [
      ...Object.entries(TERRAIN).map(([terrain, id]) => ({ id, properties: [property(['terrain', terrain])] })),
      ...Object.entries(HEIGHT_TILE).map(([level, id]) => ({ id, properties: [{ name: 'height', type: 'int', value: Number(level) }] })),
      { id: FARM_TILE, properties: [property(['farmable', true])] },
    ].sort((a, b) => a.id - b.id);
    return {
      type: 'map',
      version: '1.10',
      tiledversion: '1.11.0',
      orientation: 'orthogonal',
      renderorder: 'right-down',
      infinite: false,
      compressionlevel: -1,
      width: this.width,
      height: this.heightTiles,
      tilewidth: T,
      tileheight: T,
      nextlayerid: 6,
      nextobjectid: this.nextId,
      properties: Object.entries(this.settings).map(property),
      layers: [
        tileLayer(1, 'Ground', this.ground),
        tileLayer(2, 'Height', this.height),
        tileLayer(3, 'Farmable', this.farm),
        group(4, 'Collision', this.collisions),
        group(5, 'Objects', this.objects),
      ],
      tilesets: [
        {
          firstgid: 1,
          name: 'ground',
          image: '../tilesets/ground.png',
          tilewidth: T,
          tileheight: T,
          columns: 8,
          tilecount: 24,
          imagewidth: 128,
          imageheight: 48,
          margin: 0,
          spacing: 0,
          tiles,
        },
      ],
    };
  }

  write(id: string): void {
    const file = join(import.meta.dirname, '..', '..', 'public', 'assets', 'maps', `${id}.tmj`);
    writeFileSync(file, JSON.stringify(this.toJSON(), null, 1) + '\n');
    console.log(`${id}.tmj ${String(this.width)}×${String(this.heightTiles)}, objek ${String(this.nextId - 1)}`);
  }
}
