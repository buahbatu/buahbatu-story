export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export type LogSink = (level: LogLevel, scope: string, args: readonly unknown[]) => void;

export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  child(scope: string): Logger;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  sink?: LogSink;
}

const MASK = '****';
const SECRET_KEY = /pass(word)?|secret|token|api[-_]?key|service[-_]?role|authorization|cookie/i;
const SECRET_VALUE: readonly RegExp[] = [
  /eyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g,
  /\b(gh[pousr]_|github_pat_)\w{10,}/g,
  /\b(sb_secret_|sb_publishable_|sbp_)\w{10,}/g,
  /\bBearer\s+[\w.-]{10,}/gi,
];

function redactString(text: string): string {
  return SECRET_VALUE.reduce((out, pattern) => out.replace(pattern, MASK), text);
}

export function redact(value: unknown, seen = new WeakSet()): unknown {
  if (typeof value === 'string') return redactString(value);
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[siklik]';
  seen.add(value);
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: value.stack && redactString(value.stack),
    };
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? MASK : redact(item, seen)]));
}

const consoleSink: LogSink = (level, scope, args) => {
  console[level](`[${scope}]`, ...args);
};

export function createLogger(scope: string, options: LoggerOptions = {}): Logger {
  const minLevel = options.minLevel ?? (import.meta.env.DEV ? 'debug' : 'warn');
  const sink = options.sink ?? consoleSink;
  const log =
    (level: LogLevel) =>
    (...args: unknown[]) => {
      if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;
      sink(
        level,
        scope,
        args.map((arg) => redact(arg)),
      );
    };
  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    child: (sub) => createLogger(`${scope}:${sub}`, { minLevel, sink }),
  };
}

export const logger = createLogger('bb');
