import type { Page } from '@playwright/test';
import { WORLD_CAMERA } from '../src/config/world';
import { expect, test } from './fixtures';

const camera = (page: Page) => page.evaluate(() => window.__BB__?.camera() ?? null);
const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

async function center(page: Page) {
  const box = await page.locator('#game canvas').boundingBox();
  if (!box) throw new Error('canvas tidak ada');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

test('Q/R memutar kamera, dan W tetap berarti menjauh dari layar', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  expect((await camera(page))?.yaw).toBe(0);
  await page.keyboard.down('KeyR');
  await expect.poll(async () => (await camera(page))?.yaw ?? 0, { timeout: 5_000 }).toBeGreaterThan(0.8);
  await page.keyboard.up('KeyR');
  const yaw = (await camera(page))?.yaw ?? 0;
  const a = await player(page);
  await page.keyboard.down('KeyW');
  await expect
    .poll(
      async () => {
        const p = await player(page);
        return Math.hypot((p?.x ?? 0) - (a?.x ?? 0), (p?.y ?? 0) - (a?.y ?? 0));
      },
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0.5);
  await page.keyboard.up('KeyW');
  const b = await player(page);
  const dx = (b?.x ?? 0) - (a?.x ?? 0);
  const dy = (b?.y ?? 0) - (a?.y ?? 0);
  expect(Math.hypot(dx, dy)).toBeGreaterThan(0.3);
  expect(Math.atan2(dx, dy)).toBeCloseTo(Math.atan2(-Math.sin(yaw), -Math.cos(yaw)), 1);
  await page.keyboard.down('KeyQ');
  await expect.poll(async () => (await camera(page))?.yaw ?? 1, { timeout: 5_000 }).toBeLessThan(0);
  await page.keyboard.up('KeyQ');
});

test('scroll & tombol +/- mengatur zoom dalam batas', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  await center(page);
  await page.mouse.wheel(0, 100);
  await expect.poll(async () => (await camera(page))?.zoom ?? 0).toBeGreaterThan(1);
  for (let i = 0; i < 40; i++) await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await camera(page))?.zoom ?? 0).toBe(WORLD_CAMERA.minZoom);
  await page.keyboard.down('Minus');
  await expect.poll(async () => (await camera(page))?.zoom ?? 0, { timeout: 5_000 }).toBeGreaterThan(1);
  await page.keyboard.up('Minus');
  await page.keyboard.down('Equal');
  await expect.poll(async () => (await camera(page))?.zoom ?? 9, { timeout: 5_000 }).toBeLessThan(0.8);
  await page.keyboard.up('Equal');
});

test('seret klik kanan menggeser pandangan, lalu kamera kembali ke pemain saat berjalan', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  await center(page);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(300, 300, { steps: 5 });
  await page.mouse.up({ button: 'right' });
  await expect.poll(async () => Math.hypot((await camera(page))?.pan.x ?? 0, (await camera(page))?.pan.y ?? 0)).toBeGreaterThan(0.5);
  await page.keyboard.down('KeyD');
  await expect
    .poll(async () => Math.hypot((await camera(page))?.pan.x ?? 9, (await camera(page))?.pan.y ?? 9), { timeout: 20_000 })
    .toBeLessThan(0.25);
  await page.keyboard.up('KeyD');
});

test('kamera tertahan di batas peta & terkunci di dalam ruangan', async ({ game: { page } }) => {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('sandbox');
    window.__BB__?.placePlayer(1, 1, 's');
  });
  expect((await camera(page))?.focus).toEqual({ x: WORLD_CAMERA.edgeInset, y: WORLD_CAMERA.edgeInset });
  await page.evaluate(() => window.__BB__?.enterArea('kos_a'));
  await page.keyboard.down('KeyR');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyR');
  expect((await camera(page))?.yaw).toBe(0);
});

test('snapshot kamera di-zoom dekat', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
  await center(page);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await camera(page))?.zoom ?? 1).toBeLessThan(1);
  await page.evaluate(() => {
    window.__BB__?.setCamera({ zoom: 0.7 });
    window.__BB__?.placePlayer(9.5, 12, 's');
    window.__BB__?.freeze(true);
  });
  await expect(page).toHaveScreenshot('kamera-zoom-dekat.png', { mask: [page.locator('.touch-controls')] });
});
