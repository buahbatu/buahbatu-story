import { CanvasTexture, NearestFilter, SRGBColorSpace, type Texture } from 'three';
import { DIRECTIONS, SHEET_COLUMNS, type Direction } from './logic';

export const FRAME_W = 32;
export const FRAME_H = 48;

export interface Appearance {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long';
  eyes: string;
  shirt: string;
  pants: string;
  shoes: string;
}

export const APPEARANCE: Record<'A' | 'B', Appearance> = {
  A: { skin: '#f0c49c', hair: '#3a2a24', hairStyle: 'short', eyes: '#3b2a20', shirt: '#4a86c8', pants: '#3e4c6e', shoes: '#7a4a2a' },
  B: { skin: '#f7d6bb', hair: '#4a2c24', hairStyle: 'long', eyes: '#4a2c24', shirt: '#ec8a9a', pants: '#f3eadb', shoes: '#c9473d' },
};

type View = 'front' | 'front34' | 'side' | 'back34' | 'back';
type RGB = [number, number, number];
const VIEW: Record<'s' | 'sw' | 'w' | 'nw' | 'n', View> = { s: 'front', sw: 'front34', w: 'side', nw: 'back34', n: 'back' };
const MIRROR: Partial<Record<Direction, 'sw' | 'w' | 'nw'>> = { se: 'sw', e: 'w', ne: 'nw' };

const rgb = (hex: string): RGB => {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const tone = ([r, g, b]: RGB, k: number): RGB => {
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k >= 1 ? c + (255 - c) * (k - 1) : c * k)));
  return [f(r), f(g), f(b)];
};

interface Pose {
  bob: number;
  leftLift: number;
  rightLift: number;
  stride: number;
  swing: number;
}

const POSES: Pose[] = [
  { bob: 0, leftLift: 0, rightLift: 0, stride: 0, swing: 0 },
  { bob: 1, leftLift: 0, rightLift: 0, stride: 0, swing: 0 },
  { bob: 0, leftLift: 0, rightLift: 0, stride: 3, swing: 2 },
  { bob: -1, leftLift: 2, rightLift: 0, stride: 1, swing: 0 },
  { bob: 0, leftLift: 0, rightLift: 0, stride: -3, swing: -2 },
  { bob: -1, leftLift: 0, rightLift: 2, stride: -1, swing: 0 },
];

class Pixels {
  readonly w: number;
  readonly h: number;
  readonly data: (RGB | null)[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Array<RGB | null>(w * h).fill(null);
  }

  set(x: number, y: number, c: RGB): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.data[y * this.w + x] = c;
  }

  get(x: number, y: number): RGB | null {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : (this.data[y * this.w + x] ?? null);
  }

  rect(x0: number, y0: number, w: number, h: number, base: RGB, shaded = true): void {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) {
        const k = !shaded ? 1 : x === x0 && w > 2 ? 1.18 : x === x0 + w - 1 && w > 2 ? 0.78 : y === y0 + h - 1 && h > 2 ? 0.86 : 1;
        this.set(x, y, tone(base, k));
      }
  }

  oval(cx: number, cy: number, rx: number, ry: number, base: RGB, clip?: (x: number, y: number) => boolean, soft = false): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny > 1 || (clip && !clip(x, y))) continue;
        const light = -0.62 * nx - 0.78 * ny;
        const [hi, lo] = soft ? [0.8, -0.82] : [0.5, -0.42];
        this.set(x, y, tone(base, light > hi ? 1.1 : light < lo ? 0.84 : 1));
      }
  }

  outline(): void {
    const marks: [number, number, RGB][] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        const near = this.get(x, y + 1) ?? this.get(x - 1, y) ?? this.get(x + 1, y) ?? this.get(x, y - 1);
        if (near) marks.push([x, y, tone(near, 0.42)]);
      }
    for (const [x, y, c] of marks) this.set(x, y, c);
  }

  mirrored(): Pixels {
    const out = new Pixels(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out.data[y * this.w + (this.w - 1 - x)] = this.get(x, y);
    return out;
  }

  paint(g: CanvasRenderingContext2D, ox: number, oy: number): void {
    const img = g.createImageData(this.w, this.h);
    this.data.forEach((c, i) => {
      if (c) img.data.set([c[0], c[1], c[2], 255], i * 4);
    });
    g.putImageData(img, ox, oy);
  }
}

