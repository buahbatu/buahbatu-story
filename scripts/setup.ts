#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { installHooks } from './hooks.ts';
import { openUrl, pickDeviceCode, pickLoginUrl } from './lib/browser.ts';
import { readEnvFile, upsertEnv, type Env } from './lib/env.ts';
import { ROOT, errorMessage, isMain, sh } from './lib/proc.ts';
import { exitCode, formatReport, type CheckResult } from './lib/report.ts';
import { currentTask, isRequiredNow } from './lib/tasks.ts';
import { GITHUB_ACCOUNT, VERCEL_CONFIG_DIR, findVercel, githubScopes, tryGithubToken, vercelArgs, type Cli } from './platform.ts';
import { installGitleaks } from './tools.ts';

export const REPO_NAME = 'buahbatu-story';
export const VERCEL_PROJECT = 'buahbatu-story';
export const VERCEL_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
  'METERED_APP_NAME',
  'METERED_API_KEY',
];
export const CI_SECRETS = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID', 'VERCEL_AUTOMATION_BYPASS_SECRET'];
const ENV_FILE = join(ROOT, '.env.local');
const LOGIN_TIMEOUT_MS = 10 * 60_000;
const VERCEL_TOKEN_PAGE = 'https://vercel.com/account/settings/tokens';
const TOKEN_FIX = `buat token baru di ${VERCEL_TOKEN_PAGE} dengan Scope = team/akun buahbatu (Full Account, BUKAN dibatasi per project) → ganti baris VERCEL_TOKEN= di .env.local → npm run setup -- --refresh-secrets`;
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const NO_GH_ENV = { ...process.env, GH_TOKEN: '', GITHUB_TOKEN: '' };
const GH_DEVICE = {
  env: { GH_TOKEN: '', GITHUB_TOKEN: '', GH_BROWSER: 'none' },
  deviceUrl: () => 'https://github.com/login/device',
};

export const envsToSync = (env: Env): string[] => VERCEL_ENV_VARS.filter((name) => Boolean(env[name]));

export function isProjectHelperList(raw: string, helper: string): boolean {
  const lines = raw.replace(/\r?\n$/, '').split(/\r?\n/);
  return lines.length === 2 && lines[0] === '' && lines[1] === helper;
}

export const vercelTokenChecks = (id = '', org = ''): [string, string][] => {
  const team = org.startsWith('team_');
  return [
    ['akun', 'https://api.vercel.com/v2/user'],
    ...(team ? [['team', `https://api.vercel.com/v2/teams/${org}`] as [string, string]] : []),
    ['project', `https://api.vercel.com/v9/projects/${id}${team ? `?teamId=${org}` : ''}`],
  ];
};

export function bypassSecretFrom(bytes: Uint8Array): string {
  if (bytes.length < 32) throw new Error('butuh 32 byte acak');
  return [...bytes]
    .filter((b) => b < 248)
    .slice(0, 32)
    .map((b) => BASE62[b % 62])
    .join('');
}

const step = (name: string, rest: Partial<CheckResult> = {}): CheckResult => ({
  group: 'Setup',
  name,
  status: 'ok',
  ...rest,
});
const git = (args: string[]) => sh('git', args);
const env = (): Env => readEnvFile(ENV_FILE);
const loginProfile = () => env().LOGIN_CHROME_PROFILE ?? process.env.LOGIN_CHROME_PROFILE;
const now = () => currentTask(readFileSync(join(ROOT, 'TODO.md'), 'utf8'));
const activeGhUser = () => sh('gh', ['api', 'user', '--jq', '.login'], { env: NO_GH_ENV }).out;
const switchGh = (user: string) => sh('gh', ['auth', 'switch', '-h', 'github.com', '-u', user], { env: NO_GH_ENV });

function saveEnv(values: Record<string, string>, overwrite = false): string[] {
  const { text, changed } = upsertEnv(readFileSync(ENV_FILE, 'utf8'), values, { overwrite });
  if (changed.length > 0) writeFileSync(ENV_FILE, text);
  return changed;
}

