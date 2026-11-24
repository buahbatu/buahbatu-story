import { SCENE } from '../scenes/keys';
import { FatalError } from './components/FatalError';
import { LoadingBar } from './components/LoadingBar';
import { TitleOverlay } from './components/TitleOverlay';
import { ToastHost } from './components/ToastHost';
import { InteractPrompt } from './hud/InteractPrompt';
import { VersionBadge } from './components/VersionBadge';
import { uiStore } from './uiState';
import { useStore } from './useStore';

export function App() {
  const scene = useStore(uiStore, (s) => s.scene);
  const loading = useStore(uiStore, (s) => s.loading);
  const fatal = useStore(uiStore, (s) => s.fatal);
  return (
    <div class="ui-root">
      {fatal && <FatalError message={fatal} />}
      {loading !== null && <LoadingBar progress={loading} />}
      {scene === SCENE.title && <TitleOverlay />}
      {scene === SCENE.title && <VersionBadge />}
      {scene === SCENE.world && <InteractPrompt />}
      <ToastHost />
    </div>
  );
}
