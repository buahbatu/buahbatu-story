#!/usr/bin/env node
// `npm run doctor`: cek kesehatan tools, akun, dan env proyek. HANYA MEMBACA, tidak mengubah apa pun.
// Kebutuhan mengikuti fase di TODO.md: yang belum waktunya ditandai ⏳, bukan ❌.
// Nilai rahasia tidak pernah dicetak. Desain: docs/51 §4–5 & §7, ADR-014
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { HOOKS_PATH, currentHooksPath } from './hooks.mjs';
import { exitCode, formatReport, gate } from './lib/report.mjs';
import { currentTask, isRequiredNow } from './lib/tasks.mjs';
import {
  GITHUB_ACCOUNT,
  githubScopes,
  ROOT,
  VERCEL_CONFIG_DIR,
  findSupabase,
  findVercel,
  projectEnv,
  tryGithubToken,
} from './platform.mjs';
import { GITLEAKS_VERSION, installedGitleaksVersion } from './tools.mjs';

/** @typedef {import('./lib/report.mjs').CheckResult} CheckResult */

const LINKS = {
  github: 'https://github.com/settings/tokens/new?scopes=repo,workflow&description=buahbatu-story',
  vercel: 'https://vercel.com/account/settings/tokens',
  supabase: 'https://supabase.com/dashboard/account/tokens',
  metered: 'https://dashboard.metered.ca/',
};

/** Variabel yang diisi user + task mulai dibutuhkan (docs/51 §4). */
const USER_ENV = [
  { name: 'VERCEL_TOKEN', from: 'P0-12', fix: `buat di ${LINKS.vercel} (untuk deploy dari CI)` },
  { name: 'SUPABASE_ACCESS_TOKEN', from: 'P5-01', fix: `buat di ${LINKS.supabase}` },
  { name: 'METERED_APP_NAME', from: 'P11-05', fix: `lihat dashboard ${LINKS.metered}` },
  { name: 'METERED_API_KEY', from: 'P11-05', fix: `buat di ${LINKS.metered}` },
];

function sh(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', timeout: 20_000, ...options });
  return { ok: result.status === 0, out: (result.stdout ?? '').trim(), err: (result.stderr ?? '').trim() };
}

const gitConfig = (key) => sh('git', ['config', '--local', '--get-all', key]).out;

/** @returns {CheckResult[]} */
function checkTools(now) {
  const node = process.versions.node;
  const required = /(\d+)/.exec(
    JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).engines?.node ?? '',
  )?.[1];
  const git = sh('git', ['--version']);
  const gh = sh('gh', ['--version']);
  const vercel = findVercel();
  const vercelVersion = vercel
    ? sh(vercel[0], [...vercel[1], '--version'])
        .out.split(/\r?\n/)
        .pop()
    : '';
  const gitleaks = installedGitleaksVersion();
  return [
    {
      group: 'Tools',
      name: 'Node.js',
      status: Number(node.split('.')[0]) >= Number(required ?? 0) ? 'ok' : 'fail',
      detail: `v${node} (butuh ≥${required})`,
      fix: 'pasang Node.js LTS terbaru dari https://nodejs.org',
    },
    {
      group: 'Tools',
      name: 'git',
      status: git.ok ? 'ok' : 'fail',
      detail: git.out.replace('git version ', ''),
      fix: 'pasang Git',
    },
    {
      group: 'Tools',
      name: 'GitHub CLI (gh)',
      status: gh.ok ? 'ok' : 'fail',
      detail: gh.out.split(/\r?\n/)[0],
      fix: 'pasang dari https://cli.github.com',
    },
    {
      group: 'Tools',
      name: 'Vercel CLI',
      status: gate(Boolean(vercelVersion), isRequiredNow(now, 'P0-10b')),
      detail: vercelVersion || 'belum terpasang',
      fix: 'npm install --global vercel',
    },
    {
      group: 'Tools',
      name: 'gitleaks (pre-commit)',
      status: gitleaks === GITLEAKS_VERSION ? 'ok' : 'fail',
      detail: gitleaks ? `v${gitleaks}` : 'belum terpasang',
      fix: 'npm run tools',
    },
    {
      group: 'Tools',
      name: 'Supabase CLI',
      status: gate(Boolean(findSupabase()), isRequiredNow(now, 'P5-01')),
      detail: findSupabase() ? 'node_modules/supabase' : 'mulai P5-01',
      fix: 'npm install (devDependency supabase ditambahkan di P5-01)',
    },
  ];
}

