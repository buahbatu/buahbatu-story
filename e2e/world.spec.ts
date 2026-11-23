import { test as base } from '@playwright/test';
import { expect, test, watchConsole } from './fixtures';

test('masuk area sandbox: tanah, tebing & semua prop terbangun tanpa error', async ({ game: { page } }) => {
  const info = await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  expect(info).toEqual({ id: 'sandbox', width: 40, height: 30, props: { farmhouse: 1, fence: 2, tree: 13 } });
  expect(await page.evaluate(() => window.__BB__?.scene())).toBe('World');
});

test('pindah spawn di area yang sama tidak membangun ulang & tetap bersih', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  const info = await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
  expect(info?.props.tree).toBe(13);
});

for (const [area, spawn] of [
  ['sandbox', 'depan_rumah'],
  ['sandbox', 'bukit'],
  ['lembang', 'depan_toko_bibit'],
  ['lembang', 'depan_kandang'],
  ['buahbatu', 'depan_warung'],
  ['buahbatu', 'depan_rumah_michelle'],
] as const)
  test(`snapshot ${area} dari spawn ${spawn}`, async ({ game: { page } }) => {
    const info = await page.evaluate(([a, s]) => window.__BB__?.enterArea(a, s), [area, spawn] as const);
    expect(info?.id).toBe(area);
    await page.evaluate(() => window.__BB__?.freeze(true));
    await expect(page).toHaveScreenshot(area === 'sandbox' ? `world-${spawn}.png` : `world-${area}-${spawn}.png`);
  });

base('pratinjau ?area=sandbox langsung masuk dunia', async ({ page }) => {
  const problems: string[] = [];
  watchConsole(page, problems);
  await page.goto('/?area=sandbox');
  await page.waitForFunction(() => window.__BB__?.scene() === 'World');
  expect(problems).toEqual([]);
});

base('area yang tidak ada menampilkan pesan ramah, bukan layar kosong', async ({ page }) => {
  await page.goto('/?area=tidak_ada');
  await expect(page.locator('.fatal')).toHaveText('Area ini gagal dimuat. Coba muat ulang halaman, ya.');
});
