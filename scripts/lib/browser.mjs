// Buka halaman login di browser user. Di perangkat ini: Chrome dengan profil tertentu
// (LOGIN_CHROME_PROFILE di .env.local, mis. "Profile 2") supaya login memakai akun yang benar.
// Desain: docs/51 §2a
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function chromePath() {
  if (process.platform !== 'win32') return null;
  const candidates = [
    join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(
      process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)',
      'Google',
      'Chrome',
      'Application',
      'chrome.exe',
    ),
    join(process.env.LOCALAPPDATA ?? '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

/**
 * Pilih URL halaman login/otorisasi dari output CLI. Abaikan tautan dokumentasi (mis. pemberitahuan
 * telemetri Vercel yang muncul di run pertama). Murni.
 * @param {string} text
 * @returns {string | undefined}
 */
export function pickLoginUrl(text) {
  const urls = text.match(/https:\/\/[^\s"'<>)]+/g) ?? [];
  return urls.find((url) => /login|device|oauth|authorize/i.test(url) && !/\/docs\/|telemetry/i.test(url));
}

/**
 * Kode device login (format `ABCD-EFGH`) dari output CLI. Murni.
 * @param {string} text
 */
export function pickDeviceCode(text) {
  return /\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/.exec(text)?.[1];
}

/**
 * Argumen Chrome untuk membuka URL di profil tertentu. Murni.
 * @param {string} url
 * @param {string | undefined} profile
 */
export function chromeArgs(url, profile) {
  return [...(profile ? [`--profile-directory=${profile}`] : []), url];
}

/**
 * Buka URL; kembalikan true kalau berhasil memicu browser. URL selalu juga dicetak oleh pemanggil.
 * @param {string} url
 * @param {string | undefined} profile
 */
export function openUrl(url, profile) {
  if (!/^https:\/\//.test(url)) return false;
  const chrome = chromePath();
  const [command, args] = chrome
    ? [chrome, chromeArgs(url, profile)]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  try {
    spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
    return true;
  } catch {
    return false;
  }
}
