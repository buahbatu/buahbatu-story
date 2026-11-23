import { t } from '../../content/i18n';

export function TitleOverlay() {
  return (
    <div class="title-overlay">
      <h1 class="title-name">{t('game.title')}</h1>
      <p class="title-tagline">{t('title.tagline')}</p>
      <p class="title-note">{t('title.comingSoon')}</p>
    </div>
  );
}
