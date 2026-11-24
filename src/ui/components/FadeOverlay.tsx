import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function FadeOverlay() {
  const fade = useStore(uiStore, (s) => s.fade);
  return <div class={fade ? 'fade-overlay on' : 'fade-overlay'} aria-hidden="true" />;
}
