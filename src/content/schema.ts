// Skema dasar konten. Desain: docs/02-arsitektur.md §1, docs/03-standar-kode.md §2
import { z } from 'zod';

/** ID konten: snake_case, diawali huruf (contoh `strawberry_seed`, `npc_bu_euis`). */
export const contentIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, 'ID konten wajib snake_case (huruf kecil, angka, _) dan diawali huruf');

/** Mengembalikan ID yang muncul lebih dari sekali (urut sesuai kemunculan pertama duplikatnya). */
export function findDuplicateIds(items: readonly { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

/** Daftar entri ber-ID dengan cek ID unik; dipakai sebagai dasar skema file konten. */
export function idListSchema<T extends z.ZodType<{ id: string }>>(item: T) {
  return z.array(item).superRefine((items, ctx) => {
    for (const id of findDuplicateIds(items)) {
      ctx.addIssue({ code: 'custom', message: `ID duplikat: ${id}` });
    }
  });
}
