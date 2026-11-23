// Kunci scene Phaser. Desain: docs/02-arsitektur.md §6
export const SCENE = {
  boot: 'Boot',
  preload: 'Preload',
  title: 'Title',
} as const;

export type SceneKey = (typeof SCENE)[keyof typeof SCENE];
