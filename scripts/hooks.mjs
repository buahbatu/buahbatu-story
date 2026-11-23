#!/usr/bin/env node
// Aktifkan git hooks proyek (.githooks/) untuk repo ini saja (`core.hooksPath` lokal).
// Dipanggil otomatis oleh `npm install` (script prepare) dan `npm run tools`. Desain: docs/51 §7
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
export const HOOKS_PATH = '.githooks';

function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

/** Nilai core.hooksPath lokal saat ini (string kosong kalau belum di-set). */
export function currentHooksPath() {
  return git(['config', '--local', '--get', 'core.hooksPath']).stdout.trim();
}

export function installHooks({ log = console.log } = {}) {
  // Di luar repo git (mis. tarball, beberapa langkah build Vercel): diam saja.
  if (!existsSync(join(ROOT, '.git'))) return false;
  if (currentHooksPath() === HOOKS_PATH) return true;
  const result = git(['config', '--local', 'core.hooksPath', HOOKS_PATH]);
  if (result.status !== 0) {
    log(`⚠️  Gagal mengaktifkan git hooks: ${result.stderr.trim()}`);
    return false;
  }
  log(`✅ Git hooks aktif (${HOOKS_PATH}/), pre-commit memindai rahasia dengan gitleaks`);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) installHooks();
