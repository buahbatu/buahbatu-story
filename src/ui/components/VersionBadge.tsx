import { t } from '../../content/i18n';

export function VersionBadge() {
  return <div class="version-badge">{t('title.version', { version: __APP_VERSION__ })}</div>;
}
