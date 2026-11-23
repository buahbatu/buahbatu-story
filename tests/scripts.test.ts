import { describe, expect, it } from 'vitest';
import { chromeArgs, pickDeviceCode, pickLoginUrl } from '../scripts/lib/browser.ts';
import { mask, parseEnv, upsertEnv } from '../scripts/lib/env.ts';
import { envsToSync, isProjectHelperList } from '../scripts/setup.ts';
import { exitCode, formatReport, gate } from '../scripts/lib/report.ts';
import { compareTasks, currentTask, isRequiredNow, parseTaskId } from '../scripts/lib/tasks.ts';
import { gitleaksAsset, parseChecksums } from '../scripts/tools.ts';

describe('parseEnv', () => {
  it('membaca KEY=nilai, mengabaikan komentar & nilai kosong', () => {
    const text = ['# komentar', 'A=1', 'B=', 'C=  dua  ', 'D=x # catatan', '', 'export E=e'].join('\n');
    expect(parseEnv(text)).toEqual({ A: '1', C: 'dua', D: 'x', E: 'e' });
  });
  it('melepas tanda kutip dan mempertahankan # di dalam kutip', () => {
    expect(parseEnv(`A="halo # bukan komentar"\nB='x'`)).toEqual({ A: 'halo # bukan komentar', B: 'x' });
  });
  it('nilai kosong yang diikuti komentar tetap dianggap kosong', () => {
    expect(parseEnv('GH_OWNER=                      # username/org\nX=#bukan nilai')).toEqual({});
  });
  it('# di tengah nilai tanpa spasi tetap bagian nilai (mis. warna)', () => {
    expect(parseEnv('COLOR=abc#123')).toEqual({ COLOR: 'abc#123' });
  });
  it('tahan CRLF (file diedit di Windows)', () => {
    expect(parseEnv('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' });
  });
});

describe('upsertEnv', () => {
  const template = ['# judul', 'A=', 'B=sudah', '', 'C=  # catatan', ''].join('\n');
  it('mengisi variabel kosong, mempertahankan komentar & urutan', () => {
    const { text, changed } = upsertEnv(template, { A: '1', C: '3' });
    expect(text).toBe(['# judul', 'A=1', 'B=sudah', '', 'C=3', ''].join('\n'));
    expect(changed).toEqual(['A', 'C']);
  });
  it('TIDAK menimpa nilai yang sudah diisi user (default)', () => {
    expect(upsertEnv(template, { B: 'baru' })).toEqual({ text: template, changed: [] });
  });
  it('overwrite hanya kalau diminta & nilainya memang beda', () => {
    expect(upsertEnv(template, { B: 'baru' }, { overwrite: true }).changed).toEqual(['B']);
    expect(upsertEnv(template, { B: 'sudah' }, { overwrite: true }).changed).toEqual([]);
  });
  it('variabel baru ditambahkan di akhir; nilai kosong diabaikan', () => {
    const { text, changed } = upsertEnv('A=1\n', { NEW: 'x', EMPTY: '' });
    expect(text).toBe('A=1\nNEW=x\n');
    expect(changed).toEqual(['NEW']);
  });
  it('idempotent: menjalankan dua kali tidak mengubah apa-apa lagi', () => {
    const once = upsertEnv(template, { A: '1' }).text;
    expect(upsertEnv(once, { A: '1' })).toEqual({ text: once, changed: [] });
  });
});

describe('setup helpers', () => {
  it('envsToSync hanya variabel yang sudah punya nilai', () => {
    expect(envsToSync({ VITE_SUPABASE_URL: 'https://x.supabase.co', CRON_SECRET: '', OTHER: 'y' })).toEqual(['VITE_SUPABASE_URL']);
  });
  it('envsToSync tidak pernah menyertakan token user (GH/VERCEL/SUPABASE_ACCESS)', () => {
    const all = { GH_TOKEN: 'a', VERCEL_TOKEN: 'b', SUPABASE_ACCESS_TOKEN: 'c', SUPABASE_DB_PASSWORD: 'd' };
    expect(envsToSync(all)).toEqual([]);
  });
  it('pickLoginUrl mengabaikan tautan telemetri/dokumentasi (kasus nyata Vercel CLI run pertama)', () => {
    const out = [
      'Vercel CLI now collects telemetry. Learn more: https://vercel.com/docs/cli/about-telemetry',
      'Visit https://vercel.com/oauth/device?user_code=ABCD-EFGH to log in',
    ].join('\n');
    expect(pickLoginUrl(out)).toBe('https://vercel.com/oauth/device?user_code=ABCD-EFGH');
    expect(pickLoginUrl('Learn more: https://vercel.com/docs/cli/about-telemetry')).toBeUndefined();
  });
  it('pickDeviceCode membaca kode device login', () => {
    expect(pickDeviceCode('! One-time code (C92E-2A3D) copied to clipboard')).toBe('C92E-2A3D');
    expect(pickDeviceCode('tidak ada kode')).toBeUndefined();
  });
  it('isProjectHelperList: wajib [kosong, helper proyek] persis (kasus nyata: output mentah git)', () => {
    const helper = '!f() { echo x; }; f';
    expect(isProjectHelperList(`\n${helper}\n`, helper)).toBe(true);
    expect(isProjectHelperList(`\r\n${helper}\r\n`, helper)).toBe(true);
    expect(isProjectHelperList(`${helper}\n`, helper)).toBe(false);
    expect(isProjectHelperList(`\n!gh auth git-credential\n`, helper)).toBe(false);
    expect(isProjectHelperList('', helper)).toBe(false);
  });
  it('chromeArgs memilih profil kalau diisi', () => {
    expect(chromeArgs('https://x', 'Profile 2')).toEqual(['--profile-directory=Profile 2', 'https://x']);
    expect(chromeArgs('https://x', undefined)).toEqual(['https://x']);
  });
});

describe('mask', () => {
  it('menyisakan prefix & 4 karakter terakhir saja', () => {
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
    const todo = ['- [x] **P0-01** a', '- [ ] **P0-02** b', '- [~] **P0-10a** c', '- [ ] **P0-11** d'].join('\n');
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
