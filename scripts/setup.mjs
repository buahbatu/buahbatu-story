#!/usr/bin/env node
// `npm run setup`: siapkan proyek di perangkat ini. Aman dijalankan berkali-kali (langkah yang
// sudah beres dilewati). Login yang butuh klik dibuka di browser (LOGIN_CHROME_PROFILE).
// Nilai rahasia tidak pernah dicetak. Desain: docs/51 §2a, §5, ADR-010, ADR-014
import { spawn, spawnSync } from 'node:child_process';
import { clearTimeout, setTimeout } from 'node:timers';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { installHooks } from './hooks.mjs';
import { openUrl, pickDeviceCode, pickLoginUrl } from './lib/browser.mjs';
import { readEnvFile, upsertEnv } from './lib/env.mjs';
import { exitCode, formatReport } from './lib/report.mjs';
import {
  GITHUB_ACCOUNT,
  ROOT,
  VERCEL_CONFIG_DIR,
  findVercel,
  tryGithubToken,
  vercelArgs,
} from './platform.mjs';
import { installGitleaks } from './tools.mjs';

/** @typedef {import('./lib/report.mjs').CheckResult} CheckResult */

export const REPO_NAME = 'buahbatu-story';
export const VERCEL_PROJECT = 'buahbatu-story';
const ENV_FILE = join(ROOT, '.env.local');
const LOGIN_TIMEOUT_MS = 10 * 60_000;

/** Variabel yang disinkron ke Vercel (Production & Preview) kalau sudah ada nilainya. docs/51 §4 */
export const VERCEL_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
  'METERED_APP_NAME',
  'METERED_API_KEY',
];

/** @param {Record<string, string>} env */
export const envsToSync = (env) => VERCEL_ENV_VARS.filter((name) => Boolean(env[name]));

/**
 * Apakah daftar credential helper (output mentah `git config --get-all`) persis
 * [kosong (reset helper global), helper akun proyek]? Murni.
 * @param {string} raw
 * @param {string} helper
 */
export function isProjectHelperList(raw, helper) {
  const lines = raw.replace(/\r?\n$/, '').split(/\r?\n/);
  return lines.length === 2 && lines[0] === '' && lines[1] === helper;
}

const step = (/** @type {string} */ name, /** @type {Partial<CheckResult>} */ rest) =>
  /** @type {CheckResult} */ ({ group: 'Setup', name, status: 'ok', ...rest });

