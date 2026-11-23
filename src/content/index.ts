import { CONTENT_SCHEMAS } from './registry';
import { formatIssues, validateContent } from './validate';

const PREFIX = './';

const modules = import.meta.glob<unknown>(['./**/*.json', '!./personal/**', '!./personal.example/**'], {
  eager: true,
  import: 'default',
});

export const rawContent: Readonly<Record<string, unknown>> = Object.fromEntries(
  Object.entries(modules).map(([path, data]) => [path.slice(PREFIX.length), data]),
);

export function assertContentValid(): void {
  const issues = validateContent(rawContent, CONTENT_SCHEMAS);
  if (issues.length > 0) throw new Error(`Konten tidak valid:\n${formatIssues(issues)}`);
}
