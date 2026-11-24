import type { I18nKey } from '../content/i18n';
import type { SceneKey } from '../scenes/keys';
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
  touch: boolean;
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
  touch: false,
});

export function setActiveScene(scene: SceneKey): void {
  uiStore.set({ scene });
}
