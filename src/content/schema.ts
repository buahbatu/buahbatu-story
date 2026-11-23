import { z } from 'zod';

export const contentIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, 'ID konten wajib snake_case (huruf kecil, angka, _) dan diawali huruf');

export function findDuplicateIds(items: readonly { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

export function idListSchema<T extends z.ZodType<{ id: string }>>(item: T) {
  return z.array(item).superRefine((items, ctx) => {
    for (const id of findDuplicateIds(items)) {
      ctx.addIssue({ code: 'custom', message: `ID duplikat: ${id}` });
    }
  });
}
