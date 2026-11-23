#!/usr/bin/env node
// `npm run tools`: pasang tool biner proyek ke .tools/ (tanpa install global) + aktifkan git hooks.
// Saat ini: gitleaks (pemindai rahasia untuk pre-commit). Idempotent. Desain: docs/51 §7
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { installHooks } from './hooks.mjs';
import { ROOT } from './platform.mjs';

export const GITLEAKS_VERSION = '8.30.1';
export const TOOLS_DIR = join(ROOT, '.tools');

/**
 * Nama file rilis gitleaks untuk platform ini, atau null kalau tidak didukung.
 * @param {string} platform process.platform
 * @param {string} arch process.arch
 * @param {string} version
 */
export function gitleaksAsset(platform, arch, version) {
  const os = { win32: 'windows', linux: 'linux', darwin: 'darwin' }[platform];
  const cpu = { x64: 'x64', arm64: 'arm64' }[arch];
  if (!os || !cpu) return null;
  return `gitleaks_${version}_${os}_${cpu}.${os === 'windows' ? 'zip' : 'tar.gz'}`;
}

/**
 * Parse `checksums.txt` (format sha256sum: `<hash>  <nama file>`).
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseChecksums(text) {
  /** @type {Record<string, string>} */
  const sums = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})\s+\*?(\S+)$/i.exec(line.trim());
    if (match) sums[match[2] ?? ''] = (match[1] ?? '').toLowerCase();
  }
  return sums;
}

/** Path biner gitleaks proyek (mungkin belum ada). */
export function gitleaksPath() {
  return join(TOOLS_DIR, 'gitleaks', process.platform === 'win32' ? 'gitleaks.exe' : 'gitleaks');
}

/** Versi gitleaks terpasang di .tools, atau null. */
export function installedGitleaksVersion() {
  const bin = gitleaksPath();
  if (!existsSync(bin)) return null;
  const out = spawnSync(bin, ['version'], { encoding: 'utf8' });
  return out.status === 0 ? out.stdout.trim().replace(/^v/, '') : null;
}

async function download(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Gagal mengunduh ${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function extract(archive, into) {
  // Windows 10+ punya bsdtar di System32 yang bisa membuka .zip; tar milik Git Bash tidak bisa.
  const tar =
    process.platform === 'win32'
      ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
      : 'tar';
  const result = spawnSync(tar, ['-xf', archive, '-C', into], { encoding: 'utf8' });
  if (result.status !== 0)
    throw new Error(`Gagal mengekstrak ${archive}: ${result.stderr || result.error?.message}`);
}

export async function installGitleaks({ log = console.log } = {}) {
  const current = installedGitleaksVersion();
  if (current === GITLEAKS_VERSION) {
    log(`✅ gitleaks ${current} sudah terpasang (.tools/gitleaks)`);
    return;
  }
  const asset = gitleaksAsset(process.platform, process.arch, GITLEAKS_VERSION);
  if (!asset) throw new Error(`Platform ${process.platform}/${process.arch} belum didukung untuk gitleaks`);

  const base = `https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}`;
  // Unduhan diperlakukan sebagai data tak tepercaya: folder sementara baru, cek SHA-256 dulu.
  const work = mkdtempSync(join(tmpdir(), 'bb-gitleaks-'));
  try {
    log(`⬇️  Mengunduh ${asset} …`);
    const [archive, sums] = await Promise.all([
      download(`${base}/${asset}`),
      download(`${base}/gitleaks_${GITLEAKS_VERSION}_checksums.txt`),
    ]);
    const expected = parseChecksums(sums.toString('utf8'))[asset];
    const actual = createHash('sha256').update(archive).digest('hex');
    if (!expected || expected !== actual) {
      throw new Error(
        `Checksum ${asset} TIDAK cocok (harap ${expected ?? '?'}, dapat ${actual}). Dibatalkan.`,
      );
    }
    log(`🔐 Checksum SHA-256 cocok (${actual.slice(0, 12)}…)`);

    const archivePath = join(work, asset);
    writeFileSync(archivePath, archive);
    const unpacked = join(work, 'out');
    mkdirSync(unpacked);
    extract(archivePath, unpacked);

    const binName = process.platform === 'win32' ? 'gitleaks.exe' : 'gitleaks';
    mkdirSync(join(TOOLS_DIR, 'gitleaks'), { recursive: true });
    copyFileSync(join(unpacked, binName), gitleaksPath());
    if (process.platform !== 'win32') chmodSync(gitleaksPath(), 0o755);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  log(`✅ gitleaks ${installedGitleaksVersion() ?? '?'} terpasang di .tools/gitleaks`);
}

async function main() {
  await installGitleaks();
  installHooks();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
