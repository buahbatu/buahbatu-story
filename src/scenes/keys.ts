export const SCENE = {
  boot: 'Boot',
  preload: 'Preload',
  title: 'Title',
  world: 'World',
} as const;

export type SceneKey = (typeof SCENE)[keyof typeof SCENE];
