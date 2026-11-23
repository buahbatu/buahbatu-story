import { CanvasTexture, NearestFilter, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

type Paint = (px: (x: number, y: number, w: number, h: number, color: string) => void, rnd: () => number) => void;

const cache = new Map<string, Texture>();

function make(key: string, size: number, paint: Paint): Texture {
  const cached = cache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas 2d tidak tersedia');
  let seed = Array.from(key).reduce((s, c) => s + (c.codePointAt(0) ?? 0), 7);
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  paint((x, y, w, h, color) => {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  }, rnd);
  const texture = new CanvasTexture(canvas);
  texture.magFilter = texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}

export const TEX = {
  planks: () =>
    make('planks', 32, (px, rnd) => {
      for (let row = 0; row < 4; row++) {
        const base = ['#b07a46', '#a46f3e', '#ba8650', '#a8723f'][row] ?? '#b07a46';
        px(0, row * 8, 32, 8, base);
        px(0, row * 8 + 7, 32, 1, '#6b4223');
        px(0, row * 8, 32, 1, '#c9965e');
        const seam = Math.floor(rnd() * 24) + 4;
        px(seam, row * 8, 1, 7, '#6b4223');
        for (let i = 0; i < 6; i++) px(Math.floor(rnd() * 32), row * 8 + 2 + Math.floor(rnd() * 4), 2, 1, '#97633a');
      }
    }),
  plaster: () =>
    make('plaster', 32, (px, rnd) => {
      px(0, 0, 32, 32, '#f1e3c4');
      for (let i = 0; i < 40; i++) px(Math.floor(rnd() * 32), Math.floor(rnd() * 32), 1, 1, rnd() > 0.5 ? '#e3d1ab' : '#f8eed6');
    }),
  roofTiles: () =>
    make('roof', 32, (px) => {
      px(0, 0, 32, 32, '#c9473d');
      for (let row = 0; row < 4; row++) {
        const y = row * 8;
        px(0, y + 6, 32, 2, '#8e2f2a');
        px(0, y, 32, 1, '#e26a55');
        for (let col = row % 2 ? 4 : 0; col < 32; col += 8) px(col, y, 1, 6, '#a63a32');
      }
    }),
  stone: () =>
    make('stone', 32, (px, rnd) => {
      px(0, 0, 32, 32, '#7e7a86');
      for (let row = 0; row < 4; row++)
        for (let col = row % 2 ? -6 : 0; col < 32; col += 12) {
          const shade = ['#a29eaa', '#959199', '#aaa6b2'][Math.floor(rnd() * 3)] ?? '#a29eaa';
          px(col + 1, row * 8 + 1, 10, 6, shade);
          px(col + 1, row * 8 + 6, 10, 1, '#6a6672');
          px(col + 1, row * 8 + 1, 10, 1, '#bdb9c4');
        }
    }),
  door: () =>
    make('door', 32, (px) => {
      px(0, 0, 32, 32, '#7a4a28');
      for (let x = 2; x < 32; x += 7) px(x, 0, 1, 32, '#5a341b');
      px(0, 6, 32, 2, '#5a341b');
      px(0, 24, 32, 2, '#5a341b');
      px(24, 15, 3, 3, '#f2c94c');
      px(25, 16, 1, 1, '#fff3b0');
    }),
  window: () =>
    make('window', 32, (px) => {
      px(0, 0, 32, 32, '#f3ead6');
      px(3, 3, 26, 26, '#4a7fa8');
      px(3, 3, 26, 9, '#7fb7dc');
      px(5, 5, 6, 3, '#d8f0ff');
      px(15, 3, 2, 26, '#f3ead6');
      px(3, 15, 26, 2, '#f3ead6');
    }),
  shutter: () =>
    make('shutter', 16, (px) => {
      px(0, 0, 16, 16, '#4f8a5a');
      for (let y = 2; y < 16; y += 3) px(1, y, 14, 1, '#3a6a44');
      px(0, 0, 16, 1, '#6aa874');
    }),
  bark: () =>
    make('bark', 16, (px, rnd) => {
      px(0, 0, 16, 16, '#7a4b2a');
      for (let i = 0; i < 10; i++) px(Math.floor(rnd() * 16), Math.floor(rnd() * 12), 1, 4, '#5e3820');
    }),
  leaves: () =>
    make('leaves', 32, (px, rnd) => {
      px(0, 0, 32, 32, '#3f8f4a');
      for (let i = 0; i < 70; i++)
        px(Math.floor(rnd() * 31), Math.floor(rnd() * 31), 2, 2, ['#2c6b37', '#58a85e', '#357a40'][i % 3] ?? '#2c6b37');
    }),
  soil: () =>
    make('soil', 16, (px, rnd) => {
      px(0, 0, 16, 16, '#7a4a2a');
      for (let y = 2; y < 16; y += 5) px(0, y, 16, 2, '#5e3820');
      for (let i = 0; i < 12; i++) px(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1, '#94603a');
    }),
};

export function repeated(texture: Texture, repeatX: number, repeatY: number): Texture {
  const t = texture.clone();
  t.repeat.set(repeatX, repeatY);
  t.needsUpdate = true;
  return t;
}
