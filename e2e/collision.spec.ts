import type { Page } from '@playwright/test';
import { PLAYER } from '../src/config/balance';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

async function walk(page: Page, keys: string[], ms: number) {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
  return player(page);
}

test('pemain tidak menembus rumah, berhenti tepat di depan dinding', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await player(page))?.y ?? 99, { timeout: 10_000 }).toBeLessThan(10.2);
  await page.waitForTimeout(800);
  const p = await player(page);
  await page.keyboard.up('KeyW');
  expect(p?.y).toBeGreaterThanOrEqual(9.4 + PLAYER.radius - 0.01);
});

test('pemain tidak bisa berjalan ke bagian kolam yang dalam', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(31, 16.5, 's');
  });
  const edge = 20 - PLAYER.radius;
  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await player(page))?.y ?? 0, { timeout: 20_000 }).toBeGreaterThan(edge - 0.05);
  await page.waitForTimeout(800);
  const q = await player(page);
  await page.keyboard.up('KeyS');
  expect(q?.y).toBeLessThanOrEqual(edge + 1e-6);
});

test('tebing menghalangi, tangga batu membawa pemain naik ke dataran tinggi', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(14.5, 25, 'w');
  });
  const blocked = await walk(page, ['KeyA'], 1200);
  expect(blocked?.x).toBeGreaterThan(12);
  await page.evaluate(() => window.__BB__?.placePlayer(16, 21, 'w'));
  await page.keyboard.down('KeyA');
  await expect.poll(async () => (await player(page))?.x ?? 99, { timeout: 10_000 }).toBeLessThan(11.5);
  await page.keyboard.up('KeyA');
});

test('pohon di antara kamera & pemain memudar supaya pemain tetap terlihat', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(14.5, 22.4, 's');
    window.__BB__?.freeze(true);
  });
  expect(await page.evaluate(() => window.__BB__?.occluding())).toContain('prop:tree');
  await expect(page).toHaveScreenshot('collision-pohon-memudar.png');
  await page.evaluate(() => {
    window.__BB__?.freeze(false);
    window.__BB__?.placePlayer(20.5, 17.5, 's');
  });
  await expect.poll(() => page.evaluate(() => window.__BB__?.occluding())).toEqual([]);
});
