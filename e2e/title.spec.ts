import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const area = (page: Page) => page.evaluate(() => window.__BB__?.player()?.area ?? null);

test('logo judul: huruf, papan STORY, hiasan & ajakan mulai tampil tanpa menutupi tagline', async ({ game: { page } }) => {
  const logo = page.locator('.logo');
  await expect(logo).toHaveAttribute('aria-label', 'Buahbatu Story');
  await expect(page.locator('.logo-glyph')).toHaveCount(8);
  await expect(page.locator('.logo-plank')).toHaveText('Story');
  await expect(page.locator('.logo-deco')).toHaveCount(9);
  const box = await logo.boundingBox();
  const tagline = await page.locator('.title-tagline').boundingBox();
  const start = await page.locator('.title-start').boundingBox();
  const view = page.viewportSize();
  expect(box && tagline && start && view).toBeTruthy();
  if (!box || !tagline || !start || !view) return;
  expect(box.y + box.height).toBeLessThanOrEqual(tagline.y + 1);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(view.width);
  expect(start.y + start.height).toBeLessThanOrEqual(view.height);
});

test('tekan tombol apa saja → masuk Buahbatu', async ({ game: { page } }, info) => {
  test.skip(info.project.name !== 'desktop', 'keyboard di desktop');
  await expect(page.locator('.title-start')).toHaveText('Tekan tombol apa saja');
  await page.keyboard.press('KeyK');
  await expect.poll(() => area(page), { timeout: 15_000 }).toBe('buahbatu');
  await expect(page.locator('.title-overlay')).toHaveCount(0);
});

test('HP: ketuk layar → masuk Buahbatu', async ({ game: { page } }, info) => {
  test.skip(info.project.name === 'desktop', 'sentuhan di HP');
  await expect(page.locator('.title-start')).toHaveText('Ketuk layar untuk mulai');
  await page.touchscreen.tap(200, 150);
  await expect.poll(() => area(page), { timeout: 15_000 }).toBe('buahbatu');
});

test('karakter A & Michelle berdiri di layar judul', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page.locator('.title-overlay')).toBeVisible();
  await expect(page).toHaveScreenshot('judul-logo.png', { mask: [page.locator('.version-badge')] });
});

test('setelah masuk dunia, tombol & ketukan tidak memicu "mulai" lagi (tidak kembali ke Buahbatu)', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('lembang'));
  await page.keyboard.press('KeyK');
  await page.mouse.click(300, 200);
  await page.waitForTimeout(1500);
  expect(await area(page)).toBe('lembang');
  expect((await page.evaluate(() => window.__BB__?.travel()))?.trips).toBe(0);
});

test('logo tetap emas & terbaca saat animasi berjalan (bukan hanya saat gerak dikurangi)', async ({ game: { page } }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await page.waitForFunction(() => window.__BB__ !== undefined);
  await page.evaluate(() => window.__BB__?.ready());
  await page.waitForTimeout(1500);
  expect(
    await page
      .locator('.logo-glyph')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(
    await page
      .locator('.logo-bob')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('logo-wave');
  const clip = await page.locator('.logo-word').boundingBox();
  expect(clip).not.toBeNull();
  const shot = (await page.screenshot({ animations: 'allow', ...(clip ? { clip } : {}) })).toString('base64');
  const gold = await page.evaluate(async (data) => {
    const blob = await (await fetch(`data:image/png;base64,${data}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.drawImage(bitmap, 0, 0);
    const px = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let hits = 0;
    for (let i = 0; i < px.length; i += 4) {
      const [r = 0, g = 0, b = 0] = [px[i], px[i + 1], px[i + 2]];
      if (r > 220 && g > 150 && b < 170) hits++;
    }
    return hits / (px.length / 4);
  }, shot);
  expect(gold).toBeGreaterThan(0.12);
});
