import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const lighting = (page: Page) => page.evaluate(() => window.__BB__?.lighting() ?? null);

test('cahaya mengikuti jam: siang terang, malam biru redup, langit gradasi tampil di luar ruangan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('lembang', 'start'));
  expect(await lighting(page)).toMatchObject({ hour: 10, phase: 'morning', sky: true, fx: false });
  await page.evaluate(() => window.__BB__?.setHour(12.5));
  const noon = await lighting(page);
  await page.evaluate(() => window.__BB__?.setHour(22));
  const night = await lighting(page);
  expect(noon?.phase).toBe('noon');
  expect(night?.phase).toBe('night');
  expect(noon?.sunIntensity).toBeGreaterThan((night?.sunIntensity ?? 0) * 2);
  const blue = (c: number) => (c & 0xff) - ((c >> 16) & 0xff);
  expect(blue(night?.fog ?? 0)).toBeGreaterThan(0);
  expect(night?.shadowRadius).toBeGreaterThan(1);
});

test('di dalam rumah langit disembunyikan dan cahaya tidak ikut malam', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.setHour(22);
    await window.__BB__?.enterArea('rumah_michelle', 'pintu');
  });
  const inside = await lighting(page);
  expect(inside?.sky).toBe(false);
  expect(inside?.sunIntensity).toBeGreaterThan(1.5);
});

test('efek pasca-proses aktif: SSAO, tilt-shift, bloom, grading; draw call scene tetap dihitung', async ({ game: { page } }, info) => {
  test.skip(info.project.name !== 'desktop', 'tingkat Tinggi cukup sekali');
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'start'));
  await page.evaluate(() => window.__BB__?.setFx(true));
  await expect.poll(async () => (await lighting(page))?.passes, { timeout: 20_000 }).toEqual(['scene', 'ssao', 'tiltShift+bloom+grade']);
  await expect
    .poll(async () => (await page.evaluate(() => window.__BB__?.renderStats()))?.calls ?? 0, { timeout: 20_000 })
    .toBeGreaterThan(0);
  const stats = await page.evaluate(() => window.__BB__?.renderStats());
  expect(stats?.calls).toBeLessThanOrEqual(300);
  await page.evaluate(() => window.__BB__?.setFx(false));
  expect((await lighting(page))?.passes).toEqual([]);
});

for (const [name, hour] of [
  ['pagi', 6.5],
  ['siang', 12.5],
  ['sore', 17.4],
  ['malam', 22],
] as const)
  test(`snapshot Lembang ${name} dengan efek lengkap`, async ({ game: { page } }, info) => {
    test.skip(info.project.name !== 'desktop', 'snapshot efek cukup di desktop');
    test.setTimeout(120_000);
    await page.evaluate(async (h) => {
      await window.__BB__?.enterArea('lembang', 'start');
      await window.__BB__?.setHour(h);
      await window.__BB__?.setFx(true);
    }, hour);
    await expect.poll(async () => (await lighting(page))?.passes.length, { timeout: 20_000 }).toBe(3);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__BB__?.freeze(true));
    await expect(page).toHaveScreenshot(`lembang-${name}.png`, { maxDiffPixelRatio: 0.01 });
  });
