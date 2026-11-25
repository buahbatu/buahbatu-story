import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

test('menyeberang jembatan kayu Lembang lewat jalan utama, berdiri di lantai jembatan', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('lembang');
    window.__BB__?.placePlayer(22.5, 19, 'e');
  });
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await player(page))?.x ?? 0, { timeout: 15_000 }).toBeGreaterThan(25.8);
  expect(await page.evaluate(() => window.__BB__?.ground(26, 19) ?? null)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__BB__?.ground(26, 21.5) ?? null)).toBeLessThan(0);
  await expect.poll(async () => (await player(page))?.x ?? 0, { timeout: 15_000 }).toBeGreaterThan(28.5);
  await page.keyboard.up('KeyD');
  expect((await page.evaluate(() => window.__BB__?.water()))?.inWater).toBe(false);
});

test('pagar jembatan menahan pemain supaya tidak tercebur dari samping', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('lembang');
    window.__BB__?.placePlayer(25.9, 19, 'n');
  });
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1500);
  await page.keyboard.up('KeyW');
  expect((await player(page))?.y).toBeGreaterThan(18.1);
});

for (const [name, area, x, y, yaw, zoom] of [
  ['jembatan-kayu', 'lembang', 26, 19, 0.6, 1.3],
  ['jembatan-beton', 'sandbox', 34.4, 27, -0.4, 1.3],
] as const)
  test(`snapshot ${name}`, async ({ game: { page } }) => {
    await page.evaluate(
      async ([a, px, py, cy, cz]) => {
        await window.__BB__?.enterArea(a);
        window.__BB__?.placePlayer(px, py, 'n');
        window.__BB__?.setCamera({ yaw: cy, zoom: cz });
        window.__BB__?.freeze(true);
      },
      [area, x, y, yaw, zoom] as const,
    );
    await expect(page).toHaveScreenshot(`${name}.png`);
  });
