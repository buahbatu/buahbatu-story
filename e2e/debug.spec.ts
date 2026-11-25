import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const debug = (page: Page) => page.evaluate(() => window.__BB__?.debug() ?? null);

async function open(page: Page, query: string) {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__BB__ !== undefined);
  await page.evaluate(() => window.__BB__?.ready());
}

test('tanpa ?debug=1 tidak ada panel maupun overlay', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  await page.waitForTimeout(400);
  expect(await debug(page)).toEqual({ overlay: null, info: null });
  await expect(page.getByTestId('debug-panel')).toHaveCount(0);
});

test('?debug=1: FPS, posisi, kolisi & grid bisa dinyalakan/dimatikan', async ({ game: { page } }) => {
  await open(page, '?debug=1');
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(14.5, 25, 'w');
  });
  const panel = page.getByTestId('debug-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('FPS');
  await expect(panel).toContainText('Area sandbox');
  await expect.poll(async () => (await debug(page))?.info?.fps ?? 0).toBeGreaterThan(0);
  await expect.poll(async () => (await debug(page))?.info?.x).toBe(14.5);
  const overlay = (await debug(page))?.overlay;
  expect(overlay).toMatchObject({ gridVisible: true, collisionVisible: true });
  expect(overlay?.grid).toBeGreaterThan(1000);
  expect(overlay?.boxes).toBeGreaterThan(0);
  expect(overlay?.cliffs).toBeGreaterThan(0);
  expect(overlay?.deep).toBeGreaterThan(0);
  await panel.getByRole('button', { name: 'Grid' }).click();
  await expect.poll(async () => (await debug(page))?.overlay?.gridVisible).toBe(false);
  await panel.getByRole('button', { name: 'Kolisi' }).click();
  await expect.poll(async () => (await debug(page))?.overlay?.collisionVisible).toBe(false);
  await panel.getByRole('button', { name: 'Kolisi' }).click();
  await expect.poll(async () => (await debug(page))?.overlay?.collisionVisible).toBe(true);
});

test('overlay ikut dibangun ulang saat pindah area', async ({ game: { page } }) => {
  await open(page, '?debug=1');
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  const a = (await debug(page))?.overlay?.grid;
  await page.evaluate(() => window.__BB__?.enterArea('kos_a'));
  await expect.poll(async () => (await debug(page))?.overlay?.grid).not.toBe(a);
  await expect(page.getByTestId('debug-panel')).toContainText('Area kos_a');
});

test('snapshot mode debug', async ({ game: { page } }) => {
  await open(page, '?debug=1');
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(14.5, 22.5, 's');
  });
  await expect.poll(async () => (await debug(page))?.info?.y).toBe(22.5);
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('debug-overlay.png', { mask: [page.locator('.debug-panel')] });
});
