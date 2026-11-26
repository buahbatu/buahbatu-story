import { AUDIO, type AudioSettings } from '../../config/audio';
import { rawContent } from '../../content';
import { AudioEngine } from './engine';
import { parseAudio, proximity, serializeAudio, surfaceOf } from './logic';
import { soundFileSchema, type Mood, type SoundFile } from './schema';

export interface StepCue {
  terrain: string | undefined;
  bridge: boolean;
  wading: boolean;
}

export interface SoundCues {
  step(cue: StepCue): void;
  water(streamDistance: number, fallsDistance: number, stillDistance: number): void;
  silence(): void;
  music(mood: Mood): void;
}

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const;
const CLICKABLE = 'button, .dialog-choices li';

function readStored(): string | null {
  try {
    return localStorage.getItem(AUDIO.storageKey);
  } catch {
    return null;
  }
}

export const soundFile = (): SoundFile => soundFileSchema.parse(rawContent['sounds.json']);

export class AudioRuntime implements SoundCues {
  readonly engine: AudioEngine;
  private current: AudioSettings;
  private readonly file: SoundFile;

  constructor(file: SoundFile = soundFile()) {
    this.file = file;
    this.current = parseAudio(readStored());
    this.engine = new AudioEngine(file, this.current);
  }

  get settings(): AudioSettings {
    return this.current;
  }

  update(next: AudioSettings): void {
    this.current = next;
    this.engine.apply(next);
    try {
      localStorage.setItem(AUDIO.storageKey, serializeAudio(next));
    } catch {
      return;
    }
  }

  install(target: Window = window): void {
    const unlock = () => {
      this.engine.unlock();
    };
    for (const type of UNLOCK_EVENTS) target.addEventListener(type, unlock, { capture: true, passive: true });
    target.addEventListener(
      'click',
      (e) => {
        if (e.target instanceof Element && e.target.closest(CLICKABLE)) this.engine.play('ui_click');
      },
      { capture: true },
    );
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.engine.suspend();
      else this.engine.unlock();
    });
  }

  step(cue: StepCue): void {
    const surface = surfaceOf(cue.terrain, this.file.terrain, cue);
    this.engine.play(this.file.steps[surface]);
  }

  water(streamDistance: number, fallsDistance: number, stillDistance: number): void {
    this.engine.setLoop('amb_stream', proximity(streamDistance, AUDIO.water.near, AUDIO.water.far));
    this.engine.setLoop('amb_waterfall', proximity(fallsDistance, AUDIO.water.fallsNear, AUDIO.water.fallsFar));
    this.engine.setLoop('amb_pond', proximity(stillDistance, AUDIO.water.stillNear, AUDIO.water.stillFar));
  }

  silence(): void {
    this.water(Infinity, Infinity, Infinity);
  }

  music(mood: Mood): void {
    this.engine.music.setMood(mood);
  }
}
