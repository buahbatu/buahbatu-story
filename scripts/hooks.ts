#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, isMain, sh } from './lib/proc.ts';

export const HOOKS_PATH = '.githooks';

export const currentHooksPath = (): string => sh('git', ['config', '--local', '--get', 'core.hooksPath']).out;

export function installHooks({ log = console.log } = {}): boolean {
  if (!existsSync(join(ROOT, '.git'))) return false;
  if (currentHooksPath() === HOOKS_PATH) return true;
  const result = sh('git', ['config', '--local', 'core.hooksPath', HOOKS_PATH]);
  log(
    result.ok
      ? `✅ Git hooks aktif (${HOOKS_PATH}/), pre-commit memindai rahasia dengan gitleaks`
      : `⚠️  Gagal mengaktifkan git hooks: ${result.err}`,
  );
  return result.ok;
}

if (isMain(import.meta.url)) installHooks();
