// Tumpukan notifikasi di atas tengah. Desain: docs/40-ui-ux.md §9
import { t } from '../../content/i18n';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function ToastHost() {
  const toasts = useStore(uiStore, (s) => s.toasts);
  return (
    <div class="toast-host" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} class="panel toast">
          {t(toast.key, toast.params)}
        </div>
      ))}
    </div>
  );
}
