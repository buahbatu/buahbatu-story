import { t } from '../../content/i18n';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function DebugPanel() {
  const info = useStore(uiStore, (s) => s.debug);
  const layers = useStore(uiStore, (s) => s.debugLayers);
  if (!info) return null;
  const toggle = (key: keyof typeof layers) => {
    uiStore.set((s) => ({ debugLayers: { ...s.debugLayers, [key]: !s.debugLayers[key] } }));
  };
  return (
    <div class="debug-panel interactive" data-testid="debug-panel">
      <div class="debug-fps">
        {info.fps} FPS · {info.ms} ms
      </div>
      <div>
        {t('debug.calls')} {info.calls} · {t('debug.triangles')} {info.triangles}
      </div>
      <div>
        {t('debug.area')} {info.area}
      </div>
      <div>
        {t('debug.position')} {info.x.toFixed(2)}, {info.y.toFixed(2)} · {t('debug.tile')} {Math.floor(info.x)},{Math.floor(info.y)}
      </div>
      <div>
        {t('debug.height')} {info.height.toFixed(2)}
      </div>
      <div class="debug-toggles">
        <button
          type="button"
          class={layers.collision ? 'on' : ''}
          aria-pressed={layers.collision}
          onClick={() => {
            toggle('collision');
          }}
        >
          {t('debug.collision')}
        </button>
        <button
          type="button"
          class={layers.grid ? 'on' : ''}
          aria-pressed={layers.grid}
          onClick={() => {
            toggle('grid');
          }}
        >
          {t('debug.grid')}
        </button>
      </div>
    </div>
  );
}
