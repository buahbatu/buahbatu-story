import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dirname, '..', '..', 'public', 'assets', 'tilesets');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const png = await page.evaluate(() => {
  const T = 16;
  const c = document.createElement('canvas');
  c.width = T * 8;
  c.height = T * 3;
  const g = c.getContext('2d');
  if (!g) throw new Error('canvas 2d tidak tersedia');
  let seed = 3;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const px = (ox: number, oy: number, x: number, y: number, col: string, w = 1, h = 1) => {
    g.fillStyle = col;
    g.fillRect(ox + x, oy + y, w, h);
  };
  const fill = (ox: number, oy: number, col: string) => {
    px(ox, oy, 0, 0, col, T, T);
  };
  const dots = (ox: number, oy: number, cols: string[], n: number) => {
    for (let i = 0; i < n; i++) px(ox, oy, Math.floor(rnd() * T), Math.floor(rnd() * T), cols[i % cols.length] ?? '#000');
  };
  const glyphs: Record<number, string[]> = {
    1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['##.', '..#', '.#.', '#..', '###'],
    3: ['##.', '..#', '.#.', '..#', '##.'],
  };
  const digit = (ox: number, oy: number, n: number, col: string) => {
    (glyphs[n] ?? []).forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row.charAt(x) === '#') px(ox, oy, 6 + x, 5 + y, col);
    });
  };
  const tiles: ((x: number, y: number) => void)[] = [
    (x, y) => {
      fill(x, y, '#6fb35f');
      dots(x, y, ['#58994d', '#8fcc72'], 22);
    },
    (x, y) => {
      fill(x, y, '#6fb35f');
      dots(x, y, ['#58994d'], 14);
      for (const [a, b, col] of [
        [3, 4, '#e04a5a'],
        [11, 3, '#f2c94c'],
        [7, 10, '#fff7e6'],
        [12, 12, '#e04a5a'],
      ] as const)
        px(x, y, a, b, col, 2, 2);
    },
    (x, y) => {
      fill(x, y, '#8a5a36');
      dots(x, y, ['#6e4529', '#a06c43'], 30);
    },
    (x, y) => {
      fill(x, y, '#d8b98a');
      dots(x, y, ['#bf9f6f', '#ead2a8'], 26);
    },
    (x, y) => {
      fill(x, y, '#7a4a2a');
      for (let r = 2; r < T; r += 5) px(x, y, 0, r, '#5e3820', T, 2);
      dots(x, y, ['#94603a'], 10);
    },
    (x, y) => {
      fill(x, y, '#ead9a6');
      dots(x, y, ['#d9c58c', '#f6ebc6'], 24);
    },
    (x, y) => {
      fill(x, y, '#4f86b8');
      for (const [a, b] of [
        [2, 3],
        [9, 7],
        [4, 12],
      ] as const)
        px(x, y, a, b, '#8fc0e6', 5, 1);
      dots(x, y, ['#3d6d99'], 10);
    },
    (x, y) => {
      fill(x, y, '#9a9aa6');
      for (const r of [0, 8]) {
        px(x, y, 0, r + 7, '#77778a', T, 1);
        px(x, y, r === 0 ? 7 : 3, r, '#77778a', 1, 7);
      }
    },
    (x, y) => {
      fill(x, y, '#c59a6a');
      for (const r of [0, 4, 8, 12]) {
        px(x, y, 0, r + 3, '#a87f52', T, 1);
        px(x, y, ((r * 3) % 12) + 2, r, '#a87f52', 1, 3);
      }
    },
    (x, y) => {
      fill(x, y, '#8a7f6a');
      for (const r of [0, 5, 10]) {
        px(x, y, 0, r + 4, '#6b624f', T, 1);
        px(x, y, 0, r, '#a49a84', T, 1);
      }
      dots(x, y, ['#6b624f'], 10);
    },
    (x, y) => {
      fill(x, y, 'rgba(242,201,76,0.55)');
      digit(x, y, 1, '#3b2a20');
    },
    (x, y) => {
      fill(x, y, 'rgba(242,153,74,0.6)');
      digit(x, y, 2, '#3b2a20');
    },
    (x, y) => {
      fill(x, y, 'rgba(217,70,91,0.6)');
      digit(x, y, 3, '#fff7e6');
    },
    (x, y) => {
      fill(x, y, 'rgba(122,74,42,0.55)');
      for (let r = 3; r < T; r += 5) px(x, y, 2, r, '#fff7e6', 12, 1);
    },
    (x, y) => {
      fill(x, y, '#55565e');
      dots(x, y, ['#4a4b52', '#62636b', '#6d6e76'], 34);
    },
    (x, y) => {
      fill(x, y, '#b9aea0');
      for (const r of [0, 8]) {
        px(x, y, 0, r, '#968b7e', T, 1);
        for (let k = (r / 8) * 4; k < T; k += 8) px(x, y, k, r, '#968b7e', 1, 8);
      }
      dots(x, y, ['#c9bfb2'], 10);
    },
    (x, y) => {
      fill(x, y, '#ece8e0');
      px(x, y, 0, 0, '#cfc9bd', T, 1);
      px(x, y, 0, 0, '#cfc9bd', 1, T);
      px(x, y, 1, 1, '#f8f6f1', 6, 1);
      dots(x, y, ['#e2ddd3'], 8);
    },
    (x, y) => {
      fill(x, y, '#8e3b46');
      for (let r = 1; r < T; r += 3) px(x, y, 0, r, '#7a3039', T, 1);
      dots(x, y, ['#a34a56'], 18);
    },
  ];
  tiles.forEach((draw, i) => {
    draw((i % 8) * T, Math.floor(i / 8) * T);
  });
  return c.toDataURL('image/png').split(',')[1] ?? '';
});
writeFileSync(join(out, 'ground.png'), Buffer.from(png, 'base64'));
await browser.close();
console.log('ground.png 128×48');
