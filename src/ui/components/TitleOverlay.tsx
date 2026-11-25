import { t } from '../../content/i18n';
import { GameLogo } from '../title/GameLogo';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function TitleOverlay() {
  const touch = useStore(uiStore, (s) => s.touch);
  return (
    <div class="title-overlay">
      <h1 class="title-name">
        <GameLogo />
      </h1>
      <p class="title-tagline">{t('title.tagline')}</p>
      <p class="title-note title-start">{t(touch ? 'title.tap' : 'title.press')}</p>
    </div>
  );
}
