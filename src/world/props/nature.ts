import { Group, type Object3D } from 'three';
import { ASSET_LOOK, PROP_ASSETS } from '../../config/world';
import { asset, fit, sizeOf, type Tint } from './assets';
import { box, color, texturedBox } from './kit';
import { fenceLayout, pickIndex, varied } from './logic';
import { TEX } from './textures';

const S = ASSET_LOOK.size;

function variant(files: readonly string[], seed: number, target: number, axis: 'y' | 'xz' = 'y', tint: Tint = {}): Object3D {
  const model = fit(asset(files[pickIndex(files.length, seed)] ?? files[0] ?? '', tint), target * varied(seed, ASSET_LOOK.jitter), axis);
  model.rotation.y = seed * Math.PI * 2;
  return model;
}

const wrap = (...children: Object3D[]): Group => new Group().add(...children);

export const tree = (scale = 1, seed = 0): Group => wrap(variant(PROP_ASSETS.tree, seed, S.tree * scale));

export const pine = (scale = 1, seed = 0): Group => wrap(variant(PROP_ASSETS.pine, seed, S.pine * scale));

export const rock = (scale = 1, seed = 0): Group => wrap(variant(PROP_ASSETS.rock, seed, S.rock * scale, 'xz'));

function flowerAt(hex: string, height: number, x: number, z: number, turn: number): Object3D {
  const f = fit(asset('nature/flower_redA', { colorRed: hex }), height);
  f.position.set(x, 0, z);
  f.rotation.y = turn;
  return f;
}

export function bush(scale = 1, flowers = '', seed = 0): Group {
  const g = wrap(variant(PROP_ASSETS.bush.slice(0, 2), seed, S.bush * scale));
  if (flowers)
    for (const [x, z, t] of [
      [0.35, 0.45, 0],
      [-0.45, 0.3, 2],
      [0.1, -0.5, 4],
    ] as const)
      g.add(flowerAt(flowers, S.flower * scale * 1.6, x * scale, z * scale, t));
  return g;
}

export function pot(flower = '#e04a5a', seed = 0): Group {
  const base = fit(asset('nature/pot_small', ASSET_LOOK.clay), S.pot);
  const top = sizeOf(base).y * 0.85;
  const g = wrap(base);
  for (const [x, z, t] of [
    [0.08, 0.06, 0],
    [-0.1, 0.04, 2.1],
    [0, -0.1, 4.2],
  ] as const) {
    const f = flowerAt(flower, S.flower * varied(seed + x, 0.15), x, z, t);
    f.position.y = top;
    g.add(f);
  }
  return g;
}

export const FENCE_STYLES = ['wood', 'bamboo', 'wall'] as const;

function wallFence(length: number): Group {
  const g = new Group();
  g.add(
    texturedBox(length, 1.1, 0.22, TEX.plasterWhite(), 1, 0, 0.55, 0, '#ece4d2'),
    box(length + 0.05, 0.1, 0.3, color('#b5583d'), 0, 1.13, 0),
  );
  for (let x = -length / 2; x <= length / 2 + 0.01; x += Math.max(1, length / Math.round(length / 2)))
    g.add(box(0.3, 1.25, 0.3, color('#f4f1ea'), x, 0.62, 0));
  return g;
}

export function fence(length: number, style: (typeof FENCE_STYLES)[number] = 'wood'): Group {
  if (style === 'wall') return wallFence(length);
  const tint = style === 'bamboo' ? ASSET_LOOK.bamboo : {};
  const segment = sizeOf(fit(asset(PROP_ASSETS.fence[0], tint), S.fence)).x;
  const layout = fenceLayout(length, segment);
  const g = new Group();
  for (const x of layout.offsets) {
    const part = fit(asset(PROP_ASSETS.fence[0], tint), S.fence);
    part.scale.x *= layout.stretch;
    part.position.x = x;
    g.add(part);
  }
  return g;
}

export const streetLamp = (): Group => wrap(fit(asset(PROP_ASSETS.street_lamp[0]), S.streetLamp));
