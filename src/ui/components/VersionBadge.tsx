// Versi game di layar judul (docs/50 §9).
import { t } from '../../content/i18n';

export function VersionBadge() {
  return <div class="version-badge">{t('title.version', { version: __APP_VERSION__ })}</div>;
}
