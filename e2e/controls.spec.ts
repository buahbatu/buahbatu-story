import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const camera = (page: Page) => page.evaluate(() => window.__BB__?.camera() ?? null);

async function dragMiddle(page: Page, dx: number, ctrl = false) {
  const box = await page.locator('#game canvas').boundingBox();
  const x = (box?.x ?? 0) + (box?.width ?? 800) / 2;
  const y = (box?.y ?? 0) + (box?.height ?? 600) / 2;
  await page.mouse.move(x, y);
  if (ctrl) await page.keyboard.down('Control');
  await page.mouse.down({ button: ctrl ? 'left' : 'middle' });
  await page.mouse.move(x + dx, y, { steps: 6 });
  await page.mouse.up({ button: ctrl ? 'left' : 'middle' });
  if (ctrl) await page.keyboard.up('Control');
}

test.describe('kamera dengan mouse', () => {
  test.skip(({ isMobile }) => isMobile, 'mouse hanya di desktop');

  test('seret tombol tengah & Ctrl + seret kiri memutar kamera', async ({ game: { page } }) => {
    await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
    const start = (await camera(page))?.yaw ?? 0;
    await dragMiddle(page, 200);
    await expect.poll(async () => Math.abs(((await camera(page))?.yaw ?? 0) - start)).toBeGreaterThan(0.5);
    const mid = (await camera(page))?.yaw ?? 0;
    await dragMiddle(page, -150, true);
    await expect.poll(async () => Math.abs(((await camera(page))?.yaw ?? 0) - mid)).toBeGreaterThan(0.5);
  });

  test('di dalam rumah kamera tetap terkunci', async ({ game: { page } }) => {
    await page.evaluate(() => window.__BB__?.enterArea('rumah_michelle', 'pintu'));
    await dragMiddle(page, 250);
    await page.waitForTimeout(300);
    expect((await camera(page))?.yaw).toBe(0);
  });
});

test('petunjuk kontrol muncul sekilas saat masuk dunia, hilang sendiri, bisa dibuka lagi lewat tombol ?', async ({ game: { page } }) => {
  await page.goto('/?hint');
  await page.waitForFunction(() => window.__BB__ !== undefined);
  await page.evaluate(() => window.__BB__?.ready());
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  const hint = page.getByRole('dialog', { name: 'Kontrol' });
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('Putar kamera');
  await expect(hint).toBeHidden({ timeout: 20_000 });
  await page.locator('.help-button').click();
  await expect(hint).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(hint).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(hint).toBeHidden();
});

test('petunjuk menyesuaikan perangkat & menandai kamera terkunci di dalam rumah', async ({ game: { page }, isMobile }, info) => {
  await page.evaluate(() => window.__BB__?.enterArea('rumah_michelle', 'pintu'));
  if (isMobile) await page.locator('.help-button').tap();
  else await page.locator('.help-button').click();
  const hint = page.getByRole('dialog', { name: 'Kontrol' });
  await expect(hint).toContainText('terkunci di dalam rumah');
  if (info.project.name === 'desktop') await expect(hint).toContainText('Q / R');
  else await expect(hint).toContainText('putar dua jari');
});

test('snapshot petunjuk kontrol', async ({ game: { page }, isMobile }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  if (isMobile) await page.locator('.help-button').tap();
  else await page.locator('.help-button').click();
  await expect(page.locator('.controls-hint')).toBeVisible();
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('petunjuk-kontrol.png');
});
