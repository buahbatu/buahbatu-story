import { describe, expect, it } from 'vitest';
import { INTERACTION } from '../../config/world';
import { t } from '../../content/i18n';
import type { AreaData, MapObject } from '../map/logic';
import { dialogFor, keyLabel, nearestInteractable, promptFor, rectDistance } from './logic';

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

const area = (objects: MapObject[], interior = false): AreaData => ({
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
  settings: interior ? { interior: true } : {},
});

const bed = obj(1, 'interact', 1, 1, 1.3, 2.1, { action: 'bed' });
const bin = obj(2, 'interact', 4, 1, 1, 1, { action: 'shipping_bin' });
const door = obj(3, 'door', 3, 5.5, 1, 0.5, { targetArea: 'dago', targetSpawn: 'x' });

describe('promptFor', () => {
  it('memetakan aksi ke teks prompt, pintu Masuk/Keluar sesuai dalam/luar ruangan', () => {
    expect(promptFor(bed, true)).toBe('prompt.sleep');
    expect(promptFor(obj(9, 'interact', 0, 0, 1, 1, { action: 'board:kebun_warga' }), false)).toBe('prompt.read');
    expect(promptFor(obj(9, 'interact', 0, 0, 1, 1, { action: 'shop:seed_shop' }), false)).toBe('prompt.shop');
    expect(promptFor(obj(9, 'interact', 0, 0, 1, 1, { action: 'aneh' }), false)).toBe('prompt.use');
    expect(promptFor(door, true)).toBe('prompt.exit');
    expect(promptFor(door, false)).toBe('prompt.enter');
    expect(t(promptFor(bed, true))).toBe('Tidur');
  });
});

describe('nearestInteractable', () => {
  it('kosong kalau tidak ada objek dalam jangkauan', () => {
    expect(nearestInteractable(area([bed, bin, door]), { x: 7, y: 8, facing: 's' }, INTERACTION)).toBeNull();
  });

  it('memilih objek terdekat dalam jangkauan', () => {
    expect(nearestInteractable(area([bed, bin, door], true), { x: 3.5, y: 5, facing: 's' }, INTERACTION)).toMatchObject({
      id: 3,
      kind: 'door',
      prompt: 'prompt.exit',
      x: 3.5,
      y: 5.75,
    });
  });

  it('kalau dua objek sama dekat, yang di depan pemain menang', () => {
    const a = obj(10, 'interact', 2, 2, 1, 1, { action: 'bed' });
    const b = obj(11, 'interact', 4, 2, 1, 1, { action: 'shipping_bin' });
    expect(nearestInteractable(area([a, b]), { x: 3.5, y: 2.5, facing: 'w' }, INTERACTION)?.id).toBe(10);
    expect(nearestInteractable(area([a, b]), { x: 3.5, y: 2.5, facing: 'e' }, INTERACTION)?.id).toBe(11);
  });
});

describe('helper', () => {
  it('jarak ke tepi kotak, 0 kalau di dalam', () => {
    expect(rectDistance(bin, 4.5, 1.5)).toBe(0);
    expect(rectDistance(bin, 6, 1.5)).toBe(1);
    expect(rectDistance(bin, 6, 3)).toBeCloseTo(Math.SQRT2);
  });

  it('nama tombol ramah dibaca', () => {
    expect([keyLabel('KeyE'), keyLabel('Enter'), keyLabel('Digit1'), keyLabel('Space'), keyLabel(undefined)]).toEqual([
      'E',
      'Enter',
      '1',
      'Spasi',
      '?',
    ]);
  });
});

describe('dialogFor', () => {
  it('papan membuka dialog board_<id>, aksi lain belum punya dialog', () => {
    expect(dialogFor('board:kebun_warga')).toBe('board_kebun_warga');
    expect(dialogFor('bed')).toBeNull();
    expect(dialogFor('board:')).toBeNull();
  });
});
