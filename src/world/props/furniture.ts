import { Color, Group, type Object3D } from 'three';
import { FURNITURE, type FurniturePart } from '../../config/world';
import { asset, sizeOf, type Tint } from './assets';
import { box, color, textured, texturedBox } from './kit';
import { fitScale } from './logic';
import { TEX } from './textures';

export const ROOM_HEIGHT = 2.6;
const WALL_T = 0.2;

export function room(w: number, d: number, wallColor = '#f1e3c4', trim = '#8a5a36'): Group {
  const g = new Group();
  const h = ROOM_HEIGHT;
  g.add(texturedBox(w + WALL_T * 2, h, WALL_T, TEX.plasterWhite(), 0.8, 0, h / 2, -d / 2 - WALL_T / 2, wallColor));
  for (const side of [-1, 1]) g.add(texturedBox(WALL_T, h, d, TEX.plasterWhite(), 0.8, side * (w / 2 + WALL_T / 2), h / 2, 0, wallColor));
  g.add(box(w, 0.14, 0.04, color(trim), 0, 0.07, -d / 2 + 0.02));
  for (const side of [-1, 1]) g.add(box(0.04, 0.14, d, color(trim), side * (w / 2 - 0.02), 0.07, 0));
  g.add(
    box(w + WALL_T * 2, 0.08, WALL_T + 0.04, color(trim), 0, h, -d / 2 - WALL_T / 2),
    box(WALL_T + 0.04, 0.08, d, color(trim), -(w / 2 + WALL_T / 2), h, 0),
  );
  g.add(box(WALL_T + 0.04, 0.08, d, color(trim), w / 2 + WALL_T / 2, h, 0));
  return g;
}

export function partition(length: number, wallColor = '#f1e3c4', trim = '#8a5a36'): Group {
  const g = new Group();
  g.add(texturedBox(length, ROOM_HEIGHT, WALL_T, TEX.plasterWhite(), 0.8, 0, ROOM_HEIGHT / 2, 0, wallColor));
  g.add(box(length, 0.08, WALL_T + 0.04, color(trim), 0, ROOM_HEIGHT, 0));
  for (const z of [-1, 1]) g.add(box(length, 0.14, 0.04, color(trim), 0, 0.07, z * (WALL_T / 2 + 0.02)));
  return g;
}

export function wallWindow(curtain = '#e8b4bc'): Group {
  const g = new Group();
  g.add(box(1.3, 1.1, 0.06, textured(TEX.window()), 0, 1.5, 0.02), box(1.5, 0.1, 0.12, color('#f3ead6'), 0, 0.92, 0.06));
  g.add(box(1.7, 0.06, 0.06, color('#6b4223'), 0, 2.15, 0.12));
  for (const x of [-0.72, 0.72]) g.add(box(0.36, 1.25, 0.05, color(curtain), x, 1.5, 0.12));
  return g;
}

export function wallFrame(tint = '#e8b4bc'): Group {
  const g = new Group();
  g.add(
    box(0.7, 0.55, 0.05, color('#6b4223'), 0, 1.6, 0.02),
    box(0.56, 0.42, 0.03, color(tint), 0, 1.6, 0.05),
    box(0.2, 0.15, 0.02, color('#fff7e6'), -0.08, 1.64, 0.07),
  );
  return g;
}

export type FurnitureModel = keyof typeof FURNITURE;

function part(spec: FurniturePart, tint: Tint): Object3D {
  const inner = asset(spec.file, tint);
  inner.rotation.y = spec.yaw ?? 0;
  const g = new Group().add(inner);
  const size = sizeOf(g);
  const [w, h, d] = spec.size;
  g.scale.set(fitScale(size.x, w), fitScale(size.y, h), fitScale(size.z, d));
  const [x, y, z] = spec.at ?? [0, 0, 0];
  g.position.set(x, y, z);
  return g;
}

export function furnish(model: FurnitureModel, tintColor?: string, footprint?: readonly [number, number]): Group {
  const spec: { tint?: string; color?: string; parts: readonly FurniturePart[] } = FURNITURE[model];
  const hex = tintColor ?? spec.color;
  const tint: Record<string, string> = {};
  if (spec.tint && hex) {
    tint[spec.tint] = hex;
    if (spec.tint === 'carpet') tint.carpetDarker = `#${new Color(hex).multiplyScalar(0.7).getHexString()}`;
  }
  const g = new Group();
  for (const p of spec.parts) g.add(part(footprint ? { ...p, size: [footprint[0], p.size[1], footprint[1]] } : p, tint));
  return g;
}
