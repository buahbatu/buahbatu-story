import type { LightKey } from '../../config/lighting';

type ColorField = 'skyTop' | 'skyHorizon' | 'fog' | 'sun' | 'ambientSky' | 'ambientGround' | 'tint' | 'lift';
type NumberField = Exclude<keyof LightKey, ColorField | 'hour'>;

export type LightState = Record<ColorField, number> & Record<NumberField, number> & { hour: number };

export type DayPhase = 'night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk';

const COLORS: readonly ColorField[] = ['skyTop', 'skyHorizon', 'fog', 'sun', 'ambientSky', 'ambientGround', 'tint', 'lift'];
const NUMBERS: readonly NumberField[] = [
  'day',
  'sunIntensity',
  'elevation',
  'azimuth',
  'ambient',
  'exposure',
  'saturation',
  'contrast',
  'vignette',
  'bloom',
];

export function parseHex(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Warna tidak valid: ${hex}`);
  return parseInt(m[1], 16);
}

export function mixColor(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, t));
  let out = 0;
  for (const shift of [16, 8, 0]) {
    const ca = (a >> shift) & 0xff;
    const cb = (b >> shift) & 0xff;
    out |= Math.round(ca + (cb - ca) * k) << shift;
  }
  return out;
}

export const wrapHour = (hour: number): number => (Number.isFinite(hour) ? ((hour % 24) + 24) % 24 : 0);

const smooth = (t: number) => t * t * (3 - 2 * t);

export function lightingAt(hour: number, keys: readonly LightKey[]): LightState {
  if (keys.length === 0) throw new Error('Titik kunci cahaya kosong');
  const sorted = [...keys].sort((a, b) => a.hour - b.hour);
  const h = wrapHour(hour);
  const nextIndex = sorted.findIndex((k) => k.hour > h);
  const after = sorted[nextIndex === -1 ? 0 : nextIndex] ?? sorted[0];
  const before = sorted[nextIndex === -1 ? sorted.length - 1 : (nextIndex - 1 + sorted.length) % sorted.length] ?? sorted[0];
  if (!before || !after) throw new Error('Titik kunci cahaya kosong');
  const span = (after.hour - before.hour + 24) % 24 || 24;
  const t = before === after ? 0 : smooth(((h - before.hour + 24) % 24) / span);
  const state = { hour: h } as LightState;
  for (const f of COLORS) state[f] = mixColor(parseHex(before[f]), parseHex(after[f]), t);
  for (const f of NUMBERS) state[f] = before[f] + (after[f] - before[f]) * t;
  return state;
}

export function sunOffset(state: Pick<LightState, 'elevation' | 'azimuth'>, distance: number): { x: number; y: number; z: number } {
  const el = (state.elevation * Math.PI) / 180;
  const az = (state.azimuth * Math.PI) / 180;
  const flat = Math.cos(el) * distance;
  return { x: Math.sin(az) * flat, y: Math.sin(el) * distance, z: -Math.cos(az) * flat };
}

export function withAtmosphere(state: LightState, area: { sky?: string; fog?: string }, blend: number): LightState {
  const k = Math.min(1, Math.max(0, blend * state.day));
  return {
    ...state,
    skyHorizon: area.sky ? mixColor(state.skyHorizon, parseHex(area.sky), k) : state.skyHorizon,
    fog: area.fog ? mixColor(state.fog, parseHex(area.fog), k) : state.fog,
  };
}

export function phaseOf(hour: number): DayPhase {
  const h = wrapHour(hour);
  if (h < 5) return 'night';
  if (h < 7.5) return 'dawn';
  if (h < 11) return 'morning';
  if (h < 14.5) return 'noon';
  if (h < 17) return 'afternoon';
  if (h < 19.5) return 'dusk';
  return 'night';
}

export function parseHour(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n < 24 ? n : null;
}
