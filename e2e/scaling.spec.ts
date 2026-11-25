import { expect, test } from './fixtures';

test('resolusi penuh: kanvas memenuhi layar, overlay UI sejajar (ADR-030)', async ({ game: { page } }) => {
  const m = await page.evaluate(() => {
    const rect = (sel: string) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      if (!r) throw new Error(`${sel} tidak ada`);
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const canvas = document.querySelector<HTMLCanvasElement>('#game canvas');
    if (!canvas) throw new Error('canvas tidak ada');
    return {
      vw: window.innerWidth,
      vh: window.innerHeight,
      gw: canvas.width,
      gh: canvas.height,
      style: canvas.style.imageRendering,
      canvas: rect('#game canvas'),
      ui: rect('#ui'),
      gfx: document.documentElement.dataset.gfx,
    };
  });
  const view = await page.evaluate(() => window.__BB__?.view());
  expect(m.style).not.toBe('pixelated');
  expect(m.vh - m.canvas.h).toBeLessThan(1);
  expect(m.canvas.w).toBeGreaterThan(m.vw - 1 - Math.max(0, m.vw - m.vh * (640 / 240)));
  expect(m.gw).toBe(Math.floor((view?.width ?? 0) * (view?.ratio ?? 1)));
  expect(m.gh).toBe(Math.floor((view?.height ?? 0) * (view?.ratio ?? 1)));
  for (const key of ['x', 'y', 'w', 'h'] as const) expect(Math.abs(m.ui[key] - m.canvas[key])).toBeLessThan(1);
});

test('desktop 1280×720 → kanvas penuh 1280×720 di tingkat Tinggi', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'khusus desktop');
  expect(await page.locator('#game canvas').boundingBox()).toMatchObject({ width: 1280, height: 720 });
  expect(await page.evaluate(() => window.__BB__?.view())).toMatchObject({ width: 1280, height: 720, zoom: 1 });
  expect(await page.evaluate(() => document.documentElement.dataset.gfx)).toBe('high');
});

test('resize jendela → dunia menyesuaikan tanpa reload', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'khusus desktop');
  await page.setViewportSize({ width: 1366, height: 657 });
  await expect.poll(() => page.evaluate(() => window.__BB__?.view())).toMatchObject({ width: 1366, height: 657 });
  expect(await page.locator('#game canvas').boundingBox()).toMatchObject({ width: 1366, height: 657 });
});
