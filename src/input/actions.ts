export const HOTBAR_ACTIONS = [
  'hotbar1',
  'hotbar2',
  'hotbar3',
  'hotbar4',
  'hotbar5',
  'hotbar6',
  'hotbar7',
  'hotbar8',
  'hotbar9',
  'hotbar10',
] as const;
export const ACTIONS = [
  'up',
  'down',
  'left',
  'right',
  'run',
  'interact',
  'useTool',
  'phone',
  'emote',
  'talk',
  'jump',
  'decor',
  'hotbarNext',
  'hotbarPrev',
  ...HOTBAR_ACTIONS,
] as const;

export type Action = (typeof ACTIONS)[number];
export type Bindings = Record<Action, readonly string[]>;
