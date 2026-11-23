import { SCENE } from '../scenes/keys';
import { ToastHost } from './components/ToastHost';
import { VersionBadge } from './components/VersionBadge';
import { uiStore } from './uiState';
import { useStore } from './useStore';

export function App() {
  const scene = useStore(uiStore, (s) => s.scene);
  return (
    <div class="ui-root">
      {scene === SCENE.title && <VersionBadge />}
      <ToastHost />
    </div>
  );
}
