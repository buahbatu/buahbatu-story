import { describe, expect, it } from 'vitest';
import { doorTargets, isBlocked, parseArea } from './logic';

const W = 4;
const H = 3;
const prop = (name: string, value: string | number | boolean) => ({ name, value });
const tileset = {
  firstgid: 1,
  name: 'ground',
  image: '../tilesets/ground.png',
  tilewidth: 16,
  tileheight: 16,
  columns: 4,
  tilecount: 8,
  imagewidth: 64,
  imageheight: 32,
  tiles: [
    { id: 0, properties: [prop('terrain', 'grass')] },
    { id: 1, properties: [prop('terrain', 'water')] },
    { id: 4, properties: [prop('height', 1)] },
    { id: 5, properties: [prop('farmable', true)] },
  ],
};
const object = (id: number, type: string, props: Record<string, string>, x = 16, y = 16, width = 0, height = 0) => ({
  id,
  name: '',
  type,
  x,
  y,
  width,
  height,
  properties: Object.entries(props).map(([n, v]) => prop(n, v)),
});

function makeMap(overrides: { ground?: number[]; objects?: unknown[]; layers?: string[] } = {}) {
  const fill = (gid: number) => new Array<number>(W * H).fill(gid);
  const tile = (name: string, data: number[]) => ({ type: 'tilelayer', name, width: W, height: H, data });
  const layers = {
    Ground: tile('Ground', overrides.ground ?? fill(1)),
    Height: tile('Height', [0, 0, 0, 5, ...fill(0).slice(4)]),
    Farmable: tile('Farmable', [6, 6, 0, 0, ...fill(0).slice(4)]),
    Collision: { type: 'objectgroup', name: 'Collision', objects: [object(9, '', {}, 32, 0, 16, 32)] },
    Objects: {
      type: 'objectgroup',
      name: 'Objects',
      objects: overrides.objects ?? [object(1, 'spawn', { id: 'start' }), object(2, 'door', { targetArea: 'kos_a', targetSpawn: 'pintu' })],
    },
  } as const;
  const order = (overrides.layers ?? ['Ground', 'Height', 'Farmable', 'Collision', 'Objects']) as (keyof typeof layers)[];
  return {
    type: 'map',
    orientation: 'orthogonal',
    infinite: false,
    width: W,
    height: H,
    tilewidth: 16,
    tileheight: 16,
    layers: order.map((n) => layers[n]),
    tilesets: [tileset],
  };
}

describe('parseArea', () => {
  it('membaca terrain, ketinggian, tanah garapan, tabrakan, objek & spawn (satuan tile)', () => {
    const { area, issues } = parseArea('sandbox', makeMap());
    expect(issues).toEqual([]);
    expect(area).toMatchObject({ id: 'sandbox', width: 4, height: 3, spawns: { start: { x: 1, y: 1 } } });
    expect(area?.terrain.every((t) => t === 'grass')).toBe(true);
    expect(area?.heights.slice(0, 4)).toEqual([0, 0, 0, 1]);
    expect(area?.farmable.slice(0, 4)).toEqual([true, true, false, false]);
    expect(area?.collisions).toEqual([{ x: 2, y: 0, w: 1, h: 2 }]);
    expect(area?.tileset.terrainTiles).toEqual({ grass: 0, water: 1 });
  });
  it('farmable hanya kalau tile punya properti farmable=true', () => {
    const map = makeMap();
    const farm = map.layers[2] as { data: number[] };
    farm.data = [6, 6, 1, 0, ...new Array<number>(8).fill(0)];
    expect(parseArea('a', map).area?.farmable.slice(0, 4)).toEqual([true, true, false, false]);
  });
  it('menolak urutan layer yang salah', () => {
    const { area, issues } = parseArea('a', makeMap({ layers: ['Ground', 'Farmable', 'Height', 'Collision', 'Objects'] }));
    expect(area).toBeNull();
    expect(issues.join()).toContain('urutan layer wajib');
  });
  it('menolak Ground tanpa properti terrain', () => {
    expect(parseArea('a', makeMap({ ground: new Array<number>(W * H).fill(5) })).issues.join()).toContain('tanpa properti "terrain"');
  });
  it('menolak objek tipe tak dikenal & properti wajib yang hilang', () => {
    const { issues } = parseArea(
      'a',
      makeMap({ objects: [object(1, 'spawn', { id: 'start' }), object(2, 'teleporter', {}), object(3, 'door', { targetArea: 'x' })] }),
    );
    expect(issues).toEqual(['objek #2 tipe tidak dikenal: "teleporter"', 'objek #3 (door) wajib punya properti "targetSpawn"']);
  });
  it('wajib punya spawn & tidak boleh duplikat', () => {
    expect(parseArea('a', makeMap({ objects: [] })).issues).toContain('peta wajib punya minimal satu objek spawn');
    const dup = [object(1, 'spawn', { id: 'start' }), object(2, 'spawn', { id: 'start' })];
    expect(parseArea('a', makeMap({ objects: dup })).issues).toContain('spawn "start" duplikat');
  });
  it('menolak ukuran tile selain 16px & format bukan peta Tiled', () => {
    expect(parseArea('a', { ...makeMap(), tilewidth: 32 }).area).toBeNull();
    expect(parseArea('a', { hello: 'world' }).area).toBeNull();
  });
});

describe('helper area', () => {
  const area = (() => {
    const map = makeMap({ ground: [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1] });
    const result = parseArea('a', map).area;
    if (!result) throw new Error('fixture tidak valid');
    return result;
  })();
  it.each([
    [0.5, 0.5, false],
    [1.5, 1.5, true],
    [2.5, 0.5, true],
    [-0.1, 1, true],
    [4, 1, true],
    [3.5, 2.5, false],
  ])('isBlocked(%s, %s) = %s (air, tabrakan, tepi peta)', (x, y, blocked) => {
    expect(isBlocked(area, x, y)).toBe(blocked);
  });
  it('doorTargets mendaftar area tujuan unik', () => {
    expect(doorTargets(area)).toEqual(['kos_a']);
  });
});
