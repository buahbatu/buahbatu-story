import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshLambertMaterial,
  Shape,
  ShapeGeometry,
  type Texture,
} from 'three';
import { box, color, signPanel, textured, texturedBox } from './kit';
import { TEX, awning, repeated, signTexture } from './textures';

export const WALLS = ['planks', 'plaster', 'brick', 'bamboo'] as const;
export const ROOFS = ['gable', 'hip', 'flat'] as const;

export interface BuildingSpec {
  w: number;
  d: number;
  floors: number;
  wall: (typeof WALLS)[number];
  wallColor: string;
  roof: (typeof ROOFS)[number];
  roofColor: string;
  zinc: boolean;
  trim: string;
  doorColor: string;
  doorX: number;
  windows: number;
  shutters: string;
  awning: string;
  sign: string;
  signColor: string;
  porch: boolean;
}

export const DEFAULT_BUILDING: BuildingSpec = {
  w: 5,
  d: 4,
  floors: 1,
  wall: 'plaster',
  wallColor: '#f3e2bf',
  roof: 'gable',
  roofColor: '#c9473d',
  zinc: false,
  trim: '#f3ead6',
  doorColor: '#7a4a28',
  doorX: 0,
  windows: 2,
  shutters: '',
  awning: '',
  sign: '',
  signColor: '#2f5d50',
  porch: false,
};

const FLOOR_H = 2.4;
const BASE_H = 0.3;
const WALL_TEX: Record<BuildingSpec['wall'], () => Texture> = {
  planks: TEX.planks,
  plaster: TEX.plasterWhite,
  brick: TEX.brick,
  bamboo: TEX.bamboo,
};

