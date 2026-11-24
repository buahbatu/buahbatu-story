import { TOUCH_CONTROLS } from '../../config/controls';
import { t } from '../../content/i18n';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';

export function InteractPrompt() {
  const prompt = useStore(uiStore, (s) => s.prompt);
  const touch = useStore(uiStore, (s) => s.touch);
  if (!prompt) return null;
  return (
    <div class="panel interact-prompt" style={{ left: `${(prompt.x * 100).toFixed(2)}%`, top: `${(prompt.y * 100).toFixed(2)}%` }}>
      <span class="key-cap">{touch ? TOUCH_CONTROLS.promptKey : prompt.key}</span>
      <span class="prompt-text">{t(prompt.text)}</span>
    </div>
  );
}
