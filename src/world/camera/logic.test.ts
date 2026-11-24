import { describe, expect, it } from 'vitest';
import { cameraOffset, clampToBounds, NEUTRAL, rotateVec, stepCamera, type CameraContext, type CameraInput } from './logic';

const rules = {
  minZoom: 0.5,
  maxZoom: 1.6,
  zoomStep: 0.1,
  rotateSpeed: 2,
  follow: 8,
  recenter: 3,
  maxPan: 6,
  panPerPixel: 0.002,
  edgeInset: 2,
};
const none: CameraInput = { rotate: 0, zoom: 0, pan: { x: 0, y: 0 }, twist: 0 };
const ctx: CameraContext = { target: { x: 10, y: 10 }, moving: false, bounds: { width: 40, height: 30 }, locked: false, distance: 13 };

describe('rotateVec (arah gerak relatif kamera)', () => {
  it('tanpa putaran tetap sama; diputar 90° tombol W jadi ke barat', () => {
    expect(rotateVec({ x: 0, y: -1 }, 0)).toEqual({ x: 0, y: -1 });
    const w = rotateVec({ x: 0, y: -1 }, Math.PI / 2);
    expect(w.x).toBeCloseTo(-1);
    expect(w.y).toBeCloseTo(0);
  });
});

describe('stepCamera', () => {
  it('langsung menempel ke pemain saat dt null, lalu mengikuti halus', () => {
    const snap = stepCamera(NEUTRAL, none, ctx, null, rules);
    expect(snap.focus).toEqual({ x: 10, y: 10 });
    const next = stepCamera(snap, none, { ...ctx, target: { x: 14, y: 10 } }, 1 / 60, rules);
    expect(next.focus.x).toBeGreaterThan(10);
    expect(next.focus.x).toBeLessThan(14);
  });

  it('zoom dibatasi min/maks', () => {
    let rig = NEUTRAL;
    for (let i = 0; i < 50; i++) rig = stepCamera(rig, { ...none, zoom: 1 }, ctx, 1 / 60, rules);
    expect(rig.zoom).toBe(1.6);
    for (let i = 0; i < 80; i++) rig = stepCamera(rig, { ...none, zoom: -1 }, ctx, 1 / 60, rules);
    expect(rig.zoom).toBe(0.5);
  });

  it('putar dengan kecepatan tetap per detik & dari gestur dua jari', () => {
    const rig = stepCamera(NEUTRAL, { ...none, rotate: 1 }, ctx, 0.5, rules);
    expect(rig.yaw).toBeCloseTo(1);
    expect(stepCamera(rig, { ...none, twist: -0.3 }, ctx, 0.1, rules).yaw).toBeCloseTo(0.7);
  });

  it('geser dengan seret mouse, dibatasi, lalu kembali ke pemain saat berjalan', () => {
    let rig = stepCamera(NEUTRAL, none, ctx, null, rules);
    rig = stepCamera(rig, { ...none, pan: { x: -100, y: 0 } }, ctx, null, rules);
    expect(rig.pan.x).toBeCloseTo(2.6);
    expect(rig.focus.x).toBeCloseTo(12.6);
    rig = stepCamera(rig, { ...none, pan: { x: -10000, y: 0 } }, ctx, null, rules);
    expect(Math.hypot(rig.pan.x, rig.pan.y)).toBeCloseTo(6);
    for (let i = 0; i < 120; i++) rig = stepCamera(rig, none, { ...ctx, moving: true }, 1 / 60, rules);
    expect(Math.abs(rig.pan.x)).toBeLessThan(0.1);
  });

  it('interior terkunci: tidak berputar/bergeser, zoom tetap bisa', () => {
    const rig = stepCamera(
      { ...NEUTRAL, yaw: 1 },
      { rotate: 1, zoom: 1, pan: { x: 50, y: 50 }, twist: 1 },
      { ...ctx, locked: true },
      0.1,
      rules,
    );
    expect(rig.yaw).toBe(0);
    expect(rig.pan).toEqual({ x: 0, y: 0 });
    expect(rig.focus).toEqual(ctx.target);
    expect(rig.zoom).toBeGreaterThan(1);
  });
});

describe('batas peta', () => {
  it('fokus tertahan di dalam peta, peta kecil dipusatkan', () => {
    expect(clampToBounds({ x: 0.5, y: 29 }, { width: 40, height: 30 }, 2)).toEqual({ x: 2, y: 28 });
    expect(clampToBounds({ x: 1, y: 1 }, { width: 3, height: 3 }, 2)).toEqual({ x: 1.5, y: 1.5 });
  });
});

describe('cameraOffset', () => {
  it('tanpa putaran kamera di selatan (z+), jarak sesuai zoom & pitch', () => {
    const o = cameraOffset({ yaw: 0, zoom: 1 }, 13, Math.PI / 4);
    expect(o.x).toBeCloseTo(0);
    expect(o.z).toBeCloseTo(13 * Math.SQRT1_2);
    expect(o.y).toBeCloseTo(13 * Math.SQRT1_2);
    expect(cameraOffset({ yaw: 0, zoom: 0.5 }, 13, Math.PI / 4).y).toBeCloseTo(6.5 * Math.SQRT1_2);
  });
});
