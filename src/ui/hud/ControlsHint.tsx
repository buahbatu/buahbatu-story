import { useEffect } from 'preact/hooks';
import { CONTROLS_HINT, DEFAULT_BINDINGS } from '../../config/controls';
import { t, type I18nKey } from '../../content/i18n';
import type { Action } from '../../input/actions';
import { keyLabel } from '../../world/interact/logic';
import { SCENE } from '../../scenes/keys';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

const keys = (...actions: Action[]) =>
  actions
    .flatMap((a) => DEFAULT_BINDINGS[a].slice(0, 1))
    .map(keyLabel)
    .join(' ');

const alt = (...actions: Action[]) => actions.map((a) => keyLabel(DEFAULT_BINDINGS[a][1])).join(' ');

interface Row {
  label: I18nKey;
  value: string;
  camera?: boolean;
}

function rows(touch: boolean): Row[] {
  if (touch)
    return [
      { label: 'help.move', value: t('help.touchMove') },
      { label: 'help.run', value: t('help.touchRun') },
      { label: 'help.jump', value: t('help.touchJump') },
      { label: 'help.action', value: t('help.touchAction') },
      { label: 'help.rotate', value: t('help.touchRotate'), camera: true },
      { label: 'help.zoom', value: t('help.touchZoom') },
      { label: 'help.pan', value: t('help.touchPan') },
    ];
  return [
    { label: 'help.move', value: `${keys('up', 'left', 'down', 'right')} / ${alt('up', 'left', 'down', 'right')}` },
    { label: 'help.run', value: keys('run') },
    { label: 'help.jump', value: keys('jump') },
    { label: 'help.action', value: keys('interact') },
    { label: 'help.rotate', value: `${keys('cameraLeft')} / ${keys('cameraRight')} · ${t('help.mouseRotate')}`, camera: true },
    { label: 'help.zoom', value: `${t('help.mouseZoom')} · ${keys('zoomIn')} ${keys('zoomOut')}` },
    { label: 'help.pan', value: t('help.mousePan') },
    { label: 'help.settings', value: '⚙' },
  ];
}

const stop = (e: Event) => {
  e.stopPropagation();
};

let shownThisSession =
  import.meta.env.MODE === 'test' && typeof location !== 'undefined' && !new URLSearchParams(location.search).has('hint');

export function HelpButton() {
  const help = useStore(uiStore, (s) => s.help);
  return (
    <button
      type="button"
      class="help-button interactive"
      aria-label={t('help.open')}
      aria-expanded={help !== null}
      onPointerDown={stop}
      onClick={() => {
        uiStore.set({ help: help ? null : 'open' });
      }}
    >
      ?
    </button>
  );
}

export function ControlsHint() {
  const scene = useStore(uiStore, (s) => s.scene);
  const help = useStore(uiStore, (s) => s.help);
  const touch = useStore(uiStore, (s) => s.touch);
  const indoor = useStore(uiStore, (s) => s.indoor);
  useEffect(() => {
    if (scene !== SCENE.world || shownThisSession) return;
    shownThisSession = true;
    uiStore.set({ help: 'auto' });
  }, [scene]);
  useEffect(() => {
    if (help !== 'auto') return undefined;
    const timer = setTimeout(() => {
      if (uiStore.get().help === 'auto') uiStore.set({ help: null });
    }, CONTROLS_HINT.showMs);
    return () => {
      clearTimeout(timer);
    };
  }, [help]);
  useEffect(() => {
    if (!help) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') uiStore.set({ help: null });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [help]);
  if (!help || scene !== SCENE.world) return null;
  return (
    <div class={`controls-hint panel${help === 'auto' ? ' auto' : ''}`} role="dialog" aria-label={t('help.title')} onPointerDown={stop}>
      <h2 class="controls-title">{t('help.title')}</h2>
      <dl class="controls-list">
        {rows(touch).map((r) => (
          <div class="controls-row" key={r.label}>
            <dt>{t(r.label)}</dt>
            <dd>{r.camera && indoor ? `${r.value} (${t('help.locked')})` : r.value}</dd>
          </div>
        ))}
      </dl>
      <p class="controls-note">{t(touch ? 'help.reopenTouch' : 'help.reopen')}</p>
    </div>
  );
}
