import { enablePatches, freeze, produceWithPatches, type Patch } from 'immer';
import type { I18nKey } from '../../content/i18n';
import type { EventBus } from '../events';
import { logger as rootLogger, type Logger } from '../logger';
import type { GameState } from '../state';
import type { Command, DispatchResult, Handler, HandlerMap, HandlerOutcome } from './types';

enablePatches();

export type StateListener = (state: GameState, change: { command: Command; patches: Patch[] }) => void;

function rejected(reason: I18nKey): DispatchResult {
  return { ok: false, reason, events: [], patches: [], inversePatches: [] };
}

export class CommandDispatcher {
  private state: GameState;
  private readonly listeners = new Set<StateListener>();
  private readonly bus: EventBus;
  private readonly handlers: HandlerMap;
  private readonly log: Logger;
  constructor(initial: GameState, bus: EventBus, handlers: HandlerMap, log: Logger = rootLogger.child('commands')) {
    this.state = freeze(initial, true);
    this.bus = bus;
    this.handlers = handlers;
    this.log = log;
  }
  getState(): GameState {
    return this.state;
  }
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  dispatch(command: Command): DispatchResult {
    const handler = (this.handlers as Partial<Record<string, Handler<Command>>>)[command.type];
    if (!handler) {
      this.log.warn('Command tidak dikenal', command.type);
      return rejected('error.unknownCommand');
    }
    const box: { outcome?: HandlerOutcome } = {};
    let next: GameState;
    let patches: Patch[];
    let inversePatches: Patch[];
    try {
      [next, patches, inversePatches] = produceWithPatches(this.state, (draft) => {
        box.outcome = handler(draft, command);
      });
    } catch (error) {
      this.log.error('handler gagal', command.type, error);
      return rejected('error.internal');
    }
    const outcome = box.outcome;
    if (!outcome) return rejected('error.internal');
    if (!outcome.ok) return rejected(outcome.reason);
    this.state = next;
    if (patches.length > 0) {
      for (const listener of this.listeners) {
        try {
          listener(next, { command, patches });
        } catch (error) {
          this.log.error('state listener gagal', error);
        }
      }
    }
    this.bus.emitAll(outcome.events);
    return { ok: true, events: outcome.events, patches, inversePatches };
  }
}
