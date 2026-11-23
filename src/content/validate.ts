import type { ContentRegistry } from './registry';

export interface ContentIssue {
  file: string;
  message: string;
}

export function validateContent(files: Readonly<Record<string, unknown>>, registry: ContentRegistry): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const [file, data] of Object.entries(files)) {
    const schema = registry[file];
    if (!schema) {
      issues.push({ file, message: 'Belum ada skema zod di src/content/registry.ts' });
      continue;
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const at = issue.path.length > 0 ? ` (di ${issue.path.join('.')})` : '';
        issues.push({ file, message: `${issue.message}${at}` });
      }
    }
  }
  for (const file of Object.keys(registry)) {
    if (!(file in files)) issues.push({ file, message: 'Terdaftar di registry tapi file-nya tidak ada' });
  }
  return issues;
}

export function formatIssues(issues: readonly ContentIssue[]): string {
  return issues.map(({ file, message }) => `• ${file}: ${message}`).join('\n');
}
