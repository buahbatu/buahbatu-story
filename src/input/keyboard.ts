import type { InputState } from './logic';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export function attachKeyboard(input: InputState, target: Window = window): () => void {
  const down = (e: KeyboardEvent) => {
    if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (input.keyDown(e.code)) e.preventDefault();
  };
  const up = (e: KeyboardEvent) => {
    if (input.keyUp(e.code)) e.preventDefault();
  };
  const blur = () => {
    input.releaseAll();
  };
  const hidden = () => {
    if (document.visibilityState === 'hidden') input.releaseAll();
  };
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  target.addEventListener('blur', blur);
  document.addEventListener('visibilitychange', hidden);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
    target.removeEventListener('blur', blur);
    document.removeEventListener('visibilitychange', hidden);
  };
}
