import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);
const watchCards = (page: Page) =>
  page.evaluate(() => {
    const seen: string[] = [];
    Object.assign(window, { __cards: seen });
    new MutationObserver(() => {
      const el = document.querySelector('.fade-overlay.on .travel-place');
      const dots = document.querySelectorAll('.fade-overlay.on .travel-dots i').length;
      const text = el ? `${el.textContent}:${String(dots)}` : null;
      if (text && seen.at(-1) !== text) seen.push(text);
    }).observe(document.body, { childList: true, subtree: true, attributes: true });
  });
const cards = (page: Page) => page.evaluate(() => (window as unknown as { __cards: string[] }).__cards);
const trips = async (page: Page) => (await page.evaluate(() => window.__BB__?.travel()))?.trips ?? 0;

test('pintu rumah Michelle: masuk dengan E (fade), keluar lagi ke depan rumah', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'depan_rumah_michelle'));
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.enter');
  await expect
    .poll(async () => (await page.evaluate(() => window.__BB__?.travel()))?.preloaded, { timeout: 10_000 })
    .toContain('rumah_michelle');
  await watchCards(page);
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await player(page))?.area, { timeout: 10_000 }).toBe('rumah_michelle');
  await expect(page.locator('.fade-overlay.on')).toHaveCount(0);
  await expect(page.locator('.travel-card')).toHaveCount(0);
  expect(await trips(page)).toBe(1);

  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.exit');
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await player(page))?.area, { timeout: 10_000 }).toBe('buahbatu');
  await expect.poll(() => trips(page)).toBe(2);
  expect(await cards(page)).toEqual(['Rumah Michelle:3', 'Buahbatu:3']);
});

test('layar transisi: nama tempat + animasi loading', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'depan_rumah_michelle'));
  await page.evaluate(() => {
    window.__BB__?.freeze(true);
    window.__BB__?.travelCard('rumah_michelle');
  });
  await expect(page.locator('.fade-overlay.on .travel-place')).toHaveText('Rumah Michelle');
  await expect(page).toHaveScreenshot('transisi-rumah-michelle.png', { animations: 'disabled' });
  await page.evaluate(() => window.__BB__?.travelCard(null));
  await expect(page.locator('.travel-card')).toHaveCount(0);
});

test('di dalam rumah: penanda pintu keluar & dinding depan rendah', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('rumah_michelle', 'pintu'));
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.exit');
  await page.evaluate(() => {
    window.__BB__?.placePlayer(7.5, 5, 'n');
    window.__BB__?.freeze(true);
  });
  await expect(page).toHaveScreenshot('interior-pintu-keluar.png');
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
  await expect(page.locator('.travel-card')).toHaveCount(0);
  expect((await player(page))?.area).toBe('kos_a');
});
