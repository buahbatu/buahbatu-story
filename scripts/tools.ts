#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installHooks } from './hooks.ts';
import { ROOT, errorMessage, isMain } from './lib/proc.ts';

export const GITLEAKS_VERSION = '8.30.1';
export const TOOLS_DIR = join(ROOT, '.tools');
const OS: Record<string, string> = { win32: 'windows', linux: 'linux', darwin: 'darwin' };
const CPU: Record<string, string> = { x64: 'x64', arm64: 'arm64' };
const BIN = process.platform === 'win32' ? 'gitleaks.exe' : 'gitleaks';

export function gitleaksAsset(platform: string, arch: string, version: string): string | null {
  const os = OS[platform];
  const cpu = CPU[arch];
  return os && cpu ? `gitleaks_${version}_${os}_${cpu}.${os === 'windows' ? 'zip' : 'tar.gz'}` : null;
}

export function parseChecksums(text: string): Record<string, string> {
  const sums: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})\s+\*?(\S+)$/i.exec(line.trim());
    if (match?.[1] && match[2]) sums[match[2]] = match[1].toLowerCase();
  }
  return sums;
}

export const gitleaksPath = (): string => join(TOOLS_DIR, 'gitleaks', BIN);

export function installedGitleaksVersion(): string | null {
  if (!existsSync(gitleaksPath())) return null;
  const out = spawnSync(gitleaksPath(), ['version'], { encoding: 'utf8' });
  return out.status === 0 ? out.stdout.trim().replace(/^v/, '') : null;
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Gagal mengunduh ${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function extract(archive: string, into: string): void {
  const tar = process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
  const result = spawnSync(tar, ['-xf', archive, '-C', into], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Gagal mengekstrak ${archive}: ${result.stderr || (result.error?.message ?? '')}`);
}

export async function installGitleaks({ log = console.log } = {}): Promise<void> {
  if (installedGitleaksVersion() === GITLEAKS_VERSION) {
    log(`✅ gitleaks ${GITLEAKS_VERSION} sudah terpasang (.tools/gitleaks)`);
    return;
  }
  const asset = gitleaksAsset(process.platform, process.arch, GITLEAKS_VERSION);
  if (!asset) throw new Error(`Platform ${process.platform}/${process.arch} belum didukung untuk gitleaks`);
  const base = `https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}`;
  const work = mkdtempSync(join(tmpdir(), 'bb-gitleaks-'));
  try {
    log(`⬇️  Mengunduh ${asset} …`);
    const [archive, sums] = await Promise.all([
      download(`${base}/${asset}`),
      download(`${base}/gitleaks_${GITLEAKS_VERSION}_checksums.txt`),
    ]);
    const expected = parseChecksums(sums.toString('utf8'))[asset];
    const actual = createHash('sha256').update(archive).digest('hex');
    if (expected !== actual) throw new Error(`Checksum ${asset} TIDAK cocok (harap ${expected ?? '?'}, dapat ${actual}). Dibatalkan.`);
    log(`🔐 Checksum SHA-256 cocok (${actual.slice(0, 12)}…)`);
    writeFileSync(join(work, asset), archive);
    mkdirSync(join(work, 'out'));
    extract(join(work, asset), join(work, 'out'));
    mkdirSync(join(TOOLS_DIR, 'gitleaks'), { recursive: true });
    copyFileSync(join(work, 'out', BIN), gitleaksPath());
    if (process.platform !== 'win32') chmodSync(gitleaksPath(), 0o755);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  log(`✅ gitleaks ${installedGitleaksVersion() ?? '?'} terpasang di .tools/gitleaks`);
}

if (isMain(import.meta.url)) {
  installGitleaks().then(
    () => installHooks(),
    (error: unknown) => {
      console.error(`❌ ${errorMessage(error)}`);
      process.exit(1);
    },
  );
}
