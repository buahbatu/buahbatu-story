// Urutan scene Phaser. CharacterCreator & World menyusul (P7-03, P1).
// Desain: docs/02-arsitektur.md §6
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { TitleScene } from './TitleScene';

export { SCENE, type SceneKey } from './keys';

/** Scene pertama di array yang otomatis jalan (Boot). */
export const SCENES = [BootScene, PreloadScene, TitleScene];
