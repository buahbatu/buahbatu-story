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
    // Tanpa kutip, `#` di awal nilai atau setelah spasi = komentar (`KEY=  # catatan` → kosong).
    value = quoted ? (quoted[2] ?? '') : value.replace(/(^|\s+)#.*$/, '').trim();
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
 * Isi variabel di teks env TANPA menimpa nilai yang sudah ada (kecuali `overwrite`).
 * Baris lain (komentar, urutan) dipertahankan; variabel yang belum ada ditambahkan di akhir.
 * @param {string} text
 * @param {Record<string, string>} values
 * @param {{ overwrite?: boolean }} [options]
 * @returns {{ text: string, changed: string[] }}
 */
export function upsertEnv(text, values, { overwrite = false } = {}) {
  const existing = parseEnv(text);
  const pending = new Map(Object.entries(values).filter(([, v]) => v !== ''));
  /** @type {string[]} */
  const changed = [];
  const lines = text.split(/\r?\n/).map((line) => {
    const name = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)?.[1];
    if (!name || !pending.has(name)) return line;
    const value = pending.get(name) ?? '';
    pending.delete(name);
    if (existing[name] !== undefined && (!overwrite || existing[name] === value)) return line;
    changed.push(name);
    return `${name}=${value}`;
  });
  for (const [name, value] of pending) {
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    lines.push(`${name}=${value}`, '');
    changed.push(name);
  }
  return { text: lines.join('\n'), changed };
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
