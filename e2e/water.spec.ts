import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const water = (page: Page) => page.evaluate(() => window.__BB__?.water() ?? null);
const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

test('nyebur ke air dangkal: cipratan, basah, berhenti sebelum air dalam, menetes setelah naik', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(31, 16.5, 's');
  });
  const before = (await water(page))?.splashes ?? 0;
  expect(await water(page)).toMatchObject({ inWater: false, wetness: 0 });

  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await water(page))?.inWater, { timeout: 10_000 }).toBe(true);
  expect((await water(page))?.splashes).toBe(before + 1);
  await page.waitForTimeout(1500);
  await page.keyboard.up('KeyS');
  const wading = await player(page);
  expect(wading?.y).toBeGreaterThan(19);
  expect(wading?.y).toBeLessThan(20);
  expect((await water(page))?.wetness).toBe(1);

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await water(page))?.inWater, { timeout: 10_000 }).toBe(false);
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await water(page))?.particles ?? 0, { timeout: 5_000 }).toBeGreaterThan(0);
  const dripping = await water(page);
  expect(dripping?.wetness).toBeLessThan(1);
  expect(dripping?.wetness).toBeGreaterThan(0);
});

test('berjalan di air lebih lambat daripada di darat', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(28.5, 19.5, 'e');
  });
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(150);
  const sample = () => page.evaluate(() => ({ x: window.__BB__?.player()?.x ?? 0, t: window.__BB__?.clock() ?? 0 }));
  const a = await sample();
  await page.waitForTimeout(500);
  const b = await sample();
  await page.keyboard.up('KeyD');
  const speed = (b.x - a.x) / (b.t - a.t);
  expect(speed).toBeGreaterThan(1);
  expect(speed).toBeLessThan(2.2);
});

test('snapshot pemain terendam & basah di air dangkal', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(30.5, 19.5, 's');
  });
  await expect.poll(async () => (await water(page))?.inWater, { timeout: 5_000 }).toBe(true);
  const t0 = await page.evaluate(() => window.__BB__?.clock() ?? 0);
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.clock() ?? 0)) - t0, { timeout: 60_000 }).toBeGreaterThan(2);
  await expect.poll(async () => (await water(page))?.particles ?? 1, { timeout: 30_000 }).toBe(0);
  await expect.poll(async () => (await water(page))?.ripples ?? 1, { timeout: 30_000 }).toBe(0);
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('air-terendam-basah.png');
});
