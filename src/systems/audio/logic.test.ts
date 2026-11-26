import { describe, expect, it } from 'vitest';
import { AUDIO } from '../../config/audio';
import { soundFileSchema } from './schema';
import sounds from '../../content/sounds.json';
import {
  channelGain,
  moodAt,
  nextTrack,
  defaultAudio,
  distanceToBox,
  nearest,
  parseAudio,
  pickVariant,
  proximity,
  rateFor,
  serializeAudio,
  stepClock,
  surfaceOf,
  waterBodies,
  waterBoxes,
} from './logic';

describe('pengaturan suara', () => {
  it('bawaan semua nyala', () => {
    const d = defaultAudio();
    expect(Object.values(d).every((c) => c.on)).toBe(true);
    expect(d.music.volume).toBe(AUDIO.defaults.music.volume);
  });

  it('simpan lalu baca kembali sama persis', () => {
    const s = { ...defaultAudio(), sfx: { on: false, volume: 0.35 } };
    expect(parseAudio(serializeAudio(s))).toEqual(s);
  });

  it('data rusak/sebagian memakai bawaan dan volume dibatasi 0–1', () => {
    expect(parseAudio('{rusak')).toEqual(defaultAudio());
    expect(parseAudio(null)).toEqual(defaultAudio());
    expect(parseAudio('"teks"')).toEqual(defaultAudio());
    const p = parseAudio('{"music":{"on":false,"volume":3},"sfx":{"volume":-1},"master":"x"}');
    expect(p.music).toEqual({ on: false, volume: 1 });
    expect(p.sfx).toEqual({ on: true, volume: 0 });
    expect(p.master).toEqual(AUDIO.defaults.master);
  });

  it('gain saluran = master × saluran, mati berarti 0', () => {
    const s = defaultAudio();
    expect(channelGain(s, 'sfx')).toBeCloseTo(AUDIO.defaults.master.volume * AUDIO.defaults.sfx.volume);
    expect(channelGain({ ...s, master: { on: false, volume: 1 } }, 'sfx')).toBe(0);
    expect(channelGain({ ...s, ambience: { on: false, volume: 1 } }, 'ambience')).toBe(0);
  });
});

describe('permukaan langkah', () => {
  const map = { grass: 'grass', asphalt: 'hard', wood_floor: 'wood' } as const;

  it('jembatan selalu kayu, air dangkal selalu cipratan', () => {
    expect(surfaceOf('water', map, { bridge: true, wading: true })).toBe('wood');
    expect(surfaceOf('grass', map, { bridge: false, wading: true })).toBe('water');
  });

  it('mengikuti jenis tanah, tak dikenal jatuh ke rumput', () => {
    expect(surfaceOf('asphalt', map, { bridge: false, wading: false })).toBe('hard');
    expect(surfaceOf('lava', map, { bridge: false, wading: false })).toBe('grass');
    expect(surfaceOf(undefined, map, { bridge: false, wading: false })).toBe('grass');
  });

  it('semua jenis tanah di peta punya suara langkah', () => {
    const file = soundFileSchema.parse(sounds);
    for (const t of [
      'grass',
      'grass_flowers',
      'dirt',
      'path',
      'tilled',
      'sand',
      'water',
      'stone',
      'wood_floor',
      'cliff',
      'asphalt',
      'paving',
      'ceramic',
      'carpet',
    ])
      expect(file.terrain[t], t).toBeDefined();
  });
});

describe('irama langkah', () => {
  it('diam tidak melangkah dan langkah pertama langsung berbunyi', () => {
    expect(stepClock({ left: 0.3 }, 0.1, 0, false)).toEqual({ clock: { left: 0 }, step: false });
    expect(stepClock({ left: 0 }, 0.016, 2, false).step).toBe(true);
  });

  it('berlari lebih rapat daripada berjalan', () => {
    const count = (running: boolean) => {
      let clock = { left: 0 };
      let steps = 0;
      for (let i = 0; i < 300; i++) {
        const r = stepClock(clock, 1 / 60, 3, running);
        clock = r.clock;
        if (r.step) steps++;
      }
      return steps;
    };
    expect(count(true)).toBeGreaterThan(count(false));
    expect(count(false)).toBe(Math.ceil(5 / AUDIO.step.walk));
  });
});

