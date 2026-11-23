// Menjaga konfigurasi repo: env template sinkron dengan docs, rahasia & konten personal ter-ignore,
// vercel.json sesuai aturan deploy. Desain: docs/51 §4, §6, §7 · docs/43 §1 · ADR-010, ADR-014
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

const envExample = read('.env.example');
const envNames = new Set([...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]));

describe('.env.example', () => {
  it('memuat semua variabel di tabel docs/51 §4', () => {
    const section = read('docs/51-otomasi-akun-env.md').split('## 4.')[1]?.split('\n## ')[0] ?? '';
    const documented = [...section.matchAll(/`([A-Z][A-Z0-9_]{2,})`/g)].map((m) => m[1] ?? '');
    expect(documented.length).toBeGreaterThan(10);
    expect(documented.filter((name) => !envNames.has(name))).toEqual([]);
  });

  it('semua nilai kosong (template tidak pernah berisi rahasia atau data pribadi)', () => {
    const filled = envExample.split(/\r?\n/).filter((line) => /^[A-Z][A-Z0-9_]*=\S/.test(line));
    expect(filled).toEqual([]);
  });

  it('variabel VITE_* (ter-bundle ke browser) tidak boleh berupa rahasia', () => {
    const vite = [...envNames].filter((name) => name?.startsWith('VITE_'));
    expect(vite.filter((name) => /SECRET|SERVICE_ROLE|PASSWORD|TOKEN/.test(name ?? ''))).toEqual([]);
  });
});

describe('.gitignore', () => {
  const ignore = read('.gitignore').split(/\r?\n/);

  it.each(['.env*', '!.env.example', '.vercel', '.vercel-cli/', 'src/content/personal/', 'node_modules/'])(
    'memuat %s',
    (entry) => {
      expect(ignore).toContain(entry);
    },
  );

  it('!.env.example ada SETELAH .env* (kalau terbalik, template ikut ter-ignore)', () => {
    expect(ignore.indexOf('!.env.example')).toBeGreaterThan(ignore.indexOf('.env*'));
  });
});

describe('vercel.json', () => {
  const vercel = JSON.parse(read('vercel.json')) as {
    git?: { deploymentEnabled?: boolean };
    outputDirectory?: string;
    crons?: { path: string }[];
    headers?: { source: string; headers: { key: string; value: string }[] }[];
  };

  it('deploy hanya lewat CI yang sudah dites (docs/51 §6)', () => {
    expect(vercel.git?.deploymentEnabled).toBe(false);
  });

  it('output sesuai build Vite', () => {
    expect(vercel.outputDirectory).toBe('dist');
  });

  it('cache immutable hanya untuk file ber-hash di /_app/', () => {
    const immutable = (vercel.headers ?? []).filter((h) =>
      h.headers.some((x) => x.key === 'Cache-Control' && x.value.includes('immutable')),
    );
    expect(immutable.map((h) => h.source)).toEqual(['/_app/(.*)']);
  });

  it('setiap cron menunjuk fungsi yang benar-benar ada (deploy gagal kalau tidak)', () => {
    for (const cron of vercel.crons ?? []) {
      expect(existsSync(join(root, `${cron.path.replace(/^\//, '')}.ts`)), cron.path).toBe(true);
    }
  });

  it('tidak berisi rahasia', () => {
    expect(read('vercel.json')).not.toMatch(/SECRET|SERVICE_ROLE|TOKEN|PASSWORD/i);
  });
});
