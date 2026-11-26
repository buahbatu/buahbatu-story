import { useEffect } from 'preact/hooks';
import { t, type I18nKey } from '../../content/i18n';
import type { GraphicsSettings } from '../../render/settings';
import { Icon } from '../touch/icons';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

const stop = (e: Event) => {
  e.stopPropagation();
};

const close = () => {
  uiStore.set({ settingsOpen: false });
};

interface Choice<T> {
  value: T;
  label: I18nKey;
}

const ROWS = [
  {
    key: 'tier',
    label: 'settings.quality',
    choices: [
      { value: 'auto', label: 'settings.quality.auto' },
      { value: 'low', label: 'settings.quality.low' },
      { value: 'balanced', label: 'settings.quality.balanced' },
      { value: 'high', label: 'settings.quality.high' },
    ],
  },
  {
    key: 'fx',
    label: 'settings.fx',
    choices: [
      { value: true, label: 'settings.fx.on' },
      { value: false, label: 'settings.fx.off' },
    ],
  },
  {
    key: 'curve',
    label: 'settings.curve',
    choices: [
      { value: 'strong', label: 'settings.curve.strong' },
      { value: 'soft', label: 'settings.curve.soft' },
      { value: 'off', label: 'settings.curve.off' },
    ],
  },
] as const satisfies readonly { key: keyof GraphicsSettings; label: I18nKey; choices: readonly Choice<unknown>[] }[];

export function SettingsButton() {
  const open = useStore(uiStore, (s) => s.settingsOpen);
  return (
    <button
      type="button"
      class="settings-button interactive"
      aria-label={t('settings.open')}
      aria-expanded={open}
      onPointerDown={stop}
      onClick={() => {
        uiStore.set({ settingsOpen: !open });
      }}
    >
      <Icon name="sliders" class="settings-icon" />
    </button>
  );
}

export function GraphicsMenu() {
  const open = useStore(uiStore, (s) => s.settingsOpen);
  const graphics = useStore(uiStore, (s) => s.graphics);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (!open || !graphics) return null;
  const pick = (key: keyof GraphicsSettings, value: unknown) => {
    uiStore.set({ graphics: { ...graphics, [key]: value } });
  };
  return (
    <div class="settings-backdrop interactive" onPointerDown={stop} onClick={close}>
      <div class="settings-panel panel" role="dialog" aria-modal="true" aria-label={t('settings.title')} onClick={stop}>
        <h2 class="settings-title">{t('settings.title')}</h2>
        {ROWS.map((row) => (
          <div class="settings-row" key={row.key} role="group" aria-label={t(row.label)}>
            <span class="settings-label">{t(row.label)}</span>
            <div class="settings-choices">
              {row.choices.map((c) => (
                <button
                  type="button"
                  key={String(c.value)}
                  class="settings-choice"
                  data-setting={row.key}
                  data-value={String(c.value)}
                  aria-pressed={graphics[row.key] === c.value}
                  onClick={() => {
                    pick(row.key, c.value);
                  }}
                >
                  {t(c.label)}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p class="settings-note">{t('settings.saved')}</p>
        <button type="button" class="settings-close" onClick={close}>
          {t('settings.close')}
        </button>
      </div>
    </div>
  );
}
