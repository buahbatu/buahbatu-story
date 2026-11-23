import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { contentIdSchema, findDuplicateIds, idListSchema } from './schema';
import { formatIssues, validateContent } from './validate';

const itemSchema = idListSchema(z.object({ id: contentIdSchema, price: z.number().int().nonnegative() }));
const registry = { 'items.json': itemSchema };

describe('contentIdSchema', () => {
  it.each(['strawberry_seed', 'npc_bu_euis', 'crop2'])('menerima %s', (id) => {
    expect(contentIdSchema.safeParse(id).success).toBe(true);
  });

  it.each(['Strawberry', 'strawberry-seed', '2crop', '', 'kopi susu'])('menolak "%s"', (id) => {
    expect(contentIdSchema.safeParse(id).success).toBe(false);
  });
});

describe('findDuplicateIds', () => {
  it('kosong kalau semua unik', () => {
    expect(findDuplicateIds([{ id: 'a' }, { id: 'b' }])).toEqual([]);
  });

  it('melaporkan setiap ID duplikat sekali saja', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'a' }, { id: 'b' }];
    expect(findDuplicateIds(items)).toEqual(['a', 'b']);
  });
});

describe('validateContent', () => {
  it('lolos untuk konten yang benar', () => {
    const files = { 'items.json': [{ id: 'strawberry_seed', price: 40 }] };
    expect(validateContent(files, registry)).toEqual([]);
  });

  it('menolak ID duplikat', () => {
    const files = {
      'items.json': [
        { id: 'strawberry_seed', price: 40 },
        { id: 'strawberry_seed', price: 50 },
      ],
    };
    expect(validateContent(files, registry)).toEqual([
      { file: 'items.json', message: 'ID duplikat: strawberry_seed' },
    ]);
  });

  it('menunjukkan lokasi field yang salah', () => {
    const files = { 'items.json': [{ id: 'strawberry_seed', price: -1 }] };
    const [issue] = validateContent(files, registry);
    expect(issue?.message).toContain('(di 0.price)');
  });

  it('menolak file JSON yang belum punya skema', () => {
    const files = { 'items.json': [], 'crops.json': [] };
    expect(validateContent(files, registry)).toEqual([
      { file: 'crops.json', message: 'Belum ada skema zod di src/content/registry.ts' },
    ]);
  });

  it('menolak skema terdaftar yang file-nya hilang', () => {
    expect(validateContent({}, registry)).toEqual([
      { file: 'items.json', message: 'Terdaftar di registry tapi file-nya tidak ada' },
    ]);
  });

  it('formatIssues membuat daftar yang mudah dibaca', () => {
    expect(formatIssues([{ file: 'a.json', message: 'rusak' }])).toBe('• a.json: rusak');
  });
});
