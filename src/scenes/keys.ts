export const SCENE = {
  boot: 'Boot',
  preload: 'Preload',
  title: 'Title',
} as const;

export type SceneKey = (typeof SCENE)[keyof typeof SCENE];
