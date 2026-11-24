import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);
const trips = async (page: Page) => (await page.evaluate(() => window.__BB__?.travel()))?.trips ?? 0;

test('pintu rumah Michelle: masuk dengan E (fade), keluar lagi ke depan rumah', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'depan_rumah_michelle'));
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.enter');
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await player(page))?.area, { timeout: 10_000 }).toBe('rumah_michelle');
  await expect(page.locator('.fade-overlay.on')).toHaveCount(0);
  expect(await trips(page)).toBe(1);

  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.exit');
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await player(page))?.area, { timeout: 10_000 }).toBe('buahbatu');
  expect(await trips(page)).toBe(2);
});

test('tepi peta ke area yang belum dibuat: pesan ramah sekali, tetap di area', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('lembang');
    window.__BB__?.placePlayer(46.5, 19, 'e');
  });
  await page.keyboard.down('KeyD');
  await expect(page.locator('.toast')).toHaveText('Tempat ini belum dibuka. Sabar ya, lagi dibangun!', { timeout: 10_000 });
  await page.waitForTimeout(800);
  await page.keyboard.up('KeyD');
  await expect(page.locator('.toast')).toHaveCount(1);
  expect((await player(page))?.area).toBe('lembang');
  expect(await trips(page)).toBe(0);
});

test('pintu kos ke Dago (belum dibuat) juga memberi pesan ramah', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('kos_a', 'pintu'));
  await page.keyboard.press('KeyE');
  await expect(page.locator('.toast')).toHaveText('Tempat ini belum dibuka. Sabar ya, lagi dibangun!', { timeout: 10_000 });
  expect((await player(page))?.area).toBe('kos_a');
});
