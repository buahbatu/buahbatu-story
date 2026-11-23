import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface ShResult {
  ok: boolean;
  out: string;
  err: string;
}

export function sh(command: string, args: string[], options: SpawnSyncOptions = {}): ShResult {
  const r = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', timeout: 120_000, ...options });
  return { ok: r.status === 0, out: String(r.stdout).trim(), err: String(r.stderr).trim() };
}

export const isMain = (url: string): boolean => Boolean(process.argv[1]) && resolve(process.argv[1] ?? '') === fileURLToPath(url);

export const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));
