export function parseTaskId(id: string): [number, number, string] {
  const match = /^P(\d+)-(\d+)([a-z]?)$/.exec(id.trim());
  if (!match) throw new Error(`ID task tidak valid: ${id}`);
  return [Number(match[1]), Number(match[2]), match[3] ?? ''];
}

export function compareTasks(a: string, b: string): number {
  const [pa, na, sa] = parseTaskId(a);
  const [pb, nb, sb] = parseTaskId(b);
  return pa - pb || na - nb || sa.localeCompare(sb);
}

export function currentTask(todoText: string): string | undefined {
  const find = (mark: string) => new RegExp(`^- \\[${mark}\\] \\*\\*(P\\d+-\\d+[a-z]?)\\*\\*`, 'm').exec(todoText)?.[1];
  return find('~') ?? find(' ');
}

export const isRequiredNow = (current: string | undefined, neededFrom: string): boolean =>
  current === undefined || compareTasks(current, neededFrom) >= 0;
