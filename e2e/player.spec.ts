import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

async function speed(page: Page, keys: string[]) {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(150);
  const sample = () => page.evaluate(() => ({ x: window.__BB__?.player()?.x ?? 0, t: performance.now() }));
  const a = await sample();
  await page.waitForTimeout(600);
  const b = await sample();
  for (const k of keys) await page.keyboard.up(k);
  return ((b.x - a.x) / (b.t - a.t)) * 1000;
}

async function hold(page: Page, keys: string[], ms: number) {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  const during = await player(page);
  for (const k of keys) await page.keyboard.up(k);
  await page.evaluate(
    () =>
      new Promise((done) => {
        requestAnimationFrame(() => requestAnimationFrame(done));
      }),
  );
  return during;
}

test('pemain muncul di spawn menghadap kamera, jalan & lari dengan keyboard', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  expect(await player(page)).toMatchObject({ area: 'sandbox', x: 20.5, y: 17.5, facing: 's', anim: 'idle' });

  expect(await hold(page, ['KeyD'], 300)).toMatchObject({ facing: 'e', anim: 'walk' });
  expect(await player(page)).toMatchObject({ facing: 'e', anim: 'idle' });
  expect(await hold(page, ['ShiftLeft', 'KeyA'], 300)).toMatchObject({ facing: 'w', anim: 'run' });
  const walk = await speed(page, ['KeyD']);
  const run = await speed(page, ['ShiftLeft', 'KeyA']);
  expect(walk).toBeGreaterThan(1.5);
  expect(-run / walk).toBeGreaterThan(1.4);

  const diagonal = await hold(page, ['KeyS', 'KeyA'], 300);
  expect(diagonal).toMatchObject({ facing: 'sw', anim: 'walk' });
  expect(await player(page)).toMatchObject({ facing: 'sw', anim: 'idle' });
});

test('pemain tertahan tepi ruangan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('kos_a', 'pintu'));
  const p = await hold(page, ['ShiftLeft', 'KeyA', 'KeyW'], 2500);
  expect(p?.x).toBeCloseTo(0.35, 2);
  expect(p?.y).toBeCloseTo(0.35, 2);
  expect(p?.facing).toBe('nw');
});

test('snapshot pemain menghadap barat setelah berjalan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('buahbatu', 'depan_warung'));
  await page.evaluate(() => {
    window.__BB__?.placePlayer(13, 11, 'w');
    window.__BB__?.freeze(true);
  });
  expect(await player(page)).toMatchObject({ facing: 'w', anim: 'idle' });
  await expect(page).toHaveScreenshot('player-west.png');
});
