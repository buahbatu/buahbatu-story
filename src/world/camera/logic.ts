export interface Vec2 {
  x: number;
  y: number;
}

export interface CameraRig {
  yaw: number;
  zoom: number;
  focus: Vec2;
  pan: Vec2;
}

export interface CameraInput {
  rotate: number;
  zoom: number;
  pan: Vec2;
  twist: number;
}

export interface CameraRules {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  rotateSpeed: number;
  follow: number;
  recenter: number;
  maxPan: number;
  panPerPixel: number;
  edgeInset: number;
}

export interface CameraContext {
  target: Vec2;
  moving: boolean;
  bounds: { width: number; height: number };
  locked: boolean;
  distance: number;
}

export const NEUTRAL: CameraRig = { yaw: 0, zoom: 1, focus: { x: 0, y: 0 }, pan: { x: 0, y: 0 } };

export function rotateVec(v: Vec2, yaw: number): Vec2 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { x: v.x * c + v.y * s, y: -v.x * s + v.y * c };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function clampToBounds(p: Vec2, bounds: CameraContext['bounds'], inset: number): Vec2 {
  const axis = (v: number, size: number) => (size <= inset * 2 ? size / 2 : clamp(v, inset, size - inset));
  return { x: axis(p.x, bounds.width), y: axis(p.y, bounds.height) };
}

export function stepCamera(rig: CameraRig, input: CameraInput, ctx: CameraContext, dt: number | null, rules: CameraRules): CameraRig {
  const zoom = clamp(rig.zoom * Math.exp(input.zoom * rules.zoomStep), rules.minZoom, rules.maxZoom);
  if (ctx.locked) return { yaw: 0, zoom, focus: { ...ctx.target }, pan: { x: 0, y: 0 } };
  const step = dt ?? 0;
  const yaw = rig.yaw + input.rotate * rules.rotateSpeed * step + input.twist;
  const scale = ctx.distance * zoom * rules.panPerPixel;
  const drag = rotateVec({ x: -input.pan.x * scale, y: -input.pan.y * scale }, yaw);
  let pan = { x: rig.pan.x + drag.x, y: rig.pan.y + drag.y };
  if (ctx.moving) {
    const keep = dt === null ? 0 : Math.exp(-rules.recenter * step);
    pan = { x: pan.x * keep, y: pan.y * keep };
  }
  const len = Math.hypot(pan.x, pan.y);
  if (len > rules.maxPan) pan = { x: (pan.x / len) * rules.maxPan, y: (pan.y / len) * rules.maxPan };
  const desired = clampToBounds({ x: ctx.target.x + pan.x, y: ctx.target.y + pan.y }, ctx.bounds, rules.edgeInset);
  const k = dt === null ? 1 : Math.min(1, rules.follow * step);
  const focus = { x: rig.focus.x + (desired.x - rig.focus.x) * k, y: rig.focus.y + (desired.y - rig.focus.y) * k };
  return { yaw, zoom, focus, pan };
}

export function cameraOffset(rig: Pick<CameraRig, 'yaw' | 'zoom'>, distance: number, pitch: number): { x: number; y: number; z: number } {
  const d = distance * rig.zoom;
  const horizontal = Math.cos(pitch) * d;
  return { x: Math.sin(rig.yaw) * horizontal, y: Math.sin(pitch) * d, z: Math.cos(rig.yaw) * horizontal };
}