function sh(command, args, options = {}) {
  const r = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', timeout: 120_000, ...options });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}
const git = (args) => sh('git', args);
const env = () => ({ ...readEnvFile(ENV_FILE) });
const loginProfile = () => env().LOGIN_CHROME_PROFILE ?? process.env.LOGIN_CHROME_PROFILE;

/** Tulis nilai ke .env.local tanpa menimpa yang sudah diisi user (kecuali overwrite). */
function saveEnv(values, overwrite = false) {
  const { text, changed } = upsertEnv(readFileSync(ENV_FILE, 'utf8'), values, { overwrite });
  if (changed.length > 0) writeFileSync(ENV_FILE, text);
  return changed;
}

/**
 * Jalankan perintah login interaktif (device flow): cetak & buka URL login di browser, tunggu selesai.
 * Output CLI device login hanya berisi kode/URL sekali pakai (bukan token), jadi aman diteruskan.
 * @param {string} command @param {string[]} args
 * @param {{ env?: Record<string, string>, deviceUrl?: (code: string) => string }} [options]
 *   deviceUrl: URL cadangan kalau CLI hanya mencetak kode tanpa URL login.
 */
function interactiveLogin(command, args, { env: extraEnv = {}, deviceUrl } = {}) {
  return new Promise((done) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: { ...process.env, ...extraEnv },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let opened = false;
    let output = '';
    const onData = (/** @type {Buffer} */ chunk) => {
      const text = chunk.toString();
      output += text;
      for (const line of text.split(/\r?\n/).filter((l) => l.trim())) console.log(`   │ ${line.trim()}`);
      if (opened) return;
      const code = pickDeviceCode(output);
      const url = pickLoginUrl(output) ?? (code && deviceUrl ? deviceUrl(code) : undefined);
      if (url) {
        opened = true;
        if (code) console.log(`   🔑 Kode: ${code}`);
        console.log(`   🌐 Buka & klik izinkan: ${url}`);
        openUrl(url, loginProfile());
      }
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

// ───────────────────────── Langkah ─────────────────────────

function stepEnvFile() {
  const created = !existsSync(ENV_FILE);
  if (created) copyFileSync(join(ROOT, '.env.example'), ENV_FILE);
  const local = (key) => git(['config', '--local', '--get', key]).out;
  const filled = saveEnv({
    GIT_USER_NAME: local('user.name'),
    GIT_USER_EMAIL: local('user.email'),
    GH_OWNER: GITHUB_ACCOUNT,
    ...(process.env.LOGIN_CHROME_PROFILE ? { LOGIN_CHROME_PROFILE: process.env.LOGIN_CHROME_PROFILE } : {}),
  });
  return step('.env.local', {
    detail: `${created ? 'dibuat dari .env.example' : 'sudah ada'}${filled.length ? `, diisi: ${filled.join(', ')}` : ''}`,
  });
}

async function stepTools() {
  await installGitleaks({ log: () => undefined });
  return step('gitleaks + hook pre-commit', {
    status: installHooks({ log: () => undefined }) ? 'ok' : 'fail',
    fix: 'npm run tools',
  });
}

function stepGitLocal() {
  const { GIT_USER_NAME: name, GIT_USER_EMAIL: email } = env();
  if (!name || !email) {
    return step('Git identitas lokal', {
      status: 'fail',
      fix: 'isi GIT_USER_NAME & GIT_USER_EMAIL di .env.local',
    });
  }
  const helper = `!f() { test "$1" = get && echo username=${GITHUB_ACCOUNT} && echo "password=$(gh auth token -u ${GITHUB_ACCOUNT})"; }; f`;
  const wanted = {
    'user.name': name,
    'user.email': email,
    'credential.https://github.com.username': GITHUB_ACCOUNT,
    'core.autocrlf': 'false',
  };
  const changed = [];
  for (const [key, value] of Object.entries(wanted)) {
    if (git(['config', '--local', '--get', key]).out !== value) {
      git(['config', '--local', key, value]);
      changed.push(key);
    }
  }
  // Baca mentah (tanpa trim): baris kosong pertama justru bagian penting dari konfigurasinya.
  const raw = spawnSync('git', ['config', '--local', '--get-all', 'credential.https://github.com.helper'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).stdout;
  if (!isProjectHelperList(raw, helper)) {
    // Helper kosong pertama mereset helper global, lalu helper token dinamis akun proyek.
    git(['config', '--local', '--replace-all', 'credential.https://github.com.helper', '']);
    git(['config', '--local', '--add', 'credential.https://github.com.helper', helper]);
    changed.push('credential helper');
  }
  return step('Git identitas & credential lokal', {
    detail: changed.length ? `diubah: ${changed.join(', ')}` : 'sudah benar',
  });
}

async function ensureGithubLogin() {
  if (tryGithubToken()) return true;
  const withoutToken = { ...process.env, GH_TOKEN: '', GITHUB_TOKEN: '' };
  const previous = sh('gh', ['api', 'user', '--jq', '.login'], { env: withoutToken }).out;
  console.log(`🔐 Login GitHub akun ${GITHUB_ACCOUNT} diperlukan…`);
  await interactiveLogin('gh', ['auth', 'login', '--web', '--clipboard', '-h', 'github.com', '-p', 'https'], {
    // GH_BROWSER "none" sengaja gagal supaya gh tidak membuka browser default; kita buka profil yang benar.
    env: { GH_TOKEN: '', GITHUB_TOKEN: '', GH_BROWSER: 'none' },
    deviceUrl: () => 'https://github.com/login/device',
  });
  // Kembalikan akun aktif global seperti semula (ADR-014: jangan ubah login global).
  if (previous && previous !== GITHUB_ACCOUNT)
    sh('gh', ['auth', 'switch', '-h', 'github.com', '-u', previous], { env: withoutToken });
  return Boolean(tryGithubToken());
}

async function stepGithub() {
  if (!(await ensureGithubLogin())) {
    return step(`GitHub akun ${GITHUB_ACCOUNT}`, {
      status: 'fail',
      fix: 'login di browser dengan akun yang benar, lalu ulangi npm run setup',
    });
  }
  const ghEnv = { env: { ...process.env, GH_TOKEN: tryGithubToken() ?? '' } };
  const owner = env().GH_OWNER ?? GITHUB_ACCOUNT;
  const slug = `${owner}/${REPO_NAME}`;
  const view = sh('gh', ['repo', 'view', slug, '--json', 'visibility', '--jq', '.visibility'], ghEnv);
  let detail = `${slug} (${view.out.toLowerCase() || '?'})`;
  if (!view.ok) {
    // ADR-010: public selama development.
    const created = sh(
      'gh',
      ['repo', 'create', slug, '--public', '--source', '.', '--remote', 'origin', '--push'],
      ghEnv,
    );
    if (!created.ok)
      return step('GitHub repo', {
        status: 'fail',
        detail: created.err.split('\n')[0],
        fix: 'cek npm run doctor',
      });
    detail = `${slug} dibuat (public, ADR-010)`;
  }
  const url = `https://github.com/${slug}.git`;
  const remote = git(['remote', 'get-url', 'origin']);
  if (!remote.ok) git(['remote', 'add', 'origin', url]);
  else if (remote.out !== url) git(['remote', 'set-url', 'origin', url]);
  if (!git(['ls-remote', '--heads', 'origin', 'main']).out) {
    git(['push', '-u', 'origin', 'main']);
    detail += ', main di-push';
  }
  return step('GitHub repo & remote', { detail });
}

async function stepVercelLogin(vercel) {
  const authFile = join(VERCEL_CONFIG_DIR, 'auth.json');
  if (existsSync(authFile)) return step('Vercel login (per folder)', { detail: 'sudah login' });
  console.log('🔐 Login Vercel diperlukan…');
  await interactiveLogin(vercel[0], [...vercel[1], 'login', '--global-config', VERCEL_CONFIG_DIR], {
    deviceUrl: (code) => `https://vercel.com/oauth/device?user_code=${code}`,
  });
  return existsSync(authFile)
    ? step('Vercel login (per folder)', { detail: 'berhasil' })
    : step('Vercel login (per folder)', {
        status: 'fail',
        fix: 'selesaikan login di browser, lalu ulangi npm run setup',
      });
}

function stepVercelLink(vercel) {
  const projectFile = join(ROOT, '.vercel', 'project.json');
  const run = (args) => sh(vercel[0], [...vercel[1], ...vercelArgs(env()), ...args]);
  let detail = 'sudah ter-link';
  if (!existsSync(projectFile)) {
    if (!run(['project', 'inspect', VERCEL_PROJECT]).ok) {
      const added = run(['project', 'add', VERCEL_PROJECT]);
      if (!added.ok)
        return step('Vercel project', {
          status: 'fail',
          detail: added.err.split('\n').pop(),
          fix: 'cek login Vercel',
        });
    }
    const linked = run(['link', '--yes', '--project', VERCEL_PROJECT]);
    if (!linked.ok || !existsSync(projectFile)) {
      return step('Vercel project', {
        status: 'fail',
        detail: linked.err.split('\n').pop(),
        fix: 'cek npm run doctor',
      });
    }
    detail = `${VERCEL_PROJECT} ter-link`;
  }
  const { orgId, projectId } = JSON.parse(readFileSync(projectFile, 'utf8'));
  const saved = saveEnv({ VERCEL_ORG_ID: orgId, VERCEL_PROJECT_ID: projectId }, true);
  return step('Vercel project', { detail: `${detail}${saved.length ? ', ID disimpan ke .env.local' : ''}` });
}

function stepVercelEnv(vercel) {
  const values = env();
  const names = envsToSync(values);
  if (names.length === 0)
    return step('Vercel env', { detail: 'belum ada nilai untuk disinkron (Supabase dibuat di P5-01)' });
  const failed = [];
  for (const name of names) {
    for (const target of ['production', 'preview']) {
      // Nilai lewat stdin (bukan --value) supaya tidak muncul di daftar proses.
      const r = sh(
        vercel[0],
        [...vercel[1], ...vercelArgs(values), 'env', 'add', name, target, '--force', '--yes'],
        {
          input: values[name],
        },
      );
      if (!r.ok) failed.push(`${name}@${target}`);
    }
  }
  return failed.length
    ? step('Vercel env', { status: 'fail', detail: `gagal: ${failed.join(', ')}`, fix: 'cek npm run doctor' })
    : step('Vercel env', { detail: `${names.length} variabel × production & preview` });
}

export async function runSetup() {
  /** @type {CheckResult[]} */
  const results = [stepEnvFile(), await stepTools(), stepGitLocal(), await stepGithub()];
  const vercel = findVercel();
  if (!vercel) {
    results.push(step('Vercel CLI', { status: 'fail', fix: 'npm install --global vercel' }));
  } else {
    const login = await stepVercelLogin(vercel);
    results.push(login);
    if (login.status === 'ok') results.push(stepVercelLink(vercel), stepVercelEnv(vercel));
  }
  results.push(
    step('Supabase (project, migrasi, akun tes)', { status: 'later', detail: 'P5-01' }),
    step('CI secrets & deploy pertama', { status: 'later', detail: 'P0-12 / P0-13' }),
  );
  return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSetup().then(
    (results) => {
      console.log('🛠️  Buahbatu Story · setup');
      console.log(formatReport(results));
      process.exit(exitCode(results));
    },
    (error) => {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    },
  );
}
