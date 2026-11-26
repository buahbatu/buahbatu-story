import { AUDIO, type AudioSettings, type ChannelSetting } from '../../config/audio';
import type { Channel, Mood, Surface } from './schema';

type Key = keyof AudioSettings;
const KEYS: readonly Key[] = ['master', 'music', 'sfx', 'ambience'];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function readChannel(value: unknown, fallback: ChannelSetting): ChannelSetting {
  if (typeof value !== 'object' || value === null) return { ...fallback };
  const { on, volume } = value as Record<string, unknown>;
  return {
    on: typeof on === 'boolean' ? on : fallback.on,
    volume: typeof volume === 'number' && Number.isFinite(volume) ? clamp01(volume) : fallback.volume,
  };
}

export function defaultAudio(): AudioSettings {
  return {
    master: { ...AUDIO.defaults.master },
    music: { ...AUDIO.defaults.music },
    sfx: { ...AUDIO.defaults.sfx },
    ambience: { ...AUDIO.defaults.ambience },
  };
}

export function parseAudio(raw: string | null): AudioSettings {
  const base = defaultAudio();
  if (raw === null) return base;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return base;
    const record = data as Record<string, unknown>;
    return Object.fromEntries(KEYS.map((k) => [k, readChannel(record[k], base[k])])) as AudioSettings;
  } catch {
    return base;
  }
}

export function moodAt(hour: number): Exclude<Mood, 'title'> {
  const h = ((hour % 24) + 24) % 24;
  const { morning, evening, night } = AUDIO.music;
  if (h >= morning && h < evening) return 'day';
  if (h >= evening && h < night) return 'evening';
  return 'night';
}

export function nextTrack(list: readonly string[], current: string | null, roll: number): string | null {
  if (list.length === 0) return null;
  const others = list.length > 1 ? list.filter((id) => id !== current) : list;
  return others[Math.min(others.length - 1, Math.floor(clamp01(roll) * others.length))] ?? null;
}

export const serializeAudio = (settings: AudioSettings): string => JSON.stringify(settings);

export const levelOf = (c: ChannelSetting): number => (c.on ? c.volume : 0);

export const channelGain = (settings: AudioSettings, channel: Channel): number => levelOf(settings.master) * levelOf(settings[channel]);

export function surfaceOf(
  terrain: string | undefined,
  map: Readonly<Record<string, Surface>>,
  ctx: { bridge: boolean; wading: boolean },
): Surface {
  if (ctx.bridge) return 'wood';
  if (ctx.wading) return 'water';
  return (terrain !== undefined ? map[terrain] : undefined) ?? 'grass';
}

export interface StepClock {
  left: number;
}

export function stepClock(clock: StepClock, dt: number, speed: number, running: boolean): { clock: StepClock; step: boolean } {
  if (speed < AUDIO.step.minSpeed) return { clock: { left: 0 }, step: false };
  const left = clock.left - dt;
  if (left > 0) return { clock: { left }, step: false };
  return { clock: { left: left + (running ? AUDIO.step.run : AUDIO.step.walk) }, step: true };
}

export function pickVariant(count: number, last: number, roll: number): number {
  if (count <= 1) return 0;
  const i = Math.min(count - 2, Math.floor(clamp01(roll) * (count - 1)));
  return i >= last ? i + 1 : i;
}

export function proximity(distance: number, near: number, far: number): number {
  if (distance <= near) return 1;
  if (distance >= far) return 0;
  const t = (far - distance) / (far - near);
  return t * t;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function distanceToBox(x: number, y: number, b: Box): number {
  const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
  const dy = Math.max(b.y - y, 0, y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

export function nearest(x: number, y: number, boxes: readonly Box[]): number {
  let best = Infinity;
  for (const b of boxes) best = Math.min(best, distanceToBox(x, y, b));
  return best;
}

export function waterBoxes(area: { width: number; terrain: readonly string[] }): Box[] {
  const boxes: Box[] = [];
  area.terrain.forEach((t, i) => {
    if (t === 'water') boxes.push({ x: i % area.width, y: Math.floor(i / area.width), w: 1, h: 1 });
  });
  return boxes;
}

export interface WaterBodies {
  flowing: Box[];
  still: Box[];
}

export function waterBodies(
  area: { width: number; height: number; terrain: readonly string[] },
  falls: readonly Box[],
  reach = 1.5,
): WaterBodies {
  const { width, height, terrain } = area;
  const seen = new Uint8Array(terrain.length);
  const out: WaterBodies = { flowing: [], still: [] };
  terrain.forEach((t, start) => {
    if (t !== 'water' || seen[start]) return;
    const tiles: Box[] = [];
    const queue = [start];
    seen[start] = 1;
    let open = false;
    while (queue.length > 0) {
      const i = queue.pop() ?? 0;
      const x = i % width;
      const y = Math.floor(i / width);
      const tile = { x, y, w: 1, h: 1 };
      tiles.push(tile);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) open = true;
      if (!open && falls.some((f) => distanceToBox(x + 0.5, y + 0.5, f) <= reach)) open = true;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ] as const) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const n = ny * width + nx;
        if (!seen[n] && terrain[n] === 'water') {
          seen[n] = 1;
          queue.push(n);
        }
      }
    }
    (open ? out.flowing : out.still).push(...tiles);
  });
  return out;
}

export function rateFor(range: readonly [number, number] | undefined, roll: number): number {
  if (!range) return 1;
  return range[0] + (range[1] - range[0]) * clamp01(roll);
}
