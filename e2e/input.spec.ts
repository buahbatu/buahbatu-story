import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const actions = (page: Page) => page.evaluate(() => window.__BB__?.actions());

test('tombol keyboard → Action & vektor gerak diagonal ternormalisasi', async ({ game: { page } }) => {
  await page.keyboard.down('KeyW');
  await page.keyboard.down('KeyD');
  await page.keyboard.down('ShiftLeft');
  expect(await actions(page)).toEqual(['up', 'right', 'run']);
  const move = await page.evaluate(() => window.__BB__?.move());
  expect(move?.x).toBeCloseTo(Math.SQRT1_2);
  expect(move?.y).toBeCloseTo(-Math.SQRT1_2);
  for (const key of ['KeyW', 'KeyD', 'ShiftLeft']) await page.keyboard.up(key);
  expect(await actions(page)).toEqual([]);
});

test('Tab & Spasi milik game: tidak memindah fokus atau menggulir halaman', async ({ game: { page } }) => {
  await page.evaluate(() => {
    window.addEventListener('keydown', (e) => {
      document.body.setAttribute('data-last-prevented', String(e.defaultPrevented));
    });
  });
  for (const key of ['Tab', 'Space', 'ArrowDown']) {
    await page.keyboard.press(key);
    expect(await page.evaluate(() => document.body.dataset.lastPrevented), key).toBe('true');
  }
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.keyboard.press('KeyQ');
  expect(await page.evaluate(() => document.body.dataset.lastPrevented)).toBe('false');
});

test('jendela kehilangan fokus melepas semua tombol (karakter tidak jalan sendiri)', async ({ game: { page } }) => {
  await page.keyboard.down('KeyA');
  expect(await actions(page)).toEqual(['left']);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  expect(await actions(page)).toEqual([]);
  await page.keyboard.up('KeyA');
});

test('mengetik di kolom teks tidak menggerakkan game', async ({ game: { page } }) => {
  await page.evaluate(() => {
    const field = document.createElement('input');
    field.id = 'ketik';
    document.body.append(field);
  });
  await page.locator('#ketik').fill('');
  await page.locator('#ketik').pressSequentially('wasd e');
  await expect(page.locator('#ketik')).toHaveValue('wasd e');
  expect(await actions(page)).toEqual([]);
});
