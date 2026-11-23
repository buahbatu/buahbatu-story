import { describe, expect, it } from 'vitest';

import { i18nSchema, interpolate, t } from './i18n';

describe('interpolate', () => {
  it('mengisi placeholder', () => {
    expect(interpolate('Halo {name}, uangmu Rp{money}', { name: 'Asep', money: 1500 })).toBe(
      'Halo Asep, uangmu Rp1500',
    );
  });

  it('placeholder yang sama boleh muncul berkali-kali', () => {
    expect(interpolate('{a}-{a}', { a: 1 })).toBe('1-1');
  });

  it('placeholder tanpa nilai dibiarkan supaya mudah ketahuan', () => {
    expect(interpolate('Versi {version}')).toBe('Versi {version}');
  });

  it('nilai 0 tetap ditulis', () => {
    expect(interpolate('{percent}%', { percent: 0 })).toBe('0%');
  });
});

describe('t', () => {
  it('mengambil teks dari id.json', () => {
    expect(t('title.version', { version: '0.1.0' })).toBe('Versi 0.1.0');
  });
});

describe('i18nSchema', () => {
  it('menerima key bertitik camelCase', () => {
    expect(i18nSchema.safeParse({ 'shop.notEnoughMoney': 'Uangnya kurang' }).success).toBe(true);
  });

  it.each([{ title: 'x' }, { 'Title.version': 'x' }, { 'title.version': '' }, { 'title-version.x': 'x' }])(
    'menolak %j',
    (data) => {
      expect(i18nSchema.safeParse(data).success).toBe(false);
    },
  );
});
