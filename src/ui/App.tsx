import { SCENE } from '../scenes/keys';
import { FatalError } from './components/FatalError';
import { LoadingBar } from './components/LoadingBar';
import { TitleOverlay } from './components/TitleOverlay';
import { ToastHost } from './components/ToastHost';
import { InteractPrompt } from './hud/InteractPrompt';
import { FadeOverlay } from './components/FadeOverlay';
import { DialogBox, DialogLog } from './dialog/DialogBox';
import { TouchControls } from './touch/TouchControls';
import { DebugPanel } from './debug/DebugPanel';
import { VersionBadge } from './components/VersionBadge';
import { GraphicsMenu, SettingsButton } from './menus/GraphicsMenu';
import { uiStore } from './uiState';
import { useStore } from './useStore';

export function App() {
  const scene = useStore(uiStore, (s) => s.scene);
  const loading = useStore(uiStore, (s) => s.loading);
  const fatal = useStore(uiStore, (s) => s.fatal);
  const dialog = useStore(uiStore, (s) => s.dialog !== null);
  return (
    <div class="ui-root">
      {fatal && <FatalError message={fatal} />}
      {loading !== null && <LoadingBar progress={loading} />}
      {scene === SCENE.title && <TitleOverlay />}
      {scene === SCENE.title && <VersionBadge />}
      {scene === SCENE.world && <InteractPrompt />}
      {scene === SCENE.world && !dialog && <TouchControls />}
      {scene === SCENE.world && <DialogBox />}
      {scene === SCENE.world && <DialogLog />}
      {scene === SCENE.world && <FadeOverlay />}
      {scene === SCENE.world && <DebugPanel />}
      {(scene === SCENE.title || scene === SCENE.world) && <SettingsButton />}
      <GraphicsMenu />
      <ToastHost />
    </div>
  );
}
