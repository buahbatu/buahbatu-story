// Registry handler semua Command. Tiap sistem menyumbang handler dari `systems/<x>/handlers.ts`.
// Desain: docs/02-arsitektur.md §4
import type { HandlerMap } from './types';
import { setFlag } from './world';

export const HANDLERS: HandlerMap = {
  'world/setFlag': setFlag,
};

export { CommandDispatcher, type StateListener } from './dispatcher';
export * from './types';
