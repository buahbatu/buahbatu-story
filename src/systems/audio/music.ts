import { AUDIO } from '../../config/audio';
import { assetUrl } from '../../core/assetUrl';
import { nextTrack } from './logic';
import type { Mood, SoundFile, TrackDef } from './schema';

interface Deck {
  element: HTMLAudioElement;
  gain: GainNode;
  track: TrackDef | null;
}

export interface MusicStats {
  mood: Mood | null;
  track: string | null;
  playing: boolean;
}

export class MusicPlayer {
  private readonly tracks: Map<string, TrackDef>;
  private readonly moods: SoundFile['music']['moods'];
  private decks: [Deck, Deck] | null = null;
  private active: 0 | 1 = 0;
  private readonly format: string;
  private readonly random: () => number;
  private mood: Mood | null = null;
  private ctx: AudioContext | null = null;

  constructor(file: SoundFile, format: string, random: () => number) {
    this.format = format;
    this.random = random;
    this.tracks = new Map(file.music.tracks.map((t) => [t.id, t]));
    this.moods = file.music.moods;
  }

  attach(ctx: AudioContext, out: AudioNode): void {
    if (this.decks || typeof Audio === 'undefined') return;
    this.ctx = ctx;
    const deck = (): Deck => {
      const element = new Audio();
      element.preload = 'auto';
      element.crossOrigin = 'anonymous';
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(element).connect(gain).connect(out);
      element.addEventListener('ended', () => {
        if (this.decks?.[this.active] === d) this.advance();
      });
      const d: Deck = { element, gain, track: null };
      return d;
    };
    this.decks = [deck(), deck()];
    if (this.mood) this.advance();
  }

  setMood(mood: Mood): void {
    if (mood === this.mood) return;
    this.mood = mood;
    this.advance();
  }

  resume(): void {
    const deck = this.decks?.[this.active];
    if (deck?.track && deck.element.paused) void deck.element.play().catch(() => undefined);
  }

  stats(): MusicStats {
    const deck = this.decks?.[this.active];
    return { mood: this.mood, track: deck?.track?.id ?? null, playing: deck ? !deck.element.paused : false };
  }

  private advance(): void {
    const ctx = this.ctx;
    if (!this.decks || !ctx || !this.mood) return;
    const decks = this.decks;
    const current = decks[this.active];
    const list = this.moods[this.mood];
    const id = nextTrack(list, current.track?.id ?? null, this.random());
    const track = id ? this.tracks.get(id) : undefined;
    if (!track) return;
    const fade = AUDIO.music.crossfade;
    const now = ctx.currentTime;
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(current.gain.gain.value, now);
    current.gain.gain.linearRampToValueAtTime(0, now + fade);
    const leaving = current.element;
    setTimeout(
      () => {
        if (this.decks?.[this.active].element !== leaving) leaving.pause();
      },
      fade * 1000 + 50,
    );
    this.active = this.active === 0 ? 1 : 0;
    const next = decks[this.active];
    next.track = track;
    next.element.src = assetUrl(`audio/${track.file}.${this.format}`);
    next.gain.gain.cancelScheduledValues(now);
    next.gain.gain.setValueAtTime(0, now);
    next.gain.gain.linearRampToValueAtTime(track.volume, now + fade);
    void next.element.play().catch(() => undefined);
  }
}
