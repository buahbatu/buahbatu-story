#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOOKS_PATH, currentHooksPath } from './hooks.ts';
import type { Env } from './lib/env.ts';
import { ROOT, isMain, sh } from './lib/proc.ts';
import { exitCode, formatReport, gate, type CheckResult, type Status } from './lib/report.ts';
import { currentTask, isRequiredNow } from './lib/tasks.ts';
import { GITHUB_ACCOUNT, VERCEL_CONFIG_DIR, findSupabase, findVercel, githubScopes, projectEnv, tryGithubToken } from './platform.ts';
import { GITLEAKS_VERSION, installedGitleaksVersion } from './tools.ts';

type Now = string | undefined;
const VERCEL_TOKENS = 'https://vercel.com/account/settings/tokens';
const USER_ENV = [
  {
    name: 'VERCEL_TOKEN',
    from: 'P0-12',
    fix: `buat di ${VERCEL_TOKENS} (scope team/akun, bukan per project)`,
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    from: 'P5-01',
    fix: 'buat di https://supabase.com/dashboard/account/tokens',
  },
  { name: 'METERED_APP_NAME', from: 'P11-05', fix: 'lihat dashboard https://dashboard.metered.ca/' },
  { name: 'METERED_API_KEY', from: 'P11-05', fix: 'buat di https://dashboard.metered.ca/' },
];
const item =
  (group: string) =>
  (name: string, status: Status, detail: string, fix?: string): CheckResult => ({
    group,
    name,
    status,
    detail,
    ...(fix ? { fix } : {}),
  });
const gitConfig = (key: string) => sh('git', ['config', '--local', '--get-all', key]).out;

function checkTools(now: Now): CheckResult[] {
  const it = item('Tools');
  const node = process.versions.node;
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { engines?: { node?: string } };
  const required = Number(/(\d+)/.exec(pkg.engines?.node ?? '')?.[1] ?? 0);
  const git = sh('git', ['--version']);
  const gh = sh('gh', ['--version']);
  const vercel = findVercel();
  const vercelVersion = vercel
    ? (sh(vercel[0], [...vercel[1], '--version'])
        .out.split(/\r?\n/)
        .pop() ?? '')
    : '';
  const gitleaks = installedGitleaksVersion();
  return [
    it(
      'Node.js',
      Number(node.split('.')[0]) >= required ? 'ok' : 'fail',
      `v${node} (butuh ≥${required})`,
      'pasang Node.js LTS terbaru dari https://nodejs.org',
    ),
    it('git', git.ok ? 'ok' : 'fail', git.out.replace('git version ', ''), 'pasang Git'),
    it('GitHub CLI (gh)', gh.ok ? 'ok' : 'fail', gh.out.split(/\r?\n/)[0] ?? '', 'pasang dari https://cli.github.com'),
    it(
      'Vercel CLI',
      gate(Boolean(vercelVersion), isRequiredNow(now, 'P0-10b')),
      vercelVersion || 'belum terpasang',
      'npm install --global vercel',
    ),
    it(
      'gitleaks (pre-commit)',
      gitleaks === GITLEAKS_VERSION ? 'ok' : 'fail',
      gitleaks ? `v${gitleaks}` : 'belum terpasang',
      'npm run tools',
    ),
    it(
      'Supabase CLI',
      gate(Boolean(findSupabase()), isRequiredNow(now, 'P5-01')),
      findSupabase() ? 'node_modules/supabase' : 'mulai P5-01',
      'npm install (devDependency supabase ditambahkan di P5-01)',
    ),
  ];
}

