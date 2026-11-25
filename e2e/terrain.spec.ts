import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);
const groundAtPlayer = (page: Page) =>
  page.evaluate(() => {
    const p = window.__BB__?.player();
    return p ? (window.__BB__?.ground(p.x, p.y) ?? null) : null;
  });

function track(page: Page, axis: 'x' | 'y', until: number) {
  return page.evaluate(
    ([a, limit]) =>
      new Promise<{ max: number; min: number; end: number }>((resolve) => {
        let max = -Infinity;
        let min = Infinity;
        const deadline = performance.now() + 20_000;
        const step = () => {
          const p = window.__BB__?.player();
          const g = p ? (window.__BB__?.ground(p.x, p.y) ?? 0) : 0;
          max = Math.max(max, g);
          min = Math.min(min, g);
          if ((p?.[a] ?? 0) > limit || performance.now() > deadline) resolve({ max, min, end: g });
          else requestAnimationFrame(step);
        };
        step();
      }),
    [axis, until] as const,
  );
}

test('naik bukit landai lalu turun lagi tanpa tersangkut', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(32.3, 7.5, 'e');
  });
  expect(await groundAtPlayer(page)).toBeLessThan(0.1);
  const walk = track(page, 'x', 39.55);
  await page.keyboard.down('KeyD');
  const r = await walk;
  await page.keyboard.up('KeyD');
  expect(r.max).toBeGreaterThan(1.1);
  expect(r.end).toBeLessThan(0.1);
  expect((await player(page))?.x).toBeGreaterThan(39.55);
});

test('turun ke lembah dan naik keluar lagi', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(23, 23.6, 's');
  });
  const walk = track(page, 'y', 28.6);
  await page.keyboard.down('KeyS');
  const r = await walk;
  await page.keyboard.up('KeyS');
  expect(r.min).toBeLessThan(-0.5);
  expect(Math.abs(r.end)).toBeLessThan(0.1);
  expect((await player(page))?.y).toBeGreaterThan(28.6);
});

test('pohon di atas bukit berdiri di permukaan lereng', async ({ game: { page } }) => {
  const sunk = await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    return window.__BB__?.ground(36.5, 3.5) ?? 0;
  });
  expect(sunk).toBeGreaterThan(0.05);
});

for (const [area, x, y, facing] of [
  ['sandbox', 31, 14, 'n'],
  ['lembang', 17.5, 16.6, 'n'],
] as const)
  test(`snapshot kontur ${area}`, async ({ game: { page } }) => {
    await page.evaluate(
      async ([a, px, py, f]) => {
        await window.__BB__?.enterArea(a);
        window.__BB__?.placePlayer(px, py, f);
        window.__BB__?.setCamera({ zoom: 1.5, yaw: -0.5 });
        window.__BB__?.freeze(true);
      },
      [area, x, y, facing] as const,
    );
    await expect(page).toHaveScreenshot(`kontur-${area}.png`);
  });
