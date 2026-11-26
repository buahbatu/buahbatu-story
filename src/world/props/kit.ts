import { Color, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Material, type Texture } from 'three';
import { repeated } from './textures';
import { bendableBox } from '../../render/segments';

const flat = new Map<string, MeshLambertMaterial>();

export function color(hex: number | string): MeshLambertMaterial {
  const key = String(hex);
  const cached = flat.get(key);
  if (cached) return cached;
  const created = new MeshLambertMaterial({ color: new Color(hex), flatShading: true });
  flat.set(key, created);
  return created;
}

export const textured = (texture: Texture, rx = 1, ry = 1, tint?: string): MeshLambertMaterial =>
  new MeshLambertMaterial({ map: repeated(texture, rx, ry), ...(tint ? { color: new Color(tint) } : {}) });

export function box(w: number, h: number, d: number, material: Material | Material[], x = 0, y = 0, z = 0): Mesh {
  const mesh = new Mesh(bendableBox(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function texturedBox(w: number, h: number, d: number, texture: Texture, density: number, x = 0, y = 0, z = 0, tint?: string): Mesh {
  const side = (a: number, b: number) => textured(texture, a * density, b * density, tint);
  return box(w, h, d, [side(d, h), side(d, h), side(w, d), side(w, d), side(w, h), side(w, h)], x, y, z);
}

const SIGN_LEAN = 0.5;

export function signPanel(texture: Texture, w: number, h: number, x: number, y: number, z: number): Group {
  const g = new Group();
  g.add(box(w + 0.1, h + 0.1, 0.08, color('#3b2a20')), box(w, h, 0.05, new MeshBasicMaterial({ map: texture }), 0, 0, 0.05));
  g.position.set(x, y, z);
  g.rotation.x = -SIGN_LEAN;
  return g;
}
