// Runtime game: satu EventBus + satu CommandDispatcher yang memegang GameState aktif.
// Belum ada save/multiplayer: state dibuat baru tiap boot (save lokal di P2-08, cloud di P5).
// Desain: docs/02-arsitektur.md §3 (aliran data), ADR-006, ADR-008
import { CommandDispatcher, HANDLERS, type Command, type DispatchResult } from './commands';
import { EventBus } from './events';
import { createInitialState, type GameState, type InitialStateOptions } from './state';

export class GameRuntime {
  readonly bus: EventBus;
  private dispatcher: CommandDispatcher;

  constructor(initial: GameState, bus: EventBus = new EventBus()) {
    this.bus = bus;
    this.dispatcher = new CommandDispatcher(initial, bus, HANDLERS);
  }

  static create(options: InitialStateOptions, bus?: EventBus): GameRuntime {
    return new GameRuntime(createInitialState(options), bus);
  }

  getState(): GameState {
    return this.dispatcher.getState();
  }

  dispatch(command: Command): DispatchResult {
    return this.dispatcher.dispatch(command);
  }

  /**
   * Ganti seluruh state (load save, mulai ulang, atau test hook). Listener EventBus tetap terpasang;
   * subscriber state harus berlangganan ulang lewat `subscribe` setelah reset.
   */
  reset(state: GameState): void {
    this.dispatcher = new CommandDispatcher(state, this.bus, HANDLERS);
  }

  subscribe(...args: Parameters<CommandDispatcher['subscribe']>): () => void {
    return this.dispatcher.subscribe(...args);
  }
}