function newBypassSecret(): string {
  for (;;) {
    const secret = bypassSecretFrom(randomBytes(64));
    if (/^[a-zA-Z0-9]{32}$/.test(secret)) return secret;
  }
}

function interactiveLogin(
  command: string,
  args: string[],
  { env: extra = {}, deviceUrl }: { env?: Env; deviceUrl?: (code: string) => string } = {},
): Promise<boolean> {
  return new Promise((done) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: { ...process.env, ...extra },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let opened = false;
    let output = '';
    const onData = (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      for (const line of text.split(/\r?\n/).filter((l) => l.trim())) console.log(`   │ ${line.trim()}`);
      if (opened) return;
      const code = pickDeviceCode(output);
      const url = pickLoginUrl(output) ?? (code && deviceUrl ? deviceUrl(code) : undefined);
      if (!url) return;
      opened = true;
      console.log(`${code ? `   🔑 Kode: ${code}\n` : ''}   🌐 Buka & klik izinkan: ${url}`);
      openUrl(url, loginProfile());
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.stdin.end('\n');
    const timer = setTimeout(() => child.kill(), LOGIN_TIMEOUT_MS);
    child.on('close', (status) => {
      clearTimeout(timer);
      done(status === 0);
    });
  });
}

function stepEnvFile(): CheckResult {
  const created = !existsSync(ENV_FILE);
  if (created) copyFileSync(join(ROOT, '.env.example'), ENV_FILE);
  const local = (key: string) => git(['config', '--local', '--get', key]).out;
  const profile = process.env.LOGIN_CHROME_PROFILE;
  const filled = saveEnv({
    GIT_USER_NAME: local('user.name'),
    GIT_USER_EMAIL: local('user.email'),
    GH_OWNER: GITHUB_ACCOUNT,
    ...(profile ? { LOGIN_CHROME_PROFILE: profile } : {}),
  });
  return step('.env.local', {
    detail: `${created ? 'dibuat dari .env.example' : 'sudah ada'}${filled.length ? `, diisi: ${filled.join(', ')}` : ''}`,
  });
}

async function stepTools(): Promise<CheckResult> {
  await installGitleaks({ log: () => undefined });
  return step('gitleaks + hook pre-commit', {
    status: installHooks({ log: () => undefined }) ? 'ok' : 'fail',
    fix: 'npm run tools',
  });
}

