import type { Draft, Patch } from 'immer';
import type { I18nKey } from '../../content/i18n';
import type { GameEvent } from '../events';
import type { FlagValue, GameState, PlayerId } from '../state';

export interface SetFlagCommand {
  type: 'world/setFlag';
  by: PlayerId;
  key: string;
  value: FlagValue;
}

export type Command = SetFlagCommand;

export type CommandType = Command['type'];
export type CommandOf<T extends CommandType> = Extract<Command, { type: T }>;

export interface CommandResult {
  ok: boolean;
  reason?: I18nKey;
  events: GameEvent[];
}

export interface DispatchResult extends CommandResult {
  patches: Patch[];
  inversePatches: Patch[];
}

export type HandlerOutcome = { ok: true; events: GameEvent[] } | { ok: false; reason: I18nKey };

export type Handler<C extends Command> = (draft: Draft<GameState>, cmd: C) => HandlerOutcome;

export type HandlerMap = { [T in CommandType]: Handler<CommandOf<T>> };

export const succeed = (events: GameEvent[] = []): HandlerOutcome => ({ ok: true, events });
export const reject = (reason: I18nKey): HandlerOutcome => ({ ok: false, reason });
