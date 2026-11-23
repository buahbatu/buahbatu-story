import { expect, test } from './fixtures';

test('zoom integer per pixel fisik, game memenuhi layar, overlay sejajar (ADR-020)', async ({ game: { page } }) => {
  const m = await page.evaluate(() => {
    const rect = (sel: string) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      if (!r) throw new Error(`${sel} tidak ada`);
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const canvas = document.querySelector<HTMLCanvasElement>('#game canvas');
    if (!canvas) throw new Error('canvas tidak ada');
    return {
      dpr: window.devicePixelRatio,
      vw: window.innerWidth,
      vh: window.innerHeight,
      gw: canvas.width,
      gh: canvas.height,
      canvas: rect('#game canvas'),
      ui: rect('#ui'),
    };
  });
  const k = (m.canvas.w * m.dpr) / m.gw;
  expect(Math.abs(k - Math.round(k)), `×${k.toFixed(3)}`).toBeLessThan(0.01);
  expect(Math.abs((m.canvas.h * m.dpr) / m.gh - k)).toBeLessThan(0.01);
  expect(m.vw - m.canvas.w).toBeLessThan(k / m.dpr + 0.5);
  expect(m.vh - m.canvas.h).toBeLessThan(k / m.dpr + 0.5);
  expect(m.canvas.x).toBeGreaterThanOrEqual(-0.5);
  expect(m.canvas.y).toBeGreaterThanOrEqual(-0.5);
  for (const key of ['x', 'y', 'w', 'h'] as const) expect(Math.abs(m.ui[key] - m.canvas[key])).toBeLessThan(1);
});

test('desktop 1280×720 → tepat ×2, dunia 640×360', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'khusus desktop');
  expect(await page.locator('#game canvas').boundingBox()).toMatchObject({ x: 0, y: 0, width: 1280, height: 720 });
  expect(await page.evaluate(() => window.__BB__?.view())).toMatchObject({ width: 640, height: 360, pixelScale: 2 });
});

test('resize jendela → dunia menyesuaikan tanpa reload', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'khusus desktop');
  await page.setViewportSize({ width: 1366, height: 657 });
  await expect.poll(() => page.evaluate(() => window.__BB__?.view())).toMatchObject({ width: 683, height: 328, pixelScale: 2 });
  expect(await page.locator('#game canvas').boundingBox()).toMatchObject({ width: 1366, height: 656 });
});
