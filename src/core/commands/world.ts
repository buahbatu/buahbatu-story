import { reject, succeed, type CommandOf, type Handler } from './types';

const FLAG_KEY = /^[a-z][a-zA-Z0-9_.]{0,63}$/;

function isFlagValue(value: unknown): boolean {
  return typeof value === 'boolean' || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

export const setFlag: Handler<CommandOf<'world/setFlag'>> = (draft, cmd) => {
  if (!FLAG_KEY.test(cmd.key) || !isFlagValue(cmd.value)) return reject('error.invalidCommand');
  const previous = draft.world.flags[cmd.key];
  if (previous === cmd.value) return succeed();
  draft.world.flags[cmd.key] = cmd.value;
  return succeed([{ type: 'world/flagChanged', by: cmd.by, key: cmd.key, value: cmd.value, previous }]);
};
