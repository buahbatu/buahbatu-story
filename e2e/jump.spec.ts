import { expect, test } from './fixtures';

test('tombol Spasi membuat pemain melompat lalu mendarat, bisa sambil berjalan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  const start = await page.evaluate(() => window.__BB__?.player());
  await page.keyboard.down('KeyD');
  await page.keyboard.press('Space');
  await expect
    .poll(
      async () => {
        const p = await page.evaluate(() => window.__BB__?.player());
        return p?.anim === 'jump' && typeof p.air === 'number' && p.air >= 0;
      },
      { timeout: 5_000 },
    )
    .toBe(true);
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
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);
  }
  await page.keyboard.up('KeyW');
  expect((await page.evaluate(() => window.__BB__?.player()))?.y).toBeGreaterThan(9.4);
});
