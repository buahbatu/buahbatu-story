import { t } from '../../content/i18n';

export function RotateHint() {
  return (
    <div class="rotate-hint" role="alert">
      <div class="rotate-phone" aria-hidden="true">
        <div class="rotate-screen" />
      </div>
      <p class="rotate-title">{t('rotate.title')}</p>
      <p class="rotate-body">{t('rotate.body')}</p>
    </div>
  );
}
