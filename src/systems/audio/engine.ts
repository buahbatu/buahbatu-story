import { AUDIO, type AudioSettings } from '../../config/audio';
import { assetUrl } from '../../core/assetUrl';
import { logger } from '../../core/logger';
import { levelOf, pickVariant, rateFor } from './logic';
import { MusicPlayer, type MusicStats } from './music';
import { CHANNELS, type Channel, type SoundDef, type SoundFile } from './schema';

interface LoopVoice {
  gain: GainNode;
  source: AudioBufferSourceNode | null;
  level: number;
}

export interface AudioStats {
  unlocked: boolean;
  state: string;
  format: string;
  played: Record<string, number>;
  loops: Record<string, number>;
  music: MusicStats;
}

function pickFormat(): string {
  if (typeof Audio === 'undefined') return AUDIO.formats[0].ext;
  const probe = new Audio();
  return AUDIO.formats.find((f) => probe.canPlayType(f.mime) !== '')?.ext ?? AUDIO.formats[0].ext;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private readonly channels = new Map<Channel, GainNode>();
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>();
  private readonly loops = new Map<string, LoopVoice>();
  private readonly lastVariant = new Map<string, number>();
  private readonly played: Record<string, number> = {};
  private readonly defs: Map<string, SoundDef>;
  private settings: AudioSettings;
  private readonly format = pickFormat();
  private readonly random: () => number;
  readonly music: MusicPlayer;

  constructor(file: SoundFile, settings: AudioSettings, random: () => number = Math.random) {
    this.defs = new Map(file.sounds.map((s) => [s.id, s]));
    this.settings = settings;
    this.random = random;
    this.music = new MusicPlayer(file, this.format, random);
  }

  get unlocked(): boolean {
    return this.ctx?.state === 'running';
  }

  stats(): AudioStats {
    return {
      unlocked: this.unlocked,
      state: this.ctx?.state ?? 'none',
      format: this.format,
      played: { ...this.played },
      loops: Object.fromEntries([...this.loops].map(([id, v]) => [id, v.source ? v.level : 0])),
      music: this.music.stats(),
    };
  }

  unlock(): void {
    if (typeof AudioContext === 'undefined') return;
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      for (const ch of CHANNELS) {
        const gain = ctx.createGain();
        gain.connect(master);
        this.channels.set(ch, gain);
      }
      this.ctx = ctx;
      this.master = master;
      this.apply(this.settings, true);
      const musicOut = this.channels.get('music');
      if (musicOut) this.music.attach(ctx, musicOut);
      for (const def of this.defs.values()) for (const f of def.files) void this.buffer(f);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    this.music.resume();
  }

  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => undefined);
  }

  apply(settings: AudioSettings, immediate = false): void {
    this.settings = settings;
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const ramp = (param: AudioParam, value: number) => {
      if (immediate) param.setValueAtTime(value, ctx.currentTime);
      else param.setTargetAtTime(value, ctx.currentTime, AUDIO.fade / 3);
    };
    ramp(this.master.gain, levelOf(settings.master));
    for (const ch of CHANNELS) {
      const node = this.channels.get(ch);
      if (node) ramp(node.gain, levelOf(settings[ch]));
    }
  }

  play(id: string): void {
    const def = this.defs.get(id);
    const ctx = this.ctx;
    if (!def || ctx?.state !== 'running') return;
    const index = pickVariant(def.files.length, this.lastVariant.get(id) ?? -1, this.random());
    this.lastVariant.set(id, index);
    const file = def.files[index];
    if (!file) return;
    this.played[id] = (this.played[id] ?? 0) + 1;
    void this.buffer(file).then((buffer) => {
      const out = this.channels.get(def.channel);
      if (!buffer || !out) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rateFor(def.rate, this.random());
      const gain = ctx.createGain();
      gain.gain.value = def.volume;
      source.connect(gain).connect(out);
      source.start();
    });
  }

  setLoop(id: string, level: number): void {
    const def = this.defs.get(id);
    const ctx = this.ctx;
    if (!def || !ctx) return;
    let voice = this.loops.get(id);
    if (!voice) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const out = this.channels.get(def.channel);
      if (out) gain.connect(out);
      voice = { gain, source: null, level: 0 };
      this.loops.set(id, voice);
    }
    const target = Math.max(0, Math.min(1, level));
    if (Math.abs(target - voice.level) > 0.005) {
      voice.level = target;
      voice.gain.gain.setTargetAtTime(target * def.volume, ctx.currentTime, AUDIO.fade);
    }
    if (target > 0 && !voice.source && ctx.state === 'running') this.startLoop(def, voice);
  }

  private startLoop(def: SoundDef, voice: LoopVoice): void {
    const ctx = this.ctx;
    const file = def.files[0];
    if (!ctx || !file) return;
    const source = ctx.createBufferSource();
    voice.source = source;
    void this.buffer(file).then((buffer) => {
      if (!buffer || voice.source !== source) return;
      source.buffer = buffer;
      source.loop = true;
      source.connect(voice.gain);
      source.start(0, this.random() * buffer.duration);
    });
  }

  private buffer(path: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(path);
    if (cached) return cached;
    const ctx = this.ctx;
    if (!ctx) return Promise.resolve(null);
    const loading = fetch(assetUrl(`audio/${path}.${this.format}`))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${String(r.status)}`);
        return r.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data))
      .catch((error: unknown) => {
        logger.warn(`Suara ${path} gagal dimuat`, error);
        return null;
      });
    this.buffers.set(path, loading);
    return loading;
  }
}