function stepGitLocal(): CheckResult {
  const { GIT_USER_NAME: name, GIT_USER_EMAIL: email } = env();
  if (!name || !email)
    return step('Git identitas lokal', {
      status: 'fail',
      fix: 'isi GIT_USER_NAME & GIT_USER_EMAIL di .env.local',
    });
  const helper = `!f() { test "$1" = get && echo username=${GITHUB_ACCOUNT} && echo "password=$(gh auth token -u ${GITHUB_ACCOUNT})"; }; f`;
  const wanted = {
    'user.name': name,
    'user.email': email,
    'credential.https://github.com.username': GITHUB_ACCOUNT,
    'core.autocrlf': 'false',
  };
  const changed = Object.entries(wanted)
    .filter(([key, value]) => git(['config', '--local', '--get', key]).out !== value && git(['config', '--local', key, value]).ok)
    .map(([key]) => key);
  const raw = spawnSync('git', ['config', '--local', '--get-all', 'credential.https://github.com.helper'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).stdout;
  if (!isProjectHelperList(raw, helper)) {
    git(['config', '--local', '--replace-all', 'credential.https://github.com.helper', '']);
    git(['config', '--local', '--add', 'credential.https://github.com.helper', helper]);
    changed.push('credential helper');
  }
  return step('Git identitas & credential lokal', {
    detail: changed.length ? `diubah: ${changed.join(', ')}` : 'sudah benar',
  });
}

async function ensureGithubLogin(): Promise<boolean> {
  if (tryGithubToken()) return true;
  const previous = activeGhUser();
  console.log(`🔐 Login GitHub akun ${GITHUB_ACCOUNT} diperlukan…`);
  await interactiveLogin('gh', ['auth', 'login', '--web', '--clipboard', '-h', 'github.com', '-p', 'https'], GH_DEVICE);
  if (previous && previous !== GITHUB_ACCOUNT) switchGh(previous);
  return Boolean(tryGithubToken());
}

async function stepGithub(): Promise<CheckResult> {
  if (!(await ensureGithubLogin()))
    return step(`GitHub akun ${GITHUB_ACCOUNT}`, {
      status: 'fail',
      fix: 'login di browser dengan akun yang benar, lalu ulangi npm run setup',
    });
  const ghEnv = { env: { ...process.env, GH_TOKEN: tryGithubToken() ?? '' } };
  const slug = `${env().GH_OWNER ?? GITHUB_ACCOUNT}/${REPO_NAME}`;
  const view = sh('gh', ['repo', 'view', slug, '--json', 'visibility', '--jq', '.visibility'], ghEnv);
  let detail = `${slug} (${view.out.toLowerCase() || '?'})`;
  if (!view.ok) {
    const created = sh('gh', ['repo', 'create', slug, '--public', '--source', '.', '--remote', 'origin', '--push'], ghEnv);
    if (!created.ok)
      return step('GitHub repo', {
        status: 'fail',
        detail: created.err.split('\n')[0] ?? '',
        fix: 'cek npm run doctor',
      });
    detail = `${slug} dibuat (public, ADR-010)`;
  }
  const url = `https://github.com/${slug}.git`;
  const remote = git(['remote', 'get-url', 'origin']);
  if (!remote.ok) git(['remote', 'add', 'origin', url]);
  else if (remote.out !== url) git(['remote', 'set-url', 'origin', url]);
  if (!git(['ls-remote', '--heads', 'origin', 'main']).out && git(['push', '-u', 'origin', 'main']).ok) detail += ', main di-push';
  return step('GitHub repo & remote', { detail });
}

async function stepGithubScopes(): Promise<CheckResult> {
  const needed = isRequiredNow(now(), 'P0-12') ? ['workflow'] : [];
  const token = tryGithubToken();
  const have = token ? (githubScopes(token) ?? []) : [];
  const missing = needed.filter((scope) => !have.includes(scope));
  if (missing.length === 0) return step('GitHub scope token', { detail: have.join(', ') });
  const previous = activeGhUser();
  console.log(`🔐 Akun ${GITHUB_ACCOUNT} perlu izin tambahan: ${missing.join(', ')}…`);
  switchGh(GITHUB_ACCOUNT);
  await interactiveLogin('gh', ['auth', 'refresh', '-h', 'github.com', '--clipboard', ...missing.flatMap((s) => ['-s', s])], GH_DEVICE);
  if (previous && previous !== GITHUB_ACCOUNT) switchGh(previous);
  const still = needed.filter((scope) => !(githubScopes(tryGithubToken() ?? '') ?? []).includes(scope));
  return still.length === 0
    ? step('GitHub scope token', { detail: `ditambah: ${missing.join(', ')}` })
    : step('GitHub scope token', {
        status: 'fail',
        detail: `belum ada: ${still.join(', ')}`,
        fix: 'selesaikan otorisasi di browser, lalu ulangi npm run setup',
      });
}

async function stepVercelLogin([command, prefix]: Cli): Promise<CheckResult> {
  const authFile = join(VERCEL_CONFIG_DIR, 'auth.json');
  if (existsSync(authFile)) return step('Vercel login (per folder)', { detail: 'sudah login' });
  console.log('🔐 Login Vercel diperlukan…');
  await interactiveLogin(command, [...prefix, 'login', '--global-config', VERCEL_CONFIG_DIR], {
    deviceUrl: (code) => `https://vercel.com/oauth/device?user_code=${code}`,
  });
  return existsSync(authFile)
    ? step('Vercel login (per folder)', { detail: 'berhasil' })
    : step('Vercel login (per folder)', {
        status: 'fail',
        fix: 'selesaikan login di browser, lalu ulangi npm run setup',
      });
}

function stepVercelLink([command, prefix]: Cli): CheckResult {
  const projectFile = join(ROOT, '.vercel', 'project.json');
  const run = (args: string[]) => sh(command, [...prefix, ...vercelArgs(env()), ...args]);
  let detail = 'sudah ter-link';
  if (!existsSync(projectFile)) {
    if (!run(['project', 'inspect', VERCEL_PROJECT]).ok) {
      const added = run(['project', 'add', VERCEL_PROJECT]);
      if (!added.ok)
        return step('Vercel project', {
          status: 'fail',
          detail: added.err.split('\n').pop() ?? '',
          fix: 'cek login Vercel',
        });
    }
    const linked = run(['link', '--yes', '--project', VERCEL_PROJECT]);
    if (!linked.ok || !existsSync(projectFile))
      return step('Vercel project', {
        status: 'fail',
        detail: linked.err.split('\n').pop() ?? '',
        fix: 'cek npm run doctor',
      });
    detail = `${VERCEL_PROJECT} ter-link`;
  }
  const { orgId, projectId } = JSON.parse(readFileSync(projectFile, 'utf8')) as {
    orgId: string;
    projectId: string;
  };
  const saved = saveEnv({ VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId }, true);
  return step('Vercel project', { detail: `${detail}${saved.length ? ', ID disimpan ke .env.local' : ''}` });
}

function stepVercelEnv([command, prefix]: Cli): CheckResult {
  const values = env();
  const names = envsToSync(values);
  if (names.length === 0) return step('Vercel env', { detail: 'belum ada nilai untuk disinkron (Supabase dibuat di P5-01)' });
  const failed = names.flatMap((name) =>
    ['production', 'preview']
      .filter(
        (target) =>
          !sh(command, [...prefix, ...vercelArgs(values), 'env', 'add', name, target, '--force', '--yes'], {
            input: values[name] ?? '',
          }).ok,
      )
      .map((target) => `${name}@${target}`),
  );
  return failed.length
    ? step('Vercel env', { status: 'fail', detail: `gagal: ${failed.join(', ')}`, fix: 'cek npm run doctor' })
    : step('Vercel env', { detail: `${names.length} variabel × production & preview` });
}

async function stepVercelToken(): Promise<CheckResult> {
  const { VERCEL_TOKEN: token, VERCEL_PROJECT_ID: id, VERCEL_ORG_ID: org } = env();
  if (!token) {
    if (!isRequiredNow(now(), 'P0-12')) return step('VERCEL_TOKEN (untuk CI)', { status: 'later', detail: 'P0-12' });
    openUrl(VERCEL_TOKEN_PAGE, loginProfile());
    return step('VERCEL_TOKEN (untuk CI)', {
      status: 'fail',
      detail: `halaman token dibuka: ${VERCEL_TOKEN_PAGE}`,
      fix: TOKEN_FIX,
    });
  }
  const statuses = await Promise.all(
    vercelTokenChecks(id, org).map(
      async ([what, url]) => [what, (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).status] as const,
    ),
  );
  const denied = statuses.filter(([, status]) => status !== 200);
  if (denied.length === 0)
    return step('VERCEL_TOKEN (untuk CI)', {
      detail: 'valid (akun, team, project) sama seperti yang dibutuhkan Vercel CLI',
    });
  openUrl(VERCEL_TOKEN_PAGE, loginProfile());
  return step('VERCEL_TOKEN (untuk CI)', {
    status: 'fail',
    detail: `scope terlalu sempit, ditolak: ${denied.map(([w, s]) => `${w} ${s}`).join(', ')}`,
    fix: TOKEN_FIX,
  });
}

async function stepVercelBypass(): Promise<CheckResult> {
  const { VERCEL_AUTOMATION_BYPASS_SECRET: existing, VERCEL_TOKEN: token, VERCEL_PROJECT_ID: id, VERCEL_ORG_ID: org } = env();
  if (existing) return step('Vercel bypass untuk smoke test', { detail: 'sudah ada' });
  if (!token || !id)
    return step('Vercel bypass untuk smoke test', {
      status: 'fail',
      fix: 'butuh VERCEL_TOKEN & project ter-link',
    });
  const secret = newBypassSecret();
  const team = org?.startsWith('team_') ? `?teamId=${org}` : '';
  const response = await fetch(`https://api.vercel.com/v1/projects/${id}/protection-bypass${team}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ generate: { secret, note: 'CI smoke test (npm run setup)' } }),
  });
  if (!response.ok)
    return step('Vercel bypass untuk smoke test', {
      status: 'fail',
      detail: `API Vercel HTTP ${response.status}`,
      fix: 'cek izin token, lalu ulangi npm run setup',
    });
  saveEnv({ VERCEL_AUTOMATION_BYPASS_SECRET: secret });
  return step('Vercel bypass untuk smoke test', { detail: 'dibuat & disimpan ke .env.local' });
}

function stepCiSecrets(): CheckResult {
  const values = env();
  const token = tryGithubToken();
  if (!token) return step('GitHub Actions secrets', { status: 'fail', fix: 'login GitHub dulu' });
  const ghEnv = { env: { ...process.env, GH_TOKEN: token } };
  const repo = `${values.GH_OWNER ?? GITHUB_ACCOUNT}/${REPO_NAME}`;
  const existing = new Set(sh('gh', ['secret', 'list', '--repo', repo, '--json', 'name', '--jq', '.[].name'], ghEnv).out.split('\n'));
  const force = process.argv.includes('--refresh-secrets');
  const toSet = CI_SECRETS.filter((name) => values[name] && (force || !existing.has(name)));
  const missingValue = CI_SECRETS.filter((name) => !values[name] && !existing.has(name));
  const failed = toSet.filter((name) => !sh('gh', ['secret', 'set', name, '--repo', repo], { ...ghEnv, input: values[name] ?? '' }).ok);
  if (failed.length > 0) return step('GitHub Actions secrets', { status: 'fail', detail: `gagal: ${failed.join(', ')}` });
  if (missingValue.length > 0)
    return step('GitHub Actions secrets', {
      status: 'fail',
      detail: `belum ada nilainya: ${missingValue.join(', ')}`,
      fix: 'lengkapi langkah sebelumnya, lalu ulangi npm run setup',
    });
  return step('GitHub Actions secrets', {
    detail: toSet.length ? `di-set: ${toSet.join(', ')}` : 'sudah lengkap (pakai --refresh-secrets untuk menimpa)',
  });
}

export async function runSetup(): Promise<CheckResult[]> {
  const results = [stepEnvFile(), await stepTools(), stepGitLocal(), await stepGithub(), await stepGithubScopes()];
  const vercel = findVercel();
  if (!vercel) results.push(step('Vercel CLI', { status: 'fail', fix: 'npm install --global vercel' }));
  else {
    const login = await stepVercelLogin(vercel);
    results.push(login, ...(login.status === 'ok' ? [stepVercelLink(vercel), stepVercelEnv(vercel)] : []));
  }
  const token = await stepVercelToken();
  results.push(token, ...(token.status === 'ok' ? [await stepVercelBypass(), stepCiSecrets()] : []));
  results.push(step('Supabase (project, migrasi, akun tes)', { status: 'later', detail: 'P5-01' }));
  return results;
}

if (isMain(import.meta.url)) {
  runSetup().then(
    (results) => {
      console.log(`🛠️  Buahbatu Story · setup\n${formatReport(results)}`);
      process.exit(exitCode(results));
    },
    (error: unknown) => {
      console.error(`❌ ${errorMessage(error)}`);
      process.exit(1);
    },
  );
}
