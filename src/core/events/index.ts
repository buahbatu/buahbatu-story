// EventBus bertipe + daftar GameEvent. Desain: docs/02-arsitektur.md §1.4 & §7
//
// Event dipakai untuk update UI, memicu quest/achievement, SFX, notifikasi. Tambah jenis event
// baru di union GameEvent; payload otomatis ter-narrow di `on(type, …)`.
import type { I18nKey, I18nParams } from '../../content/i18n';
import { logger as rootLogger, type Logger } from '../logger';
import type { FlagValue, PlayerId } from '../state';

export type GameEvent =
  | {
      type: 'world/flagChanged';
      by: PlayerId;
      key: string;
      value: FlagValue;
      previous: FlagValue | undefined;
    }
  | { type: 'ui/toast'; key: I18nKey; params?: I18nParams };

export type GameEventType = GameEvent['type'];
export type EventOf<T extends GameEventType> = Extract<GameEvent, { type: T }>;
export type EventListener<T extends GameEventType> = (event: EventOf<T>) => void;

type AnyListener = (event: GameEvent) => void;

export class EventBus {
  private readonly listeners = new Map<GameEventType, Set<AnyListener>>();
  private readonly anyListeners = new Set<AnyListener>();

  constructor(private readonly log: Logger = rootLogger.child('events')) {}

  /** Dengarkan satu jenis event. Kembalikan fungsi untuk berhenti mendengarkan. */
  on<T extends GameEventType>(type: T, listener: EventListener<T>): () => void {
    const set = this.listeners.get(type) ?? new Set<AnyListener>();
    this.listeners.set(type, set);
    // Aman: listener hanya dipanggil untuk event bertipe T (lihat emit).
    const wrapped = listener as AnyListener;
    set.add(wrapped);
    return () => set.delete(wrapped);
  }

  /** Dengarkan semua event (mis. untuk log, quest engine, broadcast jaringan). */
  onAny(listener: AnyListener): () => void {
    this.anyListeners.add(listener);
    return () => this.anyListeners.delete(listener);
  }

  emit(event: GameEvent): void {
    // Salin dulu supaya listener boleh berhenti berlangganan di tengah emit.
    const targets = [...(this.listeners.get(event.type) ?? []), ...this.anyListeners];
    for (const listener of targets) {
      try {
        listener(event);
      } catch (error) {
        // Satu listener rusak tidak boleh menghentikan yang lain (UI/SFX/quest).
        this.log.error('listener gagal untuk', event.type, error);
      }
    }
  }

  emitAll(events: readonly GameEvent[]): void {
    for (const event of events) this.emit(event);
  }

  clear(): void {
    this.listeners.clear();
    this.anyListeners.clear();
  }
}
