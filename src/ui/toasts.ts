// Antrean notifikasi (toast). Murni. Desain: docs/40-ui-ux.md §9 (maks. 3 bertumpuk)
import type { I18nKey, I18nParams } from '../content/i18n';

export interface Toast {
  id: number;
  key: I18nKey;
  params?: I18nParams;
  /** Waktu (ms, jam yang sama dengan `now`) saat toast hilang. */
  expiresAt: number;
}

/** Tambah toast baru di akhir; kalau melebihi `max`, yang paling lama dibuang. */
export function pushToast(list: readonly Toast[], toast: Toast, max: number): Toast[] {
  const next = [...list, toast];
  return next.slice(Math.max(0, next.length - Math.max(1, max)));
}

export function expireToasts(list: readonly Toast[], now: number): Toast[] {
  return list.filter((toast) => toast.expiresAt > now);
}
