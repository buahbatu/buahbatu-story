// Peta file konten (relatif ke src/content) → skema zod. Setiap JSON baru WAJIB didaftarkan di sini.
// Desain: docs/02-arsitektur.md §1, AGENTS.md §5
import type { z } from 'zod';

export type ContentRegistry = Readonly<Record<string, z.ZodType>>;

export const CONTENT_SCHEMAS: ContentRegistry = {};