function checkGit(env: Env): CheckResult[] {
  const it = item('Git (repo ini saja)');
  const [name, email, helper] = ['user.name', 'user.email', 'credential.https://github.com.helper'].map(gitConfig);
  const remote = sh('git', ['remote', 'get-url', 'origin']).out.replace(/\/\/[^@/]+@/, '//****@');
  const emailMatches = !env.GIT_USER_EMAIL || env.GIT_USER_EMAIL === email;
  return [
    it(
      'Identitas commit lokal',
      name && email ? (emailMatches ? 'ok' : 'warn') : 'fail',
      name ? `${name} <${email ?? ''}>` : 'belum di-set',
      emailMatches ? 'npm run setup' : 'email git lokal beda dengan GIT_USER_EMAIL di .env.local; jalankan npm run setup',
    ),
    it(
      'Credential helper akun proyek',
      helper?.includes(`gh auth token -u ${GITHUB_ACCOUNT}`) ? 'ok' : 'fail',
      helper ? `akun ${GITHUB_ACCOUNT}` : 'belum di-set (push bisa memakai akun global!)',
      'npm run setup',
    ),
    it('Hook pre-commit', currentHooksPath() === HOOKS_PATH ? 'ok' : 'fail', currentHooksPath() || 'tidak aktif', 'npm run tools'),
    it(
      'Remote origin',
      remote.includes(`github.com/${env.GH_OWNER ?? GITHUB_ACCOUNT}/`) ? 'ok' : 'warn',
      remote || 'belum ada',
      'npm run setup',
    ),
  ];
}

function checkGithub(now: Now): CheckResult[] {
  const it = item('GitHub');
  const token = tryGithubToken();
  const scopes = token ? githubScopes(token) : null;
  return [
    it(
      `Login akun ${GITHUB_ACCOUNT}`,
      token && scopes ? 'ok' : 'fail',
      token ? (scopes ? 'keyring gh' : 'token ada tapi API menolak (kedaluwarsa?)') : 'belum login',
      'npm run setup (membuka login GitHub di Chrome)',
    ),
    it('Scope repo', scopes?.includes('repo') ? 'ok' : 'fail', scopes?.join(', ') ?? '-', 'npm run setup'),
    it(
      'Scope workflow (push GitHub Actions)',
      gate(Boolean(scopes?.includes('workflow')), isRequiredNow(now, 'P0-12')),
      scopes?.includes('workflow') ? 'ada' : 'dibutuhkan mulai P0-12',
      'npm run setup (sekali klik di Chrome)',
    ),
  ];
}

function checkVercel(now: Now): CheckResult[] {
  const it = item('Vercel');
  const project = join(ROOT, '.vercel', 'project.json');
  const loggedIn = existsSync(join(VERCEL_CONFIG_DIR, 'auth.json'));
  const linked = existsSync(project) && /"projectId"\s*:\s*"\w+/.test(readFileSync(project, 'utf8'));
  const required = isRequiredNow(now, 'P0-10b');
  return [
    it(
      'Login (per folder, .vercel-cli/)',
      gate(loggedIn, required),
      loggedIn ? 'ada' : 'belum login',
      'npm run setup (membuka login Vercel di Chrome)',
    ),
    it('Project ter-link (.vercel/project.json)', gate(linked, required), linked ? 'ter-link' : 'belum', 'npm run setup'),
  ];
}

function checkEnv(now: Now, env: Env): CheckResult[] {
  const it = item('.env.local (nilai tidak ditampilkan)');
  const hasFile = existsSync(join(ROOT, '.env.local'));
  return [
    it('File .env.local', hasFile ? 'ok' : 'warn', hasFile ? 'ada' : 'belum ada', 'npm run setup (dibuat dari .env.example)'),
    ...USER_ENV.map(({ name, from, fix }) =>
      it(name, gate(Boolean(env[name]), isRequiredNow(now, from)), env[name] ? 'terisi' : `dibutuhkan mulai ${from}`, fix),
    ),
  ];
}

export function runDoctor(): { now: Now; results: CheckResult[] } {
  const now = currentTask(readFileSync(join(ROOT, 'TODO.md'), 'utf8'));
  const env = projectEnv();
  return {
    now,
    results: [...checkTools(now), ...checkGit(env), ...checkGithub(now), ...checkVercel(now), ...checkEnv(now, env)],
  };
}

if (isMain(import.meta.url)) {
  const { now, results } = runDoctor();
  console.log(`🩺 Buahbatu Story · doctor   (task saat ini: ${now ?? 'semua selesai'})\n${formatReport(results)}`);
  process.exit(exitCode(results));
}
