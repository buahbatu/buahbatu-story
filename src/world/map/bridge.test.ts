import { describe, expect, it } from 'vitest';
import { BRIDGE } from '../../config/world';
import { PLAYER } from '../../config/balance';
import { bodyBlocked, bridgeAt, bridgesOf, standHeight, walkLevel, type AreaData, type MapObject } from './logic';

const W = 8;
const H = 6;
function river(objects: MapObject[] = []): AreaData {
  const terrain = Array.from({ length: W * H }, (_, i) => (i % W >= 3 && i % W <= 5 ? 'water' : 'grass'));
  return {
    id: 'r',
    width: W,
    height: H,
    terrain,
    heights: Array.from({ length: W * H }, () => 0),
    farmable: [],
    collisions: [],
    objects,
    spawns: {},
    tileset: { image: '', columns: 1, rows: 1, terrainTiles: {} },
    settings: {},
  };
}
const bridge = (x: number, y: number, w: number, h: number, style = 'wood'): MapObject => ({
  id: 9,
  kind: 'bridge',
  name: '',
  x,
  y,
  w,
  h,
  props: { style },
});
const body = { ...PLAYER, maxStep: PLAYER.maxStep };

describe('jembatan', () => {
  it('arah & tinggi lantai otomatis dari tepian kedua ujung', () => {
    const [b] = bridgesOf(river([bridge(2.8, 2, 3.4, 2)]));
    expect(b).toMatchObject({ along: 'x', style: 'wood' });
    expect(b?.deck).toBeCloseTo(BRIDGE.deck);
    expect(bridgesOf(river([bridge(4, 0.5, 1, 5, 'concrete')]))[0]).toMatchObject({ along: 'y', style: 'concrete' });
  });

  it('di atas jembatan pemain berdiri di lantai, bukan di dasar sungai', () => {
    const a = river([bridge(2.8, 2, 3.4, 2)]);
    expect(standHeight(a, 4.5, 3)).toBeCloseTo(BRIDGE.deck);
    expect(walkLevel(a, 4.5, 3)).toBeCloseTo(BRIDGE.deck);
    expect(standHeight(a, 4.5, 5)).toBeLessThan(0);
    expect(bridgeAt(a, 4.5, 5)).toBeNull();
  });

  it('air dalam di bawah jembatan tidak menghalangi, tanpa jembatan menghalangi', () => {
    const a = river([bridge(2.8, 2, 3.4, 2)]);
    expect(bodyBlocked(a, 4.5, 3, BRIDGE.deck, body)).toBe(false);
    expect(bodyBlocked(river(), 4.5, 3, 0, body)).toBe(true);
  });

  it('naik dari tepian ke lantai jembatan tidak melebihi langkah maksimum', () => {
    expect(BRIDGE.deck).toBeLessThan(PLAYER.maxStep);
  });
});
