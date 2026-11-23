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
  private readonly log: Logger;
  constructor(log: Logger = rootLogger.child('events')) {
    this.log = log;
  }
  on<T extends GameEventType>(type: T, listener: EventListener<T>): () => void {
    const set = this.listeners.get(type) ?? new Set<AnyListener>();
    this.listeners.set(type, set);
    const wrapped = listener as AnyListener;
    set.add(wrapped);
    return () => set.delete(wrapped);
  }
  onAny(listener: AnyListener): () => void {
    this.anyListeners.add(listener);
    return () => this.anyListeners.delete(listener);
  }
  emit(event: GameEvent): void {
    const targets = [...(this.listeners.get(event.type) ?? []), ...this.anyListeners];
    for (const listener of targets) {
      try {
        listener(event);
      } catch (error) {
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
