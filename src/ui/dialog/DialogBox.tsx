import { t } from '../../content/i18n';
import { requestDialog } from '../../systems/dialog/requests';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

const PORTRAIT_COLORS = ['#c96f53', '#4f8f4a', '#3f6e9a', '#8e3b46', '#b08a3a', '#6b5a9a'];

export const portraitColor = (id: string): string =>
  PORTRAIT_COLORS[Array.from(id).reduce((h, c) => (h * 31 + (c.codePointAt(0) ?? 0)) % 9973, 7) % PORTRAIT_COLORS.length] ?? '#8a5a36';

export function DialogBox() {
  const dialog = useStore(uiStore, (s) => s.dialog);
  if (!dialog) return null;
  const advance = () => {
    requestDialog({ type: 'advance' });
  };
  return (
    <div class="dialog-box ornate interactive" role="dialog" aria-label={dialog.speaker} onClick={advance}>
      <div class="dialog-portrait" style={{ background: portraitColor(dialog.portrait) }} aria-hidden="true">
        <span>{dialog.speaker.slice(0, 1)}</span>
      </div>
      <div class="dialog-body">
        <div class="dialog-name">{dialog.speaker}</div>
        {dialog.choices.length > 0 ? (
          <ol class="dialog-choices">
            {dialog.choices.map((c, i) => (
              <li
                key={c}
                class={i === dialog.choice ? 'selected' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  requestDialog({ type: 'pick', index: i });
                }}
              >
                {c}
              </li>
            ))}
          </ol>
        ) : (
          <p class="dialog-text">
            {dialog.text}
            {dialog.complete && (
              <span class="dialog-next" aria-label={t('dialog.next')}>
                ▼
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function DialogLog() {
  const open = useStore(uiStore, (s) => s.dialogLogOpen);
  const log = useStore(uiStore, (s) => s.dialogLog);
  if (!open) return null;
  return (
    <div class="dialog-log ornate interactive" role="log" aria-label={t('dialog.log')}>
      <div class="dialog-name">{t('dialog.log')}</div>
      {log.length === 0 ? (
        <p>{t('dialog.logEmpty')}</p>
      ) : (
        <ul>
          {log.map((e, i) => (
            <li key={i}>
              <b>{e.speaker}:</b> {e.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
