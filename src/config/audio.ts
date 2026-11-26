import type { Channel } from '../systems/audio/schema';

export interface ChannelSetting {
  on: boolean;
  volume: number;
}

export type AudioSettings = Record<'master' | Channel, ChannelSetting>;

export const AUDIO = {
  storageKey: 'bb.audio',
  defaults: {
    master: { on: true, volume: 0.8 },
    music: { on: true, volume: 0.6 },
    sfx: { on: true, volume: 0.8 },
    ambience: { on: true, volume: 0.7 },
  } satisfies AudioSettings,
  step: { walk: 0.42, run: 0.29, minSpeed: 0.4 },
  water: { near: 2.5, far: 14, fallsNear: 4, fallsFar: 22 },
  fade: 0.25,
  formats: [
    { ext: 'ogg', mime: 'audio/ogg; codecs="vorbis"' },
    { ext: 'm4a', mime: 'audio/mp4; codecs="mp4a.40.2"' },
  ],
} as const;
