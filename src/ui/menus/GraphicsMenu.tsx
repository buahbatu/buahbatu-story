import { useEffect } from 'preact/hooks';
import { t, type I18nKey } from '../../content/i18n';
import type { AudioSettings } from '../../config/audio';
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

const AUDIO_ROWS = [
  { key: 'master', label: 'settings.audio.master' },
  { key: 'music', label: 'settings.audio.music' },
  { key: 'sfx', label: 'settings.audio.sfx' },
  { key: 'ambience', label: 'settings.audio.ambience' },
] as const satisfies readonly { key: keyof AudioSettings; label: I18nKey }[];

const TABS = [
  { key: 'graphics', label: 'settings.tab.graphics' },
  { key: 'audio', label: 'settings.tab.audio' },
] as const;

function GraphicsTab({ graphics }: { graphics: GraphicsSettings }) {
  const pick = (key: keyof GraphicsSettings, value: unknown) => {
    uiStore.set({ graphics: { ...graphics, [key]: value } });
  };
  return (
    <>
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
    </>
  );
}

function AudioTab({ audio }: { audio: AudioSettings }) {
  const change = (key: keyof AudioSettings, patch: Partial<AudioSettings[keyof AudioSettings]>) => {
    uiStore.set({ audio: { ...audio, [key]: { ...audio[key], ...patch } } });
  };
  return (
    <>
      {AUDIO_ROWS.map((row) => {
        const value = audio[row.key];
        const name = t(row.label);
        return (
          <div class="settings-row" key={row.key} role="group" aria-label={name}>
            <span class="settings-label">{name}</span>
            <div class="settings-choices">
              <input
                type="range"
                class="settings-volume"
                min={0}
                max={100}
                step={5}
                value={Math.round(value.volume * 100)}
                disabled={!value.on}
                data-audio={row.key}
                aria-label={t('settings.audio.volume', { name })}
                onInput={(e) => {
                  change(row.key, { volume: Number(e.currentTarget.value) / 100 });
                }}
              />
              <button
                type="button"
                class="settings-choice settings-toggle"
                data-audio-toggle={row.key}
                aria-pressed={value.on}
                onClick={() => {
                  change(row.key, { on: !value.on });
                }}
              >
                {t(value.on ? 'settings.fx.on' : 'settings.fx.off')}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function GraphicsMenu() {
  const open = useStore(uiStore, (s) => s.settingsOpen);
  const graphics = useStore(uiStore, (s) => s.graphics);
  const audio = useStore(uiStore, (s) => s.audio);
  const tab = useStore(uiStore, (s) => s.settingsTab);
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
  return (
    <div class="settings-backdrop interactive" onPointerDown={stop} onClick={close}>
      <div class="settings-panel panel" role="dialog" aria-modal="true" aria-label={t('settings.menu')} onClick={stop}>
        <h2 class="settings-title">{t('settings.menu')}</h2>
        <div class="settings-tabs" role="tablist">
          {TABS.map((x) => (
            <button
              type="button"
              role="tab"
              key={x.key}
              class="settings-tab"
              data-tab={x.key}
              aria-selected={tab === x.key}
              onClick={() => {
                uiStore.set({ settingsTab: x.key });
              }}
            >
              {t(x.label)}
            </button>
          ))}
        </div>
        <div role="tabpanel" aria-label={t(tab === 'audio' ? 'settings.tab.audio' : 'settings.tab.graphics')}>
          {tab === 'audio' && audio ? <AudioTab audio={audio} /> : <GraphicsTab graphics={graphics} />}
        </div>
        <p class="settings-note">{t('settings.saved')}</p>
        <button type="button" class="settings-close" onClick={close}>
          {t('settings.close')}
        </button>
      </div>
    </div>
  );
}
