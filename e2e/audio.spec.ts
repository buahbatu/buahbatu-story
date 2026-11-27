import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const audio = (page: Page) => page.evaluate(() => window.__BB__?.audio() ?? null);
const played = async (page: Page, prefix: string) =>
  Object.entries((await audio(page))?.played ?? {})
    .filter(([id]) => id.startsWith(prefix))
    .reduce((n, [, c]) => n + c, 0);

test('tab Suara: matikan efek suara & ubah volume, langsung tersimpan dan bertahan setelah muat ulang', async ({ game: { page } }) => {
  await page.locator('.settings-button').click();
  await page.locator('.settings-tab[data-tab="audio"]').click();
  await expect(page.locator('.settings-tab[data-tab="audio"]')).toHaveAttribute('aria-selected', 'true');
  const toggle = page.locator('[data-audio-toggle="sfx"]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.settings-volume[data-audio="sfx"]')).toBeDisabled();
  await page.locator('.settings-volume[data-audio="ambience"]').fill('40');
  await expect.poll(async () => (await audio(page))?.settings.ambience.volume).toBeCloseTo(0.4);
  expect((await audio(page))?.settings.sfx.on).toBe(false);
  await page.reload();
  await page.waitForFunction(() => window.__BB__ !== undefined);
  await page.evaluate(() => window.__BB__?.ready());
  expect((await audio(page))?.settings).toMatchObject({ sfx: { on: false }, ambience: { volume: 0.4 } });
});

test('audio aktif setelah interaksi pertama; klik tombol UI berbunyi', async ({ game: { page } }) => {
  expect((await audio(page))?.unlocked).toBe(false);
  await page.locator('.settings-button').click();
  await expect.poll(async () => (await audio(page))?.unlocked, { timeout: 10_000 }).toBe(true);
  await page.locator('.settings-close').click();
  await expect.poll(async () => (await audio(page))?.played.ui_click ?? 0).toBeGreaterThan(0);
  expect(['ogg', 'm4a']).toContain((await audio(page))?.format);
});

test('langkah kaki berbunyi mengikuti permukaan: langkah darat, cipratan di air dangkal', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(31, 16.5, 's');
  });
  await page.keyboard.press('KeyQ');
  await expect.poll(async () => (await audio(page))?.unlocked, { timeout: 10_000 }).toBe(true);
  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await played(page, 'step_')) - (await played(page, 'step_water')), { timeout: 15_000 }).toBeGreaterThan(0);
  await page.keyboard.up('KeyS');
  await page.evaluate(() => window.__BB__?.placePlayer(28.5, 19.5, 'e'));
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.water()))?.inWater, { timeout: 10_000 }).toBe(true);
  await page.keyboard.down('KeyD');
  await expect.poll(() => played(page, 'step_water'), { timeout: 15_000 }).toBeGreaterThan(0);
  await page.keyboard.up('KeyD');
  const still = await played(page, 'step_');
  await page.waitForTimeout(800);
  expect(await played(page, 'step_')).toBe(still);
});

test('gemericik sungai makin keras saat mendekat, curug terdengar di dekat air terjun', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('lembang', 'start'));
  await page.keyboard.press('KeyQ');
  await expect.poll(async () => (await audio(page))?.unlocked, { timeout: 10_000 }).toBe(true);
  const level = async (id: string) => (await audio(page))?.loops[id] ?? 0;
  const place = (x: number, y: number) => page.evaluate(([px, py]) => window.__BB__?.placePlayer(px, py, 's'), [x, y] as const);
  await place(40.5, 30.5);
  await expect.poll(() => level('amb_stream'), { timeout: 10_000 }).toBeLessThan(0.1);
  expect(await level('amb_waterfall')).toBeLessThan(0.1);
  await place(23.5, 18.5);
  await expect.poll(() => level('amb_stream'), { timeout: 10_000 }).toBeGreaterThan(0.6);
  await place(15, 5.5);
  await expect.poll(() => level('amb_waterfall'), { timeout: 10_000 }).toBeGreaterThan(0.6);
});

test('kolam taman Buahbatu bunyi riak tenang, bukan gemericik sungai', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'start'));
  await page.keyboard.press('KeyQ');
  await expect.poll(async () => (await audio(page))?.unlocked, { timeout: 10_000 }).toBe(true);
  await page.evaluate(() => window.__BB__?.placePlayer(39.5, 28.5, 's'));
  await expect.poll(async () => (await audio(page))?.loops.amb_pond ?? 0, { timeout: 10_000 }).toBeGreaterThan(0.3);
  expect((await audio(page))?.loops.amb_stream ?? 0).toBe(0);
});

test('musik: lagu judul di layar judul, lalu berganti mengikuti jam di dunia', async ({ game: { page } }) => {
  const music = async () => (await audio(page))?.music;
  await page.locator('.settings-button').click();
  await page.locator('.settings-close').click();
  await expect.poll(async () => (await music())?.mood, { timeout: 10_000 }).toBe('title');
  await expect.poll(async () => (await music())?.playing, { timeout: 15_000 }).toBe(true);
  expect((await music())?.track).toBe('title');
  await page.evaluate(() => window.__BB__?.enterArea('lembang', 'start'));
  await expect.poll(async () => (await music())?.mood, { timeout: 10_000 }).toBe('day');
  expect(['day_fields', 'day_shepherd']).toContain((await music())?.track);
  await page.evaluate(() => window.__BB__?.setHour(17.5));
  await expect.poll(async () => (await music())?.track, { timeout: 10_000 }).toBe('evening_pastoral');
  await page.evaluate(() => window.__BB__?.setHour(22));
  await expect.poll(async () => (await music())?.track, { timeout: 10_000 }).toBe('night_bedtime');
  await expect.poll(async () => (await music())?.playing, { timeout: 15_000 }).toBe(true);
});

test('snapshot tab Suara', async ({ game: { page } }) => {
  await page.locator('.settings-button').click();
  await page.locator('.settings-tab[data-tab="audio"]').click();
  await expect(page.locator('.settings-volume')).toHaveCount(4);
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('menu-suara.png', { mask: [page.locator('.version-badge')] });
});
