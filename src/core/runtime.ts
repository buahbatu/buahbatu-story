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
  reset(state: GameState): void {
    this.dispatcher = new CommandDispatcher(state, this.bus, HANDLERS);
  }
  subscribe(...args: Parameters<CommandDispatcher['subscribe']>): () => void {
    return this.dispatcher.subscribe(...args);
  }
}