/** @returns {CheckResult[]} */
function checkGit(env) {
  const name = gitConfig('user.name');
  const email = gitConfig('user.email');
  const helper = gitConfig('credential.https://github.com.helper');
  const remote = sh('git', ['remote', 'get-url', 'origin']).out.replace(/\/\/[^@/]+@/, '//****@');
  const emailMatches = !env.GIT_USER_EMAIL || env.GIT_USER_EMAIL === email;
  return [
    {
      group: 'Git (repo ini saja)',
      name: 'Identitas commit lokal',
      status: name && email ? (emailMatches ? 'ok' : 'warn') : 'fail',
      detail: name ? `${name} <${email}>` : 'belum di-set',
      fix: emailMatches
        ? 'npm run setup'
        : 'email git lokal beda dengan GIT_USER_EMAIL di .env.local; jalankan npm run setup',
    },
    {
      group: 'Git (repo ini saja)',
      name: 'Credential helper akun proyek',
      status: helper.includes(`gh auth token -u ${GITHUB_ACCOUNT}`) ? 'ok' : 'fail',
      detail: helper ? `akun ${GITHUB_ACCOUNT}` : 'belum di-set (push bisa memakai akun global!)',
      fix: 'npm run setup',
    },
    {
      group: 'Git (repo ini saja)',
      name: 'Hook pre-commit',
      status: currentHooksPath() === HOOKS_PATH ? 'ok' : 'fail',
      detail: currentHooksPath() || 'tidak aktif',
      fix: 'npm run tools',
    },
    {
      group: 'Git (repo ini saja)',
      name: 'Remote origin',
      status: remote.includes(`github.com/${env.GH_OWNER ?? GITHUB_ACCOUNT}/`) ? 'ok' : 'warn',
      detail: remote || 'belum ada',
      fix: 'npm run setup',
    },
  ];
}

/** @returns {CheckResult[]} */
function checkGithub(now) {
  const token = tryGithubToken();
  const scopes = token ? githubScopes(token) : null;
  return [
    {
      group: 'GitHub',
      name: `Login akun ${GITHUB_ACCOUNT}`,
      status: token && scopes ? 'ok' : 'fail',
      detail: token ? (scopes ? 'keyring gh' : 'token ada tapi API menolak (kedaluwarsa?)') : 'belum login',
      fix: 'login ulang: gh auth login --web (AI bisa membukakan Chrome profil Kelola POS)',
    },
    {
      group: 'GitHub',
      name: 'Scope repo',
      status: scopes?.includes('repo') ? 'ok' : 'fail',
      detail: scopes ? scopes.join(', ') : '-',
      fix: 'gh auth refresh -s repo',
    },
    {
      group: 'GitHub',
      name: 'Scope workflow (push GitHub Actions)',
      status: gate(Boolean(scopes?.includes('workflow')), isRequiredNow(now, 'P0-12')),
      detail: scopes?.includes('workflow') ? 'ada' : 'dibutuhkan mulai P0-12',
      fix: 'gh auth refresh -h github.com -s workflow (sekali klik di Chrome)',
    },
  ];
}

/** @returns {CheckResult[]} */
function checkVercel(now) {
  // Cukup cek keberadaan login per folder; isi file TIDAK dibaca/ditampilkan.
  const loggedIn = existsSync(join(VERCEL_CONFIG_DIR, 'auth.json'));
  const project = join(ROOT, '.vercel', 'project.json');
  const linked = existsSync(project) && /"projectId"\s*:\s*"\w+/.test(readFileSync(project, 'utf8'));
  const required = isRequiredNow(now, 'P0-10b');
  return [
    {
      group: 'Vercel',
      name: 'Login (per folder, .vercel-cli/)',
      status: gate(loggedIn, required),
      detail: loggedIn ? 'ada' : 'belum login',
      fix: 'npm run setup (membuka login Vercel di Chrome profil Kelola POS)',
    },
    {
      group: 'Vercel',
      name: 'Project ter-link (.vercel/project.json)',
      status: gate(linked, required),
      detail: linked ? 'ter-link' : 'belum',
      fix: 'npm run setup',
    },
  ];
}

/** @returns {CheckResult[]} */
function checkEnv(now, env) {
  const hasFile = existsSync(join(ROOT, '.env.local'));
  return [
    {
      group: '.env.local (nilai tidak ditampilkan)',
      name: 'File .env.local',
      status: hasFile ? 'ok' : 'warn',
      detail: hasFile ? 'ada' : 'belum ada',
      fix: 'salin .env.example menjadi .env.local, lalu isi bagian "DIISI USER"',
    },
    ...USER_ENV.map(({ name, from, fix }) => ({
      group: '.env.local (nilai tidak ditampilkan)',
      name,
      status: gate(Boolean(env[name]), isRequiredNow(now, from)),
      detail: env[name] ? 'terisi' : `dibutuhkan mulai ${from}`,
      fix,
    })),
  ];
}

export function runDoctor() {
  const now = currentTask(readFileSync(join(ROOT, 'TODO.md'), 'utf8'));
  const env = projectEnv();
  const results = [
    ...checkTools(now),
    ...checkGit(env),
    ...checkGithub(now),
    ...checkVercel(now),
    ...checkEnv(now, env),
  ];
  return { now, results };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { now, results } = runDoctor();
  console.log(`🩺 Buahbatu Story · doctor   (task saat ini: ${now ?? 'semua selesai'})`);
  console.log(formatReport(results));
  process.exit(exitCode(results));
}
