import { z } from 'zod';
import id from './i18n/id.json';

export const i18nSchema = z.record(
  z.string().regex(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/, 'Key i18n wajib bertitik, mis. "title.version"'),
  z.string().min(1, 'Teks i18n tidak boleh kosong'),
);

export type I18nKey = keyof typeof id;
export type I18nParams = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

export function interpolate(template: string, params: I18nParams = {}): string {
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function t(key: I18nKey, params?: I18nParams): string {
  return interpolate(id[key], params);
}
