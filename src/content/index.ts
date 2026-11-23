// Memuat semua konten JSON (kecuali personal/) dan memvalidasinya dengan zod.
// Desain: docs/02-arsitektur.md §1 & §2, docs/43-konten-personal.md §1
import { CONTENT_SCHEMAS } from './registry';
import { formatIssues, validateContent } from './validate';

const PREFIX = './';

const modules = import.meta.glob<unknown>(['./**/*.json', '!./personal/**', '!./personal.example/**'], {
  eager: true,
  import: 'default',
});

/** Konten mentah, key = path relatif ke src/content (mis. `i18n/id.json`). */
export const rawContent: Readonly<Record<string, unknown>> = Object.fromEntries(
  Object.entries(modules).map(([path, data]) => [path.slice(PREFIX.length), data]),
);

/** Lempar error berisi semua masalah konten; dipanggil sekali saat boot. */
export function assertContentValid(): void {
  const issues = validateContent(rawContent, CONTENT_SCHEMAS);
  if (issues.length > 0) throw new Error(`Konten tidak valid:\n${formatIssues(issues)}`);
}
