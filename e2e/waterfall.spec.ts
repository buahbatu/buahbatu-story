import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

test('curug Lembang: dua air terjun terbangun tanpa error', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('lembang'));
  expect((await page.evaluate(() => window.__BB__?.water()))?.waterfalls).toBe(2);
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  expect((await page.evaluate(() => window.__BB__?.water()))?.waterfalls).toBe(0);
});

test('sungai di dataran atas: bisa diarungi, tapi tidak bisa ikut jatuh lewat tebing air terjun', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('lembang');
    window.__BB__?.placePlayer(14.6, 5.2, 's');
  });
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.water()))?.inWater).toBe(true);
  const ground = await page.evaluate(() => window.__BB__?.ground(14.6, 5.2) ?? null);
  expect(ground).toBeGreaterThan(0.3);
  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await player(page))?.y ?? 0, { timeout: 15_000 }).toBeGreaterThan(7.3);
  await page.waitForTimeout(1000);
  const p = await player(page);
  await page.keyboard.up('KeyS');
  expect(p?.y).toBeLessThan(8);
});

for (const [name, x, y, yaw, zoom] of [
  ['curug-lembang', 15.6, 13.2, 0, 1.35],
  ['curug-samping', 19.5, 11.5, 0.6, 1.1],
  ['sungai-keluar-peta', 3, 11.2, -0.7, 1.6],
] as const)
  test(`snapshot ${name}`, async ({ game: { page } }) => {
    await page.evaluate(
      async ([px, py, cy, cz]) => {
        await window.__BB__?.enterArea('lembang');
        window.__BB__?.placePlayer(px, py, 'n');
        window.__BB__?.setCamera({ yaw: cy, zoom: cz });
        window.__BB__?.freeze(true);
      },
      [x, y, yaw, zoom] as const,
    );
    await expect(page).toHaveScreenshot(`${name}.png`);
  });
