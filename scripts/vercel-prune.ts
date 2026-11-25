import { errorMessage, isMain } from './lib/proc.ts';

export interface Deployment {
  uid: string;
  created: number;
  target?: string | null;
  state?: string;
  readyState?: string;
}

export const KEEP = { production: 3, preview: 2 } as const;
const BUSY = new Set(['BUILDING', 'QUEUED', 'INITIALIZING']);

const stateOf = (d: Deployment) => d.state ?? d.readyState ?? 'UNKNOWN';
const targetOf = (d: Deployment) => (d.target === 'production' ? 'production' : 'preview');

export function prunable(all: readonly Deployment[], keep: { production: number; preview: number } = KEEP): Deployment[] {
  const kept = new Set<string>();
  for (const target of ['production', 'preview'] as const)
    all
      .filter((d) => targetOf(d) === target && stateOf(d) === 'READY')
      .sort((a, b) => b.created - a.created)
      .slice(0, keep[target])
      .forEach((d) => kept.add(d.uid));
  return all.filter((d) => !kept.has(d.uid) && !BUSY.has(stateOf(d)));
}

async function main(): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  const project = process.env.VERCEL_PROJECT_ID;
  const org = process.env.VERCEL_ORG_ID ?? '';
  if (!token || !project) throw new Error('VERCEL_TOKEN dan VERCEL_PROJECT_ID wajib diisi');
  const team = org.startsWith('team_') ? `&teamId=${org}` : '';
  const api = async <T>(path: string, method = 'GET'): Promise<T> => {
    const r = await fetch(`https://api.vercel.com${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`${method} ${path.split('?')[0] ?? ''} → ${String(r.status)}`);
    return (await r.json()) as T;
  };
  const all: Deployment[] = [];
  let until = '';
  for (;;) {
    const page = await api<{ deployments: Deployment[]; pagination?: { next?: number | null } }>(
      `/v6/deployments?projectId=${project}&limit=100${until}${team}`,
    );
    all.push(...page.deployments);
    if (!page.pagination?.next) break;
    until = `&until=${String(page.pagination.next)}`;
  }
  const drop = prunable(all);
  let failed = 0;
  for (const d of drop)
    await api(`/v13/deployments/${d.uid}?x=1${team}`, 'DELETE').catch(() => {
      failed++;
    });
  console.log(`Deploy Vercel: ${String(all.length)} total, ${String(drop.length - failed)} dihapus, ${String(failed)} gagal dihapus`);
}

if (isMain(import.meta.url))
  main().catch((error: unknown) => {
    console.error(errorMessage(error));
    process.exitCode = 1;
  });
