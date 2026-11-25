import { describe, expect, it } from 'vitest';
import type { AreaData, MapObject } from '../map/logic';
import { AREA_IDS } from '../../config/world';
import { destinationOf, doorById, edgeAt, enteredEdge, neighbours, placeKey } from './logic';

const obj = (id: number, kind: MapObject['kind'], x: number, y: number, w: number, h: number, props: MapObject['props']): MapObject => ({
  id,
  kind,
  name: '',
  x,
  y,
  w,
  h,
  props,
});
const area = (objects: MapObject[]): AreaData => ({
  id: 't',
  width: 10,
  height: 10,
  terrain: [],
  heights: [],
  farmable: [],
  collisions: [],
  objects,
  spawns: {},
  tileset: { image: '', columns: 1, rows: 1, terrainTiles: {} },
  settings: {},
});

const edge = obj(1, 'edge', 9.5, 4, 0.5, 2, { targetArea: 'dago', targetSpawn: 'dari_lembang' });
const door = obj(2, 'door', 3, 5, 1, 0.5, { targetArea: 'rumah', targetSpawn: 'pintu' });
const a = area([edge, door]);

describe('travel', () => {
  it('tujuan dari properti objek', () => {
    expect(destinationOf(edge)).toEqual({ objectId: 1, area: 'dago', spawn: 'dari_lembang' });
    expect(destinationOf(obj(3, 'edge', 0, 0, 1, 1, { targetArea: 'x' }))).toBeNull();
  });

  it('tepi peta terdeteksi saat pemain berdiri di dalamnya', () => {
    expect(edgeAt(a, 9.7, 5)?.area).toBe('dago');
    expect(edgeAt(a, 9.2, 5)).toBeNull();
  });

  it('tepi hanya memicu sekali saat baru masuk, tidak berulang selama masih di dalam', () => {
    const first = enteredEdge(a, 9.7, 5, null);
    expect(first.edge?.area).toBe('dago');
    expect(enteredEdge(a, 9.8, 5, first.inside).edge).toBeNull();
    const out = enteredEdge(a, 9, 5, first.inside);
    expect(out.inside).toBeNull();
    expect(enteredEdge(a, 9.7, 5, out.inside).edge?.area).toBe('dago');
  });

  it('pintu dicari dari id objek interaksi', () => {
    expect(doorById(a, 2)).toEqual({ objectId: 2, area: 'rumah', spawn: 'pintu' });
    expect(doorById(a, 1)).toBeNull();
  });
});

describe('nama tempat & tetangga', () => {
  it('setiap area punya nama tempat di i18n', () => {
    expect(AREA_IDS.filter((id) => placeKey(id) === null)).toEqual([]);
    expect(placeKey('rumah_michelle')).toBe('place.rumahMichelle');
    expect(placeKey('tidak_ada')).toBeNull();
  });

  it('tetangga = tujuan pintu & tepi yang unik, tanpa area sendiri', () => {
    const self = obj(3, 'door', 1, 1, 1, 1, { targetArea: 't', targetSpawn: 'x' });
    const twin = obj(4, 'edge', 0, 4, 0.5, 2, { targetArea: 'dago', targetSpawn: 'lain' });
    const spawn = obj(5, 'spawn', 2, 2, 0, 0, { targetArea: 'braga', targetSpawn: 'x' });
    expect(neighbours(area([edge, door, self, twin, spawn]))).toEqual(['dago', 'rumah']);
  });
});
