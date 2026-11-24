import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const prompt = (page: Page) => page.evaluate(() => window.__BB__?.prompt() ?? null);
const interactions = (page: Page) => page.evaluate(() => window.__BB__?.interactions() ?? []);

test('prompt muncul di dekat pintu & kasur, hilang saat menjauh, E mencatat interaksi', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('kos_a', 'pintu'));
  await expect.poll(() => prompt(page)).toMatchObject({ key: 'E', text: 'prompt.exit' });
  await expect(page.locator('.interact-prompt')).toHaveText('EKeluar');

  await page.evaluate(() => window.__BB__?.placePlayer(2.6, 2.2, 'w'));
  await expect.poll(() => prompt(page)).toMatchObject({ text: 'prompt.sleep' });
  await expect(page.locator('.interact-prompt')).toContainText('Tidur');
  await page.keyboard.press('KeyE');
  await expect.poll(() => interactions(page)).toMatchObject([{ kind: 'interact', action: 'bed', area: 'kos_a' }]);

  await page.evaluate(() => window.__BB__?.placePlayer(5, 3.4, 's'));
  await expect.poll(() => prompt(page)).toBeNull();
  await expect(page.locator('.interact-prompt')).toHaveCount(0);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(200);
  expect(await interactions(page)).toHaveLength(1);
});

test('prompt mengikuti objek di layar & label tombol dari pengaturan tombol', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox', 'depan_rumah');
    window.__BB__?.placePlayer(9.5, 10.2, 'n');
  });
  const p = await prompt(page);
  expect(p).toMatchObject({ key: 'E', text: 'prompt.enter' });
  expect(p?.x).toBeGreaterThan(0.3);
  expect(p?.x).toBeLessThan(0.7);
  expect(p?.y).toBeGreaterThan(0);
  expect(p?.y).toBeLessThan(0.6);
});

test('snapshot prompt interaksi di samping kasur', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('rumah_michelle', 'kamar_michelle');
    window.__BB__?.placePlayer(2.7, 2.4, 'w');
    window.__BB__?.freeze(true);
  });
  await expect(page.locator('.interact-prompt')).toContainText('Tidur');
  await expect(page).toHaveScreenshot('prompt-kasur.png');
});