function hipGeometry(w: number, d: number, rise: number): BufferGeometry {
  const hw = w / 2;
  const hd = d / 2;
  const ridge = Math.max(0, hw - hd);
  const pos: number[] = [];
  const uv: number[] = [];
  const slope = Math.hypot(hd, rise);
  const tri = (pts: [number, number, number][]) => {
    for (const [x, y, z] of pts) {
      pos.push(x, y, z);
      uv.push(x + z * 0.3, ((rise - y) / rise) * slope);
    }
  };
  const f0: [number, number, number] = [-hw, 0, hd];
  const f1: [number, number, number] = [hw, 0, hd];
  const b0: [number, number, number] = [hw, 0, -hd];
  const b1: [number, number, number] = [-hw, 0, -hd];
  const r0: [number, number, number] = [-ridge, rise, 0];
  const r1: [number, number, number] = [ridge, rise, 0];
  tri([f0, f1, r1]);
  tri([f0, r1, r0]);
  tri([b0, b1, r0]);
  tri([b0, r0, r1]);
  tri([f1, b0, r1]);
  tri([b1, f0, r0]);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function gableEnd(d: number, rise: number): ShapeGeometry {
  const s = new Shape();
  s.moveTo(-d / 2, 0);
  s.lineTo(d / 2, 0);
  s.lineTo(0, rise);
  s.closePath();
  return new ShapeGeometry(s);
}

function windowUnit(spec: BuildingSpec): Group {
  const g = new Group();
  g.add(box(1, 1, 0.1, textured(TEX.window())), box(1.2, 0.12, 0.18, color(spec.trim), 0, -0.56, 0.04));
  g.add(box(1.2, 0.1, 0.14, color(spec.trim), 0, 0.55, 0.02));
  if (spec.shutters) for (const x of [-0.78, 0.78]) g.add(box(0.45, 1, 0.08, textured(TEX.shutter(), 1, 1, spec.shutters), x, 0, 0.04));
  return g;
}

function roof(spec: BuildingSpec, top: number): Group {
  const g = new Group();
  const tex = spec.zinc ? TEX.zinc() : TEX.roofGray();
  const tint = spec.zinc ? undefined : spec.roofColor;
  const over = 0.35;
  const W = spec.w + over * 2;
  const D = spec.d + over * 2;
  if (spec.roof === 'flat') {
    g.add(texturedBox(W - 0.4, 0.2, D - 0.4, TEX.plasterWhite(), 1, 0, top + 0.1, 0, spec.wallColor));
    for (const [w, d, x, z] of [
      [W - 0.4, 0.2, 0, (D - 0.6) / 2],
      [W - 0.4, 0.2, 0, -(D - 0.6) / 2],
      [0.2, D - 0.4, (W - 0.6) / 2, 0],
      [0.2, D - 0.4, -(W - 0.6) / 2, 0],
    ] as const)
      g.add(box(w, 0.5, d, color(spec.roofColor), x, top + 0.35, z));
    const tank = new Mesh(new CylinderGeometry(0.45, 0.45, 0.9, 10), color('#3f7fc4'));
    tank.position.set(spec.w / 2 - 1, top + 0.9, -spec.d / 2 + 1);
    g.add(tank, box(1.1, 0.25, 1.1, color('#8a8f94'), spec.w / 2 - 1, top + 0.32, -spec.d / 2 + 1));
    return g;
  }
  const rise = Math.min(2.2, spec.d * 0.42);
  if (spec.roof === 'hip') {
    const mesh = new Mesh(
      hipGeometry(W, D, rise),
      new MeshLambertMaterial({ map: repeated(tex, 0.6, 0.6), color: tint ?? '#ffffff', side: DoubleSide }),
    );
    mesh.position.y = top - 0.05;
    g.add(mesh);
    return g;
  }
  const half = D / 2;
  const slope = Math.hypot(half, rise);
  const angle = Math.atan2(rise, half);
  for (const sign of [1, -1]) {
    const slab = texturedBox(W, 0.14, slope, tex, 0.6, 0, top + rise / 2, (sign * half) / 2, tint);
    slab.rotation.x = sign * angle;
    g.add(slab);
  }
  g.add(box(W + 0.05, 0.18, 0.26, color(spec.zinc ? '#858c91' : spec.roofColor), 0, top + rise + 0.02, 0));
  const endMat = new MeshLambertMaterial({
    map: repeated(WALL_TEX[spec.wall](), spec.d * 0.8, rise * 0.8),
    color: spec.wall === 'plaster' ? spec.wallColor : '#ffffff',
    side: DoubleSide,
  });
  for (const x of [-spec.w / 2, spec.w / 2]) {
    const end = new Mesh(gableEnd(spec.d, rise * (spec.d / D)), endMat);
    end.position.set(x, top, 0);
    end.rotation.y = Math.PI / 2;
    g.add(end);
  }
  return g;
}

export function building(input: Partial<BuildingSpec> = {}): Group {
  const spec = { ...DEFAULT_BUILDING, ...input };
  const g = new Group();
  const wallH = spec.floors * FLOOR_H;
  const top = BASE_H + wallH;
  const front = spec.d / 2;
  const wallTint = spec.wall === 'plaster' ? spec.wallColor : undefined;
  g.add(texturedBox(spec.w + 0.2, BASE_H, spec.d + 0.2, TEX.stone(), 1.2, 0, BASE_H / 2, 0));
  g.add(texturedBox(spec.w, wallH, spec.d, WALL_TEX[spec.wall](), 0.9, 0, BASE_H + wallH / 2, 0, wallTint));
  if (spec.floors > 1) g.add(box(spec.w + 0.08, 0.16, spec.d + 0.08, color(spec.trim), 0, BASE_H + FLOOR_H, 0));
  g.add(roof(spec, top));
  g.add(box(1.2, 2.05, 0.12, color(spec.trim), spec.doorX, BASE_H + 1.02, front + 0.02));
  g.add(
    box(
      0.95,
      1.9,
      0.1,
      textured(TEX.door(), 1, 1, spec.doorColor === DEFAULT_BUILDING.doorColor ? undefined : spec.doorColor),
      spec.doorX,
      BASE_H + 0.95,
      front + 0.06,
    ),
  );
  g.add(texturedBox(1.6, 0.18, 0.7, TEX.stone(), 1.5, spec.doorX, 0.09, front + 0.45));
  const slots = Math.max(0, Math.floor(spec.windows));
  const usable = spec.w - 1.2;
  for (let floor = 0; floor < spec.floors; floor++)
    for (let i = 0; i < slots; i++) {
      const x = -usable / 2 + (usable * (i + 0.5)) / slots;
      if (floor === 0 && Math.abs(x - spec.doorX) < 1.2) continue;
      const win = windowUnit(spec);
      win.position.set(x, BASE_H + floor * FLOOR_H + 1.35, front + 0.05);
      g.add(win);
    }
  for (const side of [-1, 1])
    for (let floor = 0; floor < spec.floors; floor++) {
      const win = windowUnit(spec);
      win.position.set(side * (spec.w / 2 + 0.05), BASE_H + floor * FLOOR_H + 1.35, 0);
      win.rotation.y = side * (Math.PI / 2);
      g.add(win);
    }
  if (spec.porch) {
    g.add(texturedBox(spec.w, 0.2, 1.6, TEX.planks(), 1, 0, 0.1, front + 0.8));
    for (const x of [-spec.w / 2 + 0.2, spec.w / 2 - 0.2]) g.add(box(0.18, 2.3, 0.18, color(spec.trim), x, 1.25, front + 1.45));
    g.add(
      texturedBox(
        spec.w + 0.3,
        0.12,
        1.9,
        spec.zinc ? TEX.zinc() : TEX.roofGray(),
        0.7,
        0,
        2.45,
        front + 0.85,
        spec.zinc ? undefined : spec.roofColor,
      ),
    );
  }
  if (spec.awning) {
    const shade = box(
      spec.w * 0.9,
      0.08,
      1.3,
      new MeshLambertMaterial({ map: repeated(awning(spec.awning, '#fff7e6'), spec.w * 0.9, 1) }),
      0,
      BASE_H + 2.35,
      front + 0.6,
    );
    shade.rotation.x = 0.28;
    g.add(shade);
  }
  if (spec.sign) {
    const tex = signTexture(spec.sign, spec.signColor, '#fff7e6');
    const canvas = tex.image as HTMLCanvasElement;
    const aspect = canvas.width / canvas.height;
    const w = Math.min(spec.w - 0.4, aspect * 0.55);
    const h = w / aspect;
    const y = spec.awning ? BASE_H + 2.5 : spec.floors > 1 ? BASE_H + FLOOR_H + 0.35 : top + 0.35;
    const z = front + (spec.awning ? 1.22 : spec.floors > 1 ? 0.06 : 0.3);
    g.add(signPanel(tex, w, h, spec.doorX, y, z + 0.12));
  }
  return g;
}
