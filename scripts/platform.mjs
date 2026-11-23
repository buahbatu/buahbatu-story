#!/usr/bin/env node
// Menjalankan gh / vercel / supabase dengan akun proyek ini, tanpa mengubah login global.
// Desain: docs/51-otomasi-akun-env.md §2a & §3, ADR-014.
//
//   node scripts/platform.mjs gh <argumen...>        → GH_TOKEN dari keyring gh akun `buahbatu`
//   node scripts/platform.mjs vercel <argumen...>    → login Vercel tersimpan di .vercel-cli/ (per folder)
//   node scripts/platform.mjs supabase <argumen...>  → SUPABASE_ACCESS_TOKEN dari .env.local
//
// Nilai token tidak pernah dicetak.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readEnvFile } from './lib/env.mjs';

export const GITHUB_ACCOUNT = 'buahbatu';
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const VERCEL_CONFIG_DIR = join(ROOT, '.vercel-cli');

/** Env proyek dari .env.local (nilai kosong tidak dimasukkan). */
export const projectEnv = () => readEnvFile(join(ROOT, '.env.local'));

/** Token GitHub akun proyek dari keyring gh, atau null kalau belum login. */
export function tryGithubToken() {
  try {
    const token = execFileSync('gh', ['auth', 'token', '-u', GITHUB_ACCOUNT], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return token || null;
  } catch {
    return null;
  }
}

/** [perintah, argumen awal] untuk Vercel CLI, atau null kalau belum terpasang. */
export function findVercel() {
  if (process.platform !== 'win32') return ['vercel', []];
  const entry = join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
  return existsSync(entry) ? [process.execPath, [entry]] : null;
}

/** Argumen global Vercel untuk proyek ini (config per folder + token/scope opsional). */
export function vercelArgs(env = projectEnv()) {
  return [
    '--global-config',
    VERCEL_CONFIG_DIR,
    ...(env.VERCEL_TOKEN ? ['--token', env.VERCEL_TOKEN] : []),
    ...(env.VERCEL_SCOPE ? ['--scope', env.VERCEL_SCOPE] : []),
  ];
}

/** [perintah, argumen awal] untuk Supabase CLI (devDependency), atau null. */
export function findSupabase() {
  const packageDir = join(ROOT, 'node_modules', 'supabase');
  const manifest = join(packageDir, 'package.json');
  if (!existsSync(manifest)) return null;
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8'));
  return [process.execPath, [join(packageDir, typeof bin === 'string' ? bin : bin.supabase)]];
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run(command, args, env) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.error) fail(`Gagal menjalankan ${command}: ${result.error.message}`);
  process.exit(result.status ?? 1);
}

function main() {
  const [tool, ...args] = process.argv.slice(2);
  switch (tool) {
    case 'gh': {
      const token = tryGithubToken();
      if (!token) fail(`Akun GitHub ${GITHUB_ACCOUNT} belum login. Jalankan: npm run doctor`);
      return run('gh', args, { GH_TOKEN: token });
    }
    case 'vercel': {
      const vercel = findVercel();
      if (!vercel) fail('Vercel CLI belum terpasang. Jalankan: npm install --global vercel');
      return run(vercel[0], [...vercel[1], ...vercelArgs(), ...args], {});
    }
    case 'supabase': {
      const env = projectEnv();
      if (!env.SUPABASE_ACCESS_TOKEN) fail('SUPABASE_ACCESS_TOKEN belum diisi di .env.local');
      const supabase = findSupabase();
      if (!supabase) fail('Supabase CLI belum terpasang. Jalankan: npm install');
      return run(supabase[0], [...supabase[1], ...args], {
        SUPABASE_ACCESS_TOKEN: env.SUPABASE_ACCESS_TOKEN,
      });
    }
    default:
      return fail('Pemakaian: node scripts/platform.mjs <gh|vercel|supabase> [argumen...]');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
