import type { HandlerMap } from './types';
import { setFlag } from './world';

export const HANDLERS: HandlerMap = {
  'world/setFlag': setFlag,
};

export { CommandDispatcher, type StateListener } from './dispatcher';
export * from './types';
