import type { I18nKey } from '../../content/i18n';
import { t } from '../../content/i18n';

export function FatalError({ message }: { message: I18nKey }) {
  return (
    <div class="fatal panel" role="alert">
      {t(message)}
    </div>
  );
}
