import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const graphics = (page: Page) => page.evaluate(() => window.__BB__?.graphics() ?? null);
const choice = (page: Page, setting: string, value: string) =>
  page.locator(`.settings-choice[data-setting="${setting}"][data-value="${value}"]`);

test('menu grafis di layar judul: buka tanpa memulai game, ganti lengkung, tersimpan setelah muat ulang', async ({ game: { page } }) => {
  await page.locator('.settings-button').click();
  await expect(page.getByRole('dialog', { name: 'Pengaturan Grafis' })).toBeVisible();
  await page.keyboard.press('KeyA');
  expect(await page.evaluate(() => window.__BB__?.scene())).toBe('Title');
  await expect(choice(page, 'curve', 'soft')).toHaveAttribute('aria-pressed', 'true');
  await choice(page, 'curve', 'strong').click();
  await expect(choice(page, 'curve', 'strong')).toHaveAttribute('aria-pressed', 'true');
  expect((await graphics(page))?.curve).toBe('strong');
  await expect.poll(async () => (await graphics(page))?.bend ?? 0, { timeout: 15_000 }).toBeGreaterThan(0.012);
  expect(await page.evaluate(() => localStorage.getItem('bb.graphics'))).toContain('"curve":"strong"');
  await page.keyboard.press('Escape');
  await expect(page.locator('.settings-panel')).toHaveCount(0);
  await page.reload();
  await page.waitForFunction(() => window.__BB__ !== undefined);
  await page.evaluate(() => window.__BB__?.ready());
  expect(await graphics(page)).toMatchObject({ curve: 'strong' });
});

test('menu grafis di dunia: tombol tidak menggerakkan pemain, kualitas & efek berlaku langsung', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox', 'start');
  });
  const before = await page.evaluate(() => window.__BB__?.player());
  await page.locator('.settings-button').click();
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(600);
  await page.keyboard.up('KeyD');
  const after = await page.evaluate(() => window.__BB__?.player());
  expect(after?.x).toBeCloseTo(before?.x ?? 0, 3);
  await choice(page, 'tier', 'low').click();
  await expect.poll(async () => (await graphics(page))?.tier).toBe('low');
  expect(await page.evaluate(() => document.documentElement.dataset.gfx)).toBe('low');
  expect((await page.evaluate(() => window.__BB__?.view()))?.ratio).toBeLessThanOrEqual(1);
  await choice(page, 'fx', 'true').click();
  await expect
    .poll(async () => (await page.evaluate(() => window.__BB__?.lighting()))?.passes, { timeout: 20_000 })
    .toEqual(['scene', 'bloom+grade']);
  await choice(page, 'fx', 'false').click();
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.lighting()))?.passes).toEqual([]);
  await page.locator('.settings-close').click();
  await expect(page.locator('.settings-panel')).toHaveCount(0);
});

test('lengkung otomatis datar di dalam rumah, kembali melengkung di luar', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('rumah_michelle', 'pintu'));
  expect((await graphics(page))?.bend).toBe(0);
  await page.evaluate(() => window.__BB__?.enterArea('lembang', 'start'));
  expect((await graphics(page))?.bend).toBeGreaterThan(0);
});

test('snapshot menu pengaturan grafis', async ({ game: { page } }) => {
  await page.locator('.settings-button').click();
  await expect(page.locator('.settings-panel')).toBeVisible();
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('menu-grafis.png', { mask: [page.locator('.version-badge')] });
});

for (const curve of ['strong', 'off'] as const)
  test(`snapshot Lembang lengkung ${curve}`, async ({ game: { page } }, info) => {
    test.skip(info.project.name !== 'desktop', 'pembanding cukup di desktop');
    await page.evaluate(async (c) => {
      await window.__BB__?.setGraphics({ curve: c });
      await window.__BB__?.enterArea('lembang', 'start');
      window.__BB__?.setCamera({ zoom: 1.6 });
      window.__BB__?.freeze(true);
    }, curve);
    await expect(page).toHaveScreenshot(`lembang-lengkung-${curve}.png`);
  });
