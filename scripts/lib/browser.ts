import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function chromePath(): string | null {
  if (process.platform !== 'win32') return null;
  const exe = ['Google', 'Chrome', 'Application', 'chrome.exe'] as const;
  const bases = [
    process.env.ProgramFiles ?? 'C:\\Program Files',
    process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)',
    process.env.LOCALAPPDATA ?? '',
  ];
  return bases.map((base) => join(base, ...exe)).find((path) => existsSync(path)) ?? null;
}

export const pickLoginUrl = (text: string): string | undefined =>
  (text.match(/https:\/\/[^\s"'<>)]+/g) ?? []).find((url) => /login|device|oauth|authorize/i.test(url) && !/\/docs\/|telemetry/i.test(url));

export const pickDeviceCode = (text: string): string | undefined => /\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/.exec(text)?.[1];

export const chromeArgs = (url: string, profile?: string): string[] => [...(profile ? [`--profile-directory=${profile}`] : []), url];

export function openUrl(url: string, profile?: string): boolean {
  if (!url.startsWith('https://')) return false;
  const chrome = chromePath();
  const [command, args]: [string, string[]] = chrome
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
