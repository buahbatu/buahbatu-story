import { t } from '../../content/i18n';
import { loadingBarFill } from '../../utils/progress';

const INNER = 236;

export function LoadingBar({ progress }: { progress: number }) {
  const { fillWidth, percent } = loadingBarFill(progress, INNER);
  return (
    <div class="loading" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div class="loading-track">
        <div class="loading-fill" style={{ width: `calc(var(--px) * ${fillWidth})` }} />
      </div>
      <p class="loading-label">{t('boot.loading', { percent })}</p>
    </div>
  );
}
