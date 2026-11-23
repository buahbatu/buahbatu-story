import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Shape,
  ShapeGeometry,
  type Material,
  type Texture,
} from 'three';
import { TEX, repeated } from './textures';

const flat = new Map<number, MeshLambertMaterial>();
function color(hex: number): MeshLambertMaterial {
  const cached = flat.get(hex);
  if (cached) return cached;
  const created = new MeshLambertMaterial({ color: hex, flatShading: true });
  flat.set(hex, created);
  return created;
}
const textured = (texture: Texture, rx = 1, ry = 1) => new MeshLambertMaterial({ map: repeated(texture, rx, ry) });

function box(w: number, h: number, d: number, material: Material | Material[], x = 0, y = 0, z = 0): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function texturedBox(w: number, h: number, d: number, texture: Texture, density: number, x = 0, y = 0, z = 0): Mesh {
  const side = (a: number, b: number) => textured(texture, a * density, b * density);
  return box(w, h, d, [side(d, h), side(d, h), side(w, d), side(w, d), side(w, h), side(w, h)], x, y, z);
}

function windowUnit(x: number, y: number, z: number, faceZ: number): Group {
  const g = new Group();
  g.add(box(1.1, 1.1, 0.12, textured(TEX.window()), 0, 0, 0));
  g.add(box(1.3, 0.12, 0.2, color(0xf3ead6), 0, 0.6, 0.02), box(1.3, 0.12, 0.2, color(0xf3ead6), 0, -0.6, 0.02));
  g.add(box(0.5, 1.1, 0.08, textured(TEX.shutter()), -0.85, 0, 0.04), box(0.5, 1.1, 0.08, textured(TEX.shutter()), 0.85, 0, 0.04));
  g.add(texturedBox(1.3, 0.3, 0.35, TEX.planks(), 1.5, 0, -0.8, 0.2));
  for (const [fx, c] of [
    [-0.45, 0xe04a5a],
    [-0.15, 0xf2c94c],
    [0.15, 0xf6f0ff],
    [0.45, 0xe04a5a],
  ] as const) {
    g.add(box(0.18, 0.18, 0.18, color(c), fx, -0.55, 0.25), box(0.14, 0.14, 0.14, color(0x3f8f4a), fx, -0.68, 0.32));
  }
  g.position.set(x, y, z);
  g.rotation.y = faceZ < 0 ? Math.PI : 0;
  return g;
}

function gable(depth: number, rise: number): ShapeGeometry {
  const s = new Shape();
  s.moveTo(-depth / 2, 0);
  s.lineTo(depth / 2, 0);
  s.lineTo(0, rise);
  s.closePath();
  return new ShapeGeometry(s);
}

