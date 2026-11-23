// Baca file env (.env.local) & samarkan nilai. Murni (kecuali readEnvFile). Desain: docs/51 §1.4 & §7
import { existsSync, readFileSync } from 'node:fs';

/**
 * Parse teks env `KEY=nilai`. Baris kosong/komentar diabaikan, komentar di belakang nilai
 * (`KEY=  # catatan`) dibuang, tanda kutip pembungkus dilepas. Nilai kosong TIDAK dimasukkan.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnv(text) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(raw);
    if (!match) continue;
    let value = (match[2] ?? '').trim();
    const quoted = /^(['"])(.*)\1$/.exec(value);
    value = quoted ? (quoted[2] ?? '') : value.replace(/\s+#.*$/, '').trim();
    if (value) env[match[1] ?? ''] = value;
  }
  return env;
}

/**
 * @param {string} file
 * @returns {Record<string, string>}
 */
export function readEnvFile(file) {
  return existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
}

/**
 * Samarkan rahasia untuk ditampilkan: `ghp_****abcd`. Nilai pendek disamarkan total.
 * @param {string | undefined} value
 */
export function mask(value) {
  if (!value) return '(kosong)';
  if (value.length < 12) return '****';
  const prefix = /^[a-z]+_/i.exec(value)?.[0] ?? '';
  return `${prefix}****${value.slice(-4)}`;
}
