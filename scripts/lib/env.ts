import { existsSync, readFileSync } from 'node:fs';

export type Env = Record<string, string | undefined>;

export function parseEnv(text: string): Env {
  const env: Env = {};
  for (const raw of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(raw);
    if (!match?.[1]) continue;
    const trimmed = (match[2] ?? '').trim();
    const quoted = /^(['"])(.*)\1$/.exec(trimmed);
    const value = quoted ? (quoted[2] ?? '') : trimmed.replace(/(^|\s+)#.*$/, '').trim();
    if (value) env[match[1]] = value;
  }
  return env;
}

export const readEnvFile = (file: string): Env => (existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {});

export function upsertEnv(text: string, values: Record<string, string>, { overwrite = false } = {}) {
  const existing = parseEnv(text);
  const pending = new Map(Object.entries(values).filter(([, v]) => v !== ''));
  const changed: string[] = [];
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
    if (lines.at(-1) === '') lines.pop();
    lines.push(`${name}=${value}`, '');
    changed.push(name);
  }
  return { text: lines.join('\n'), changed };
}

export function mask(value: string | undefined): string {
  if (!value) return '(kosong)';
  if (value.length < 12) return '****';
  return `${/^[a-z]+_/i.exec(value)?.[0] ?? ''}****${value.slice(-4)}`;
}