function drawFrame(p: Pixels, view: View, pose: Pose, look: Appearance): void {
  const skin = rgb(look.skin);
  const hair = rgb(look.hair);
  const shirt = rgb(look.shirt);
  const pants = rgb(look.pants);
  const shoes = rgb(look.shoes);
  const eyes = rgb(look.eyes);
  const white: RGB = [255, 255, 255];
  const blush: RGB = [240, 138, 150];
  const side = view === 'side';
  const facingFront = view === 'front' || view === 'front34';
  const b = pose.bob;
  const hx = side ? 15 : view === 'front' || view === 'back' ? 16 : 15.5;
  const hy = 15 + b;
  const long = look.hairStyle === 'long';

  if (long && view !== 'back') {
    if (side) p.rect(17, hy + 2, 7, 15, tone(hair, 0.82));
    else {
      p.rect(5, hy + 2, 4, 16, tone(hair, 0.85));
      p.rect(23, hy + 2, 4, 16, tone(hair, 0.78));
    }
  }

  const legTop = 37;
  if (side)
    for (const [x, s] of [
      [13, -pose.stride],
      [16, pose.stride],
    ] as const) {
      p.rect(x + s, legTop, 4, 6, pants);
      p.rect(x + s - 1, legTop + 6, 6, 3, shoes);
    }
  else
    for (const [x, lift] of [
      [11, pose.leftLift],
      [17, pose.rightLift],
    ] as const) {
      p.rect(x, legTop, 4, 6 - lift, pants);
      p.rect(x - (x < 16 ? 1 : 0), legTop + 6 - lift, 5, 3, shoes);
    }

  const bodyX = side ? 12 : 10;
  const bodyW = side ? 9 : 12;
  p.rect(bodyX, 26 + b, bodyW, 11 - b, shirt);
  p.rect(bodyX, 35, bodyW, 2, tone(shirt, 0.72), false);
  if (facingFront) {
    p.rect(bodyX + bodyW / 2 - 2, 26 + b, 4, 2, tone(shirt, 1.25), false);
    p.set(bodyX + bodyW / 2 - 1, 28 + b, tone(shirt, 0.75));
  }
  const arm = (x: number, swing: number) => {
    p.rect(x, 27 + b + swing, 3, 6, tone(shirt, 0.9));
    p.oval(x + 1.5, 34.5 + b + swing, 1.8, 1.8, skin, undefined, true);
  };
  if (side) arm(14 + pose.swing, 0);
  else {
    arm(7, pose.swing);
    arm(22, -pose.swing);
  }

  if (long && view === 'back') p.rect(9, hy + 4, 14, 14, tone(hair, 0.9));
  p.oval(hx, hy, 10.6, 10, skin, undefined, true);

  if (view === 'back') p.oval(hx, hy, 10.8, 10.2, hair);
  else if (view === 'back34') {
    p.oval(hx, hy, 10.8, 10.2, hair, (x, y) => x > hx - 8 || y < hy - 1 || y > hy + 6);
    p.rect(Math.floor(hx - 10), hy + 1, 2, 3, tone(skin, 0.85), false);
    if (long) p.rect(10, hy + 5, 13, 12, tone(hair, 0.9));
  } else if (side) {
    p.oval(hx, hy, 10.8, 10.2, hair, (x, y) => y < hy - 3 + (x % 3 === 0 ? 1 : 0) || x > hx + 1);
    p.rect(Math.floor(hx + 2), hy + 1, 2, 3, tone(skin, 0.82), false);
    const ex = Math.floor(hx - 7);
    p.rect(ex, hy, 3, 4, eyes, false);
    p.set(ex, hy, white);
    p.set(ex + 1, hy, white);
    p.rect(ex + 2, hy + 5, 2, 1, blush, false);
  } else {
    const turn = view === 'front34' ? -2 : 0;
    p.oval(hx, hy, 10.8, 10.2, hair, (x, y) => {
      const step = (((x + turn) % 4) + 4) % 4;
      const fringe = hy - 4 + (step === 0 ? 2 : step === 2 ? 1 : 0);
      return y < fringe || ((x < hx - 8.5 || x > hx + 8) && y < hy + 5);
    });
    const eyeXs = view === 'front34' ? [Math.floor(hx - 7), Math.floor(hx + 1)] : [Math.floor(hx - 6), Math.floor(hx + 3)];
    eyeXs.forEach((ex, i) => {
      const w = view === 'front34' && i === 1 ? 2 : 3;
      p.rect(ex, hy, w, 4, eyes, false);
      p.set(ex, hy, white);
      if (w === 3) p.set(ex + 1, hy, white);
      p.set(ex + w - 1, hy + 3, tone(eyes, 1.6));
    });
    p.rect(Math.floor(hx - 9), hy + 5, 2, 1, blush, false);
    if (view === 'front') p.rect(Math.floor(hx + 7), hy + 5, 2, 1, blush, false);
    p.rect(Math.floor(hx - 1 + turn), hy + 7, 2, 1, tone(skin, 0.66), false);
  }
  p.rect(Math.floor(hx - 6), hy - 8, view === 'back' ? 6 : 5, 1, tone(hair, 1.45), false);
}

export function paintSheet(look: Appearance): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * SHEET_COLUMNS;
  canvas.height = FRAME_H * DIRECTIONS.length;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas 2d tidak tersedia');
  DIRECTIONS.forEach((dir, row) => {
    const mirror = MIRROR[dir];
    const view = VIEW[mirror ?? (dir as keyof typeof VIEW)];
    POSES.forEach((pose, col) => {
      const p = new Pixels(FRAME_W, FRAME_H);
      drawFrame(p, view, pose, look);
      p.outline();
      (mirror ? p.mirrored() : p).paint(g, col * FRAME_W, row * FRAME_H);
    });
  });
  return canvas;
}

const sheets = new Map<Appearance, Texture>();

export function sheetTexture(look: Appearance): Texture {
  const cached = sheets.get(look);
  if (cached) return cached;
  const texture = new CanvasTexture(paintSheet(look));
  texture.magFilter = texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  sheets.set(look, texture);
  return texture;
}
