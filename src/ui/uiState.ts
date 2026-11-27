import type { I18nKey } from '../content/i18n';
import type { SceneKey } from '../scenes/keys';
import type { GraphicsSettings } from '../render/settings';
import type { AudioSettings } from '../config/audio';
import { createStore } from './store';
import type { Toast } from './toasts';

export interface UiState {
  scene: SceneKey | null;
  toasts: Toast[];
  loading: number | null;
  fatal: I18nKey | null;
  prompt: InteractPrompt | null;
  dialog: DialogView | null;
  dialogLog: { speaker: string; text: string }[];
  dialogLogOpen: boolean;
  fade: boolean;
  place: I18nKey | null;
  touch: boolean;
  debug: DebugInfo | null;
  debugLayers: { collision: boolean; grid: boolean };
  graphics: GraphicsSettings | null;
  audio: AudioSettings | null;
  settingsOpen: boolean;
  settingsTab: 'graphics' | 'audio';
  help: 'auto' | 'open' | null;
  indoor: boolean;
}

export interface DebugInfo {
  fps: number;
  ms: number;
  calls: number;
  triangles: number;
  area: string;
  x: number;
  y: number;
  height: number;
}

export interface DialogView {
  speaker: string;
  portrait: string;
  text: string;
  complete: boolean;
  choices: string[];
  choice: number;
}

export interface InteractPrompt {
  key: string;
  text: I18nKey;
  x: number;
  y: number;
}

export const uiStore = createStore<UiState>({
  scene: null,
  toasts: [],
  loading: null,
  fatal: null,
  prompt: null,
  dialog: null,
  dialogLog: [],
  dialogLogOpen: false,
  fade: false,
  place: null,
  touch: false,
  debug: null,
  debugLayers: { collision: true, grid: true },
  graphics: null,
  audio: null,
  settingsOpen: false,
  settingsTab: 'graphics',
  help: null,
  indoor: false,
});

export function setActiveScene(scene: SceneKey): void {
  uiStore.set({ scene });
}
