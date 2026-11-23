import type { z } from 'zod';
import { i18nSchema } from './i18n';

export type ContentRegistry = Readonly<Record<string, z.ZodType>>;

export const CONTENT_SCHEMAS: ContentRegistry = {
  'i18n/id.json': i18nSchema,
};
