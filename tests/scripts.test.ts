// Logika murni script otomasi (doctor/tools). Desain: docs/51 §5 & §7
import { describe, expect, it } from 'vitest';

import { mask, parseEnv } from '../scripts/lib/env.mjs';
import { exitCode, formatReport, gate } from '../scripts/lib/report.mjs';
import { compareTasks, currentTask, isRequiredNow, parseTaskId } from '../scripts/lib/tasks.mjs';
import { gitleaksAsset, parseChecksums } from '../scripts/tools.mjs';

describe('parseEnv', () => {
  it('membaca KEY=nilai, mengabaikan komentar & nilai kosong', () => {
    const text = ['# komentar', 'A=1', 'B=', 'C=  dua  ', 'D=x # catatan', '', 'export E=e'].join('\n');
    expect(parseEnv(text)).toEqual({ A: '1', C: 'dua', D: 'x', E: 'e' });
  });

  it('melepas tanda kutip dan mempertahankan # di dalam kutip', () => {
    expect(parseEnv(`A="halo # bukan komentar"\nB='x'`)).toEqual({ A: 'halo # bukan komentar', B: 'x' });
  });

  it('tahan CRLF (file diedit di Windows)', () => {
    expect(parseEnv('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' });
  });
});

describe('mask', () => {
  it('menyisakan prefix & 4 karakter terakhir saja', () => {
    // Prefix dirakit supaya tidak ada literal berpola token di repo (gitleaks).
    const fakeToken = 'gh' + 'p_' + 'x'.repeat(30) + 'abcd';
    expect(mask(fakeToken)).toBe('ghp_****abcd');
  });

  it('nilai pendek disamarkan total, kosong ditandai', () => {
    expect(mask('rahasia')).toBe('****');
    expect(mask(undefined)).toBe('(kosong)');
  });
});

describe('urutan task', () => {
  it('parseTaskId', () => {
    expect(parseTaskId('P0-10a')).toEqual([0, 10, 'a']);
    expect(parseTaskId('P12-3')).toEqual([12, 3, '']);
    expect(() => parseTaskId('X1')).toThrow();
  });

  it.each([
    ['P0-09', 'P0-10a'],
    ['P0-10a', 'P0-10b'],
    ['P0-10b', 'P0-11'],
    ['P0-13', 'P1-01'],
    ['P9-12', 'P10-01'],
  ])('%s sebelum %s', (a, b) => {
    expect(compareTasks(a, b)).toBeLessThan(0);
    expect(compareTasks(b, a)).toBeGreaterThan(0);
  });

  it('currentTask: [~] didahulukan, lalu [ ] pertama, undefined kalau semua selesai', () => {
    const todo = ['- [x] **P0-01** a', '- [ ] **P0-02** b', '- [~] **P0-10a** c', '- [ ] **P0-11** d'].join(
      '\n',
    );
    expect(currentTask(todo)).toBe('P0-10a');
    expect(currentTask(todo.replace('[~]', '[x]'))).toBe('P0-02');
    expect(currentTask('- [x] **P0-01** a')).toBeUndefined();
  });

  it('isRequiredNow', () => {
    expect(isRequiredNow('P0-10a', 'P0-10a')).toBe(true);
    expect(isRequiredNow('P0-10a', 'P0-12')).toBe(false);
    expect(isRequiredNow('P6-01', 'P5-01')).toBe(true);
    expect(isRequiredNow(undefined, 'P11-05')).toBe(true);
  });
});

describe('report', () => {
  it('gate: lolos → ok; gagal → fail kalau wajib sekarang, later kalau belum', () => {
    expect(gate(true, false)).toBe('ok');
    expect(gate(false, true)).toBe('fail');
    expect(gate(false, false)).toBe('later');
  });

  it('exitCode 1 hanya kalau ada fail (later/warn tidak menggagalkan)', () => {
    const base = { group: 'G', name: 'n' };
    expect(
      exitCode([
        { ...base, status: 'warn' },
        { ...base, status: 'later' },
      ]),
    ).toBe(0);
    expect(exitCode([{ ...base, status: 'fail' }])).toBe(1);
  });

  it('formatReport mengelompokkan & mendaftar perbaikan hanya untuk fail/warn', () => {
    const text = formatReport([
      { group: 'Tools', name: 'git', status: 'ok' },
      { group: 'Tools', name: 'gitleaks', status: 'fail', fix: 'npm run tools' },
      { group: 'Env', name: 'TOKEN', status: 'later', fix: 'nanti' },
    ]);
    expect(text).toContain('── Tools');
    expect(text).toContain('❌ gitleaks: npm run tools');
    expect(text).not.toContain('TOKEN: nanti');
    expect(text).toContain('1 ok · 0 peringatan · 1 gagal · 1 belum waktunya');
  });
});

describe('tools (gitleaks)', () => {
  it.each([
    ['win32', 'x64', 'gitleaks_8.30.1_windows_x64.zip'],
    ['linux', 'x64', 'gitleaks_8.30.1_linux_x64.tar.gz'],
    ['darwin', 'arm64', 'gitleaks_8.30.1_darwin_arm64.tar.gz'],
  ])('asset %s/%s → %s', (platform, arch, asset) => {
    expect(gitleaksAsset(platform, arch, '8.30.1')).toBe(asset);
  });

  it('platform tidak didukung → null', () => {
    expect(gitleaksAsset('aix', 'ppc64', '8.30.1')).toBeNull();
  });

  it('parseChecksums format sha256sum (termasuk mode biner *)', () => {
    const hash = 'a'.repeat(64);
    expect(parseChecksums(`${hash}  file.zip\n${'B'.repeat(64)} *other.tar.gz\nsampah`)).toEqual({
      'file.zip': hash,
      'other.tar.gz': 'b'.repeat(64),
    });
  });
});