describe('variasi & jarak', () => {
  it('pickVariant tidak mengulang varian terakhir', () => {
    for (let last = 0; last < 4; last++) for (const roll of [0, 0.3, 0.6, 0.99, 1]) expect(pickVariant(4, last, roll)).not.toBe(last);
    expect(pickVariant(1, 0, 0.5)).toBe(0);
    const seen = new Set([0, 0.34, 0.67, 0.99].map((r) => pickVariant(4, -1, r)));
    expect(seen.size).toBeGreaterThan(2);
  });

  it('proximity penuh di dekat, hilang di jauh, turun mulus', () => {
    expect(proximity(1, 2, 10)).toBe(1);
    expect(proximity(12, 2, 10)).toBe(0);
    expect(proximity(Infinity, 2, 10)).toBe(0);
    expect(proximity(4, 2, 10)).toBeGreaterThan(proximity(8, 2, 10));
  });

  it('jarak ke kotak & yang terdekat', () => {
    const box = { x: 2, y: 2, w: 2, h: 1 };
    expect(distanceToBox(3, 2.5, box)).toBe(0);
    expect(distanceToBox(0, 2.5, box)).toBe(2);
    expect(nearest(0, 0, [])).toBe(Infinity);
    expect(nearest(0, 0, [box, { x: 0, y: 1, w: 1, h: 1 }])).toBe(1);
  });

  it('waterBoxes hanya dari petak air', () => {
    expect(waterBoxes({ width: 3, terrain: ['grass', 'water', 'grass', 'water', 'sand', 'sand'] })).toEqual([
      { x: 1, y: 0, w: 1, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
    ]);
  });

  it('rateFor dalam rentang', () => {
    expect(rateFor(undefined, 0.5)).toBe(1);
    expect(rateFor([0.9, 1.1], 0)).toBeCloseTo(0.9);
    expect(rateFor([0.9, 1.1], 1)).toBeCloseTo(1.1);
  });
});

describe('isi sounds.json', () => {
  it('valid dan semua permukaan punya suara', () => {
    expect(soundFileSchema.safeParse(sounds).success).toBe(true);
  });

  it('menolak langkah yang menunjuk suara tak ada', () => {
    const broken = { ...sounds, steps: { ...sounds.steps, grass: 'tidak_ada' } };
    expect(soundFileSchema.safeParse(broken).success).toBe(false);
  });
});

describe('air mengalir vs air diam', () => {
  const grid = (rows: string[]) => ({
    width: rows[0]?.length ?? 0,
    height: rows.length,
    terrain: rows.flatMap((r) => Array.from(r).map((c) => (c === '~' ? 'water' : 'grass'))),
  });

  it('kolam tertutup = diam, sungai sampai tepi peta = mengalir', () => {
    const area = grid(['~.....', '~..~~.', '~..~~.', '~.....']);
    const b = waterBodies(area, []);
    expect(b.flowing).toHaveLength(4);
    expect(b.still).toHaveLength(4);
    expect(b.still.every((t) => t.x >= 3)).toBe(true);
  });

  it('kolam yang tersambung curug ikut mengalir', () => {
    const area = grid(['......', '..~~..', '..~~..', '......']);
    expect(waterBodies(area, []).still).toHaveLength(4);
    expect(waterBodies(area, [{ x: 2, y: 0, w: 2, h: 0.5 }]).flowing).toHaveLength(4);
  });

  it('tanpa air kosong', () => {
    expect(waterBodies(grid(['...', '...']), [])).toEqual({ flowing: [], still: [] });
  });
});

describe('musik per suasana', () => {
  it('moodAt membagi hari jadi siang, sore, malam', () => {
    expect(moodAt(6)).toBe('day');
    expect(moodAt(12)).toBe('day');
    expect(moodAt(17)).toBe('evening');
    expect(moodAt(19)).toBe('night');
    expect(moodAt(2)).toBe('night');
    expect(moodAt(5.9)).toBe('night');
    expect(moodAt(30)).toBe('day');
  });

  it('nextTrack tidak mengulang lagu yang sama bila ada pilihan lain', () => {
    expect(nextTrack(['a', 'b'], 'a', 0)).toBe('b');
    expect(nextTrack(['a', 'b'], 'b', 0.99)).toBe('a');
    expect(nextTrack(['a'], 'a', 0.5)).toBe('a');
    expect(nextTrack([], null, 0.5)).toBeNull();
    expect(nextTrack(['a', 'b', 'c'], null, 1)).toBe('c');
  });

  it('semua suasana punya lagu yang ada', () => {
    const file = soundFileSchema.parse(sounds);
    for (const mood of ['title', 'day', 'evening', 'night'] as const) expect(file.music.moods[mood].length).toBeGreaterThan(0);
    const broken = { ...sounds, music: { ...sounds.music, moods: { ...sounds.music.moods, night: ['tidak_ada'] } } };
    expect(soundFileSchema.safeParse(broken).success).toBe(false);
  });
});
