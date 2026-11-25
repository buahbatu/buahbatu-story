export function parseTaskId(id: string): [number, string, number, string] {
  const match = /^P(\d+)([A-Z]?)-(\d+)([a-z]?)$/.exec(id.trim());
  if (!match) throw new Error(`ID task tidak valid: ${id}`);
  return [Number(match[1]), match[2] ?? '', Number(match[3]), match[4] ?? ''];
}

export function compareTasks(a: string, b: string): number {
  const [pa, xa, na, sa] = parseTaskId(a);
  const [pb, xb, nb, sb] = parseTaskId(b);
  return pa - pb || xa.localeCompare(xb) || na - nb || sa.localeCompare(sb);
}

export function currentTask(todoText: string): string | undefined {
  const find = (mark: string) => new RegExp(`^- \\[${mark}\\] \\*\\*(P\\d+[A-Z]?-\\d+[a-z]?)\\*\\*`, 'm').exec(todoText)?.[1];
  return find('~') ?? find(' ');
}

export const isRequiredNow = (current: string | undefined, neededFrom: string): boolean =>
  current === undefined || compareTasks(current, neededFrom) >= 0;
