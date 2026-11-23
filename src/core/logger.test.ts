import { describe, expect, it } from 'vitest';

import { createLogger, redact, type LogLevel } from './logger';

function capture(minLevel: LogLevel = 'debug') {
  const lines: { level: LogLevel; scope: string; args: readonly unknown[] }[] = [];
  const log = createLogger('test', {
    minLevel,
    sink: (level, scope, args) => lines.push({ level, scope, args }),
  });
  return { log, lines };
}

// Token PALSU dirakit saat runtime supaya tidak ada literal berpola rahasia di repo
// (menghindari alarm palsu push protection GitHub / gitleaks).
const fake = (prefix: string, length = 30) => `${prefix}${'x'.repeat(length)}`;
const FAKE_JWT = ['eyJ', 'x'.repeat(12), '.', 'y'.repeat(12), '.', 'z'.repeat(12)].join('');

describe('redact', () => {
  it.each([
    ['JWT', `key=${FAKE_JWT}`],
    ['token GitHub', `pakai ${fake('gh' + 'p_')}`],
    ['PAT GitHub', fake('github' + '_pat_')],
    ['secret Supabase', fake('sb_' + 'secret_')],
    ['PAT Supabase', fake('sb' + 'p_')],
    ['Bearer', 'Authorization: Bearer abc.def.ghijklmnop'],
  ])('menyamarkan %s di dalam teks', (_, text) => {
    const out = redact(text) as string;
    expect(out).toContain('****');
    expect(out).not.toMatch(/xxxxxxxxxx|abc\.def/);
  });

  it('menyamarkan field bernama rahasia, apa pun nilainya', () => {
    expect(
      redact({ email: 'a@b.c', password: 'hunter2', apiKey: 'x', serviceRoleKey: 'y', nested: { token: 1 } }),
    ).toEqual({
      email: 'a@b.c',
      password: '****',
      apiKey: '****',
      serviceRoleKey: '****',
      nested: { token: '****' },
    });
  });

  it('teks & angka biasa tidak diubah', () => {
    expect(redact({ day: 3, note: 'panen stroberi' })).toEqual({ day: 3, note: 'panen stroberi' });
  });

  it('aman untuk objek siklik', () => {
    const a: Record<string, unknown> = { name: 'a' };
    a.self = a;
    expect(redact(a)).toEqual({ name: 'a', self: '[siklik]' });
  });

  it('Error tetap terbaca tapi pesannya disamarkan', () => {
    const out = redact(new Error(`gagal dengan ${fake('gh' + 'p_')}`)) as { message: string };
    expect(out.message).toBe('gagal dengan ****');
  });
});

describe('createLogger', () => {
  it('menyaring berdasarkan level minimum', () => {
    const { log, lines } = capture('warn');
    log.debug('a');
    log.info('b');
    log.warn('c');
    log.error('d');
    expect(lines.map((l) => l.level)).toEqual(['warn', 'error']);
  });

  it('argumen sudah disamarkan sebelum sampai ke sink', () => {
    const { log, lines } = capture();
    log.info('login', { password: 'rahasia' });
    expect(lines[0]?.args).toEqual(['login', { password: '****' }]);
  });

  it('child menambah scope dan mewarisi level & sink', () => {
    const { log, lines } = capture('info');
    const child = log.child('net');
    child.debug('tidak muncul');
    child.info('muncul');
    expect(lines).toEqual([{ level: 'info', scope: 'test:net', args: ['muncul'] }]);
  });
});
