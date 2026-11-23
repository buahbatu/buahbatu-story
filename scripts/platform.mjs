#!/usr/bin/env node
// Menjalankan gh / vercel / supabase dengan akun proyek ini, tanpa mengubah login global.
// Desain: docs/51-otomasi-akun-env.md §3, ADR-014.
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

export const GITHUB_ACCOUNT = 'buahbatu';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

export function readEnvFile(file = join(root, '.env.local')) {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!match) continue;
    // Buang komentar di belakang nilai (`KEY=   # catatan`) dan spasi.
    const value = match[2].replace(/\s+#.*$/, '').trim();
    if (value) env[match[1]] = value;
  }
  return env;
}

export function githubToken() {
  try {
    return execFileSync('gh', ['auth', 'token', '-u', GITHUB_ACCOUNT], { encoding: 'utf8' }).trim();
  } catch {
    return fail(`Akun GitHub ${GITHUB_ACCOUNT} belum login. Jalankan: gh auth login --web (lalu gh auth switch kembali ke akun semula)`);
  }
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.error) fail(`Gagal menjalankan ${command}: ${result.error.message}`);
  process.exit(result.status ?? 1);
}

function vercelCommand() {
  if (process.platform !== 'win32') return ['vercel', []];
  const entry = join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
  if (!existsSync(entry)) fail('Vercel CLI belum terpasang. Jalankan: npm install --global vercel');
  return [process.execPath, [entry]];
}

function supabaseCommand() {
  const packageDir = join(root, 'node_modules', 'supabase');
  const manifest = join(packageDir, 'package.json');
  if (!existsSync(manifest)) fail('Supabase CLI belum terpasang. Jalankan: npm install');
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8'));
  return [process.execPath, [join(packageDir, typeof bin === 'string' ? bin : bin.supabase)]];
}

function main() {
  const [tool, ...args] = process.argv.slice(2);
  switch (tool) {
    case 'gh':
      return run('gh', args, { GH_TOKEN: githubToken() });
    case 'vercel': {
      const [command, prefix] = vercelCommand();
      const { VERCEL_TOKEN, VERCEL_SCOPE } = readEnvFile();
      const extra = [
        ...(VERCEL_TOKEN ? ['--token', VERCEL_TOKEN] : []),
        ...(VERCEL_SCOPE ? ['--scope', VERCEL_SCOPE] : []),
      ];
      return run(command, [...prefix, '--global-config', join(root, '.vercel-cli'), ...extra, ...args], {});
    }
    case 'supabase': {
      const env = readEnvFile();
      if (!env.SUPABASE_ACCESS_TOKEN) fail('SUPABASE_ACCESS_TOKEN belum diisi di .env.local');
      const [command, prefix] = supabaseCommand();
      return run(command, [...prefix, ...args], { SUPABASE_ACCESS_TOKEN: env.SUPABASE_ACCESS_TOKEN });
    }
    default:
      return fail('Pemakaian: node scripts/platform.mjs <gh|vercel|supabase> [argumen...]');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
