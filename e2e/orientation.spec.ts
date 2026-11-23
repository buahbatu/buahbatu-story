import { expect, test, watchConsole } from './fixtures';

test('HP tegak: game tidak tampil, hanya ajakan putar HP; diputar → game jalan', async ({ page }) => {
  const problems: string[] = [];
  watchConsole(page, problems);
  await page.goto('/');
  await expect(page.locator('.rotate-hint')).toBeVisible();
  await expect(page.locator('.rotate-title')).toHaveText('Putar HP kamu');
  await expect(page.locator('#stage')).toBeHidden();
  await expect(page).toHaveScreenshot('rotate-hint.png', { animations: 'disabled' });
  const size = page.viewportSize() ?? { width: 360, height: 780 };
  await page.setViewportSize({ width: size.height, height: size.width });
  await expect(page.locator('.rotate-hint')).toBeHidden();
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.waitForFunction(() => window.__BB__?.scene() === 'Title', null, { timeout: 30_000 });
  await expect(page.locator('.version-badge')).toBeVisible();
  expect(problems).toEqual([]);
});
