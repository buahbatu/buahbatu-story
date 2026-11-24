import { expect, test } from './fixtures';

test('tombol B membuat pemain melompat lalu mendarat, bisa sambil berjalan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  const start = await page.evaluate(() => window.__BB__?.player());
  await page.keyboard.down('KeyD');
  await page.keyboard.press('KeyB');
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.player()))?.anim, { timeout: 5_000 }).toBe('jump');
  const air = await page.evaluate(() => window.__BB__?.player());
  expect(air?.air).toBeGreaterThanOrEqual(0);
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.player()))?.anim, { timeout: 5_000 }).toBe('walk');
  await page.keyboard.up('KeyD');
  const landed = await page.evaluate(() => window.__BB__?.player());
  expect(landed?.air).toBeUndefined();
  expect(landed?.x).toBeGreaterThan(start?.x ?? 0);
});

test('lompat tidak membuat pemain menembus rumah', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('KeyB');
    await page.waitForTimeout(600);
  }
  await page.keyboard.up('KeyW');
  expect((await page.evaluate(() => window.__BB__?.player()))?.y).toBeGreaterThan(9.4);
});
