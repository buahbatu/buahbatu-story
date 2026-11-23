import type { I18nKey, I18nParams } from '../content/i18n';

export interface Toast {
  id: number;
  key: I18nKey;
  params?: I18nParams;
  expiresAt: number;
}

export function pushToast(list: readonly Toast[], toast: Toast, max: number): Toast[] {
  const next = [...list, toast];
  return next.slice(Math.max(0, next.length - Math.max(1, max)));
}

export function expireToasts(list: readonly Toast[], now: number): Toast[] {
  return list.filter((toast) => toast.expiresAt > now);
}
