import { t } from '../../content/i18n';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function FadeOverlay() {
  const fade = useStore(uiStore, (s) => s.fade);
  const place = useStore(uiStore, (s) => s.place);
  return (
    <div class={fade ? 'fade-overlay on' : 'fade-overlay'} aria-hidden={!fade} role="status">
      {fade && place && (
        <div class="travel-card">
          <span class="travel-to">{t('travel.loading')}</span>
          <strong class="travel-place">{t(place)}</strong>
          <span class="travel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      )}
    </div>
  );
}