export function farmhouse(): Group {
  const g = new Group();
  const W = 6;
  const D = 4.6;
  const base = 0.45;
  const wallH = 2.7;
  const top = base + wallH;
  const rise = 1.6;
  const over = 0.3;
  const slope = rise / (D / 2);
  g.add(texturedBox(W + 0.3, base, D + 0.3, TEX.stone(), 1.2, 0, base / 2, 0));
  g.add(texturedBox(W, wallH, D, TEX.planks(), 1.1, 0, base + wallH / 2, 0));
  const wallMat = new MeshLambertMaterial({ map: repeated(TEX.planks(), D * 1.1, rise * 1.1), side: DoubleSide });
  for (const x of [-W / 2, W / 2]) {
    const end = new Mesh(gable(D, rise), wallMat);
    end.position.set(x, top, 0);
    end.rotation.y = Math.PI / 2;
    g.add(end);
  }
  const halfSpan = D / 2 + over;
  const eaveDrop = slope * over;
  const length = Math.hypot(halfSpan, rise + eaveDrop);
  const angle = Math.atan(slope);
  for (const sign of [1, -1]) {
    const slab = texturedBox(W + over * 2, 0.16, length, TEX.roofTiles(), 1, 0, top + (rise - eaveDrop) / 2, (sign * halfSpan) / 2);
    slab.rotation.x = sign * angle;
    g.add(slab);
  }
  g.add(box(W + over * 2 + 0.1, 0.22, 0.3, color(0x8e2f2a), 0, top + rise + 0.05, 0));
  g.add(texturedBox(0.7, 1.8, 0.7, TEX.stone(), 1.4, W / 2 - 1.3, top + rise * 0.55 + 0.6, -0.8));
  g.add(box(0.85, 0.15, 0.85, color(0x6a6672), W / 2 - 1.3, top + rise * 0.55 + 1.55, -0.8));
  const front = D / 2 + 0.06;
  g.add(box(1.4, 2.2, 0.16, color(0x5a341b), 0, base + 1.1, front - 0.02));
  g.add(box(1.1, 2, 0.1, textured(TEX.door()), 0, base + 1, front + 0.04));
  g.add(texturedBox(1.8, 0.2, 0.9, TEX.stone(), 1.6, 0, 0.1, front + 0.5));
  g.add(windowUnit(-1.95, base + 1.5, front, 1), windowUnit(1.95, base + 1.5, front, 1), windowUnit(-1.2, base + 1.5, -front, -1));
  g.add(box(0.22, 0.32, 0.22, new MeshBasicMaterial({ color: 0xffd27a }), -0.95, base + 2.05, front + 0.1));
  g.add(box(0.3, 0.06, 0.3, color(0x3b2a20), -0.95, base + 2.24, front + 0.1));
  const barrel = new Mesh(new CylinderGeometry(0.38, 0.38, 0.8, 8), textured(TEX.planks(), 2, 1));
  barrel.position.set(2.6, base + 0.4 - 0.45, front + 0.7);
  g.add(barrel);
  return g;
}

export function tree(scale = 1): Group {
  const g = new Group();
  const trunk = new Mesh(new CylinderGeometry(0.22 * scale, 0.32 * scale, 1.8 * scale, 7), textured(TEX.bark(), 2, 2));
  trunk.position.y = 0.9 * scale;
  g.add(trunk);
  const leaves = new MeshLambertMaterial({ map: TEX.leaves(), flatShading: true });
  for (const [x, y, z, r] of [
    [0, 2.3, 0, 1.25],
    [0.55, 2.7, 0.3, 0.9],
    [-0.5, 2.8, -0.2, 0.85],
    [0.1, 3.3, 0, 0.75],
  ] as const) {
    const blob = new Mesh(new IcosahedronGeometry(r * scale, 1), leaves);
    blob.position.set(x * scale, y * scale, z * scale);
    g.add(blob);
  }
  return g;
}

export function fence(length: number): Group {
  const g = new Group();
  const posts = Math.max(2, Math.round(length / 1.1) + 1);
  for (let i = 0; i < posts; i++) g.add(texturedBox(0.16, 0.9, 0.16, TEX.planks(), 2, (i * length) / (posts - 1) - length / 2, 0.45, 0));
  for (const y of [0.35, 0.7]) g.add(texturedBox(length, 0.1, 0.08, TEX.planks(), 1.5, 0, y, 0));
  return g;
}

export function strawberryPlot(cols: number, rows: number): Group {
  const g = new Group();
  g.add(texturedBox(cols * 1.1, 0.22, rows * 1.1, TEX.soil(), 1.2, 0, 0.11, 0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * 1.1;
      const z = (r - (rows - 1) / 2) * 1.1;
      for (const [lx, lz] of [
        [-0.18, 0],
        [0.18, 0.05],
        [0, -0.18],
      ] as const) {
        const leaf = new Mesh(new ConeGeometry(0.2, 0.3, 4), color(0x3f8f4a));
        leaf.position.set(x + lx, 0.38, z + lz);
        g.add(leaf);
      }
      g.add(box(0.2, 0.2, 0.2, color(0xe04a5a), x + 0.12, 0.32, z + 0.16), box(0.16, 0.16, 0.16, color(0xe04a5a), x - 0.14, 0.3, z + 0.1));
    }
  return g;
}
