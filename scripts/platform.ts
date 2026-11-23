#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readEnvFile, type Env } from './lib/env.ts';
import { ROOT, isMain } from './lib/proc.ts';

export { ROOT };
export const GITHUB_ACCOUNT = 'buahbatu';
export const VERCEL_CONFIG_DIR = join(ROOT, '.vercel-cli');
export type Cli = [command: string, prefix: string[]];

export const projectEnv = (): Env => readEnvFile(join(ROOT, '.env.local'));

export function tryGithubToken(): string | null {
  try {
    return (
      execFileSync('gh', ['auth', 'token', '-u', GITHUB_ACCOUNT], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || null
    );
  } catch {
    return null;
  }
}

export function githubScopes(token: string): string[] | null {
  try {
    const headers = execFileSync('gh', ['api', '-i', 'user', '--jq', '.login'], {
      encoding: 'utf8',
      env: { ...process.env, GH_TOKEN: token },
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 20_000,
    });
    return (/^x-oauth-scopes:\s*(.*)$/im.exec(headers)?.[1] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

export function findVercel(): Cli | null {
  if (process.platform !== 'win32') return ['vercel', []];
  const entry = join(process.env.APPDATA ?? '', 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
  return existsSync(entry) ? [process.execPath, [entry]] : null;
}

export const vercelArgs = (env: Env = projectEnv()): string[] => [
  '--global-config',
  VERCEL_CONFIG_DIR,
  ...(env.VERCEL_TOKEN ? ['--token', env.VERCEL_TOKEN] : []),
  ...(env.VERCEL_SCOPE ? ['--scope', env.VERCEL_SCOPE] : []),
];

export function findSupabase(): Cli | null {
  const dir = join(ROOT, 'node_modules', 'supabase');
  const manifest = join(dir, 'package.json');
  if (!existsSync(manifest)) return null;
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8')) as { bin: string | Record<string, string> };
  return [process.execPath, [join(dir, typeof bin === 'string' ? bin : (bin.supabase ?? ''))]];
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run([command, prefix]: Cli, args: string[], env: Env = {}): never {
  const result = spawnSync(command, [...prefix, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.error) fail(`Gagal menjalankan ${command}: ${result.error.message}`);
  process.exit(result.status ?? 1);
}

function main(): never {
  const [tool, ...args] = process.argv.slice(2);
  if (tool === 'gh')
    return run(['gh', []], args, {
      GH_TOKEN: tryGithubToken() ?? fail(`Akun GitHub ${GITHUB_ACCOUNT} belum login. Jalankan: npm run doctor`),
    });
  if (tool === 'vercel')
    return run(findVercel() ?? fail('Vercel CLI belum terpasang. Jalankan: npm install --global vercel'), [...vercelArgs(), ...args]);
  if (tool === 'supabase') {
    const token = projectEnv().SUPABASE_ACCESS_TOKEN ?? fail('SUPABASE_ACCESS_TOKEN belum diisi di .env.local');
    return run(findSupabase() ?? fail('Supabase CLI belum terpasang. Jalankan: npm install'), args, {
      SUPABASE_ACCESS_TOKEN: token,
    });
  }
  return fail('Pemakaian: node scripts/platform.ts <gh|vercel|supabase> [argumen...]');
}

if (isMain(import.meta.url)) main();
