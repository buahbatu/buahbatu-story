import { expect, test } from './fixtures';

test('canvas di-scale integer per pixel fisik, utuh di dalam layar, overlay sejajar', async ({ game: { page } }) => {
  const m = await page.evaluate(() => {
    const canvas = document.querySelector('#game canvas');
    const ui = document.querySelector('#ui');
    if (!canvas || !ui) throw new Error('canvas/overlay tidak ada');
    const c = canvas.getBoundingClientRect();
    const u = ui.getBoundingClientRect();
    return {
      dpr: window.devicePixelRatio,
      vw: window.innerWidth,
      vh: window.innerHeight,
      canvas: { x: c.x, y: c.y, w: c.width, h: c.height },
      ui: { x: u.x, y: u.y, w: u.width, h: u.height },
    };
  });
  const devicePerGamePixel = (m.canvas.w * m.dpr) / 640;
  const integer = Math.abs(devicePerGamePixel - Math.round(devicePerGamePixel)) < 0.01;
  const fills = m.vh - m.canvas.h < 1 || m.vw - m.canvas.w < 1;
  expect(integer || (m.dpr >= 2 && fills), `×${devicePerGamePixel.toFixed(3)} @DPR ${m.dpr}`).toBe(true);
  expect(devicePerGamePixel).toBeGreaterThanOrEqual(1);
  expect(m.canvas.w / m.canvas.h).toBeCloseTo(16 / 9, 2);
  expect(m.canvas.x).toBeGreaterThanOrEqual(-0.5);
  expect(m.canvas.y).toBeGreaterThanOrEqual(-0.5);
  expect(m.canvas.x + m.canvas.w).toBeLessThanOrEqual(m.vw + 0.5);
  expect(m.canvas.y + m.canvas.h).toBeLessThanOrEqual(m.vh + 0.5);
  expect(Math.abs(m.canvas.x - (m.vw - m.canvas.w) / 2)).toBeLessThan(1);
  for (const key of ['x', 'y', 'w', 'h'] as const) expect(Math.abs(m.ui[key] - m.canvas[key])).toBeLessThan(1);
});

test('iPhone landscape: game memenuhi tinggi layar (pecahan, ADR-018)', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone-landscape', 'khusus iPhone');
  const size = await page.locator('#game canvas').boundingBox();
  const vh = page.viewportSize()?.height ?? 0;
  expect(size?.height).toBeGreaterThan(vh - 1);
  expect(size?.height).toBeLessThanOrEqual(vh + 0.5);
});

test('desktop 1280×720 → tepat ×2', async ({ game: { page } }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'khusus desktop');
  const size = await page.locator('#game canvas').boundingBox();
  expect(size).toMatchObject({ x: 0, y: 0, width: 1280, height: 720 });
});
