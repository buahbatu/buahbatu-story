export type Status = 'ok' | 'warn' | 'fail' | 'later';
export interface CheckResult {
  group: string;
  name: string;
  status: Status;
  detail?: string;
  fix?: string;
}

export const ICON: Record<Status, string> = { ok: '✅', warn: '⚠️ ', fail: '❌', later: '⏳' };

export const gate = (passed: boolean, requiredNow: boolean): Status => (passed ? 'ok' : requiredNow ? 'fail' : 'later');

export function formatReport(results: CheckResult[]): string {
  const lines: string[] = [];
  let group = '';
  for (const r of results) {
    if (r.group !== group) lines.push('', `── ${(group = r.group)}`);
    lines.push(`  ${ICON[r.status]} ${r.name}${r.detail ? `  · ${r.detail}` : ''}`);
  }
  const fixes = results.filter((r) => (r.status === 'fail' || r.status === 'warn') && r.fix);
  if (fixes.length > 0) lines.push('', '── Yang perlu dilakukan', ...fixes.map((r) => `  ${ICON[r.status]} ${r.name}: ${r.fix ?? ''}`));
  const count = (s: Status) => results.filter((r) => r.status === s).length;
  lines.push('', `Ringkasan: ${count('ok')} ok · ${count('warn')} peringatan · ${count('fail')} gagal · ${count('later')} belum waktunya`);
  return lines.join('\n');
}

export const exitCode = (results: CheckResult[]): number => (results.some((r) => r.status === 'fail') ? 1 : 0);
