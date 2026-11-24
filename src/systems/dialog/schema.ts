import { z } from 'zod';
import { contentIdSchema, idListSchema } from '../../content/schema';

export const MAX_CHOICES = 4;

const textLine = z.object({
  speaker: contentIdSchema,
  portrait: contentIdSchema.optional(),
  text: z.string().min(1),
});

const choice = z.object({
  text: z.string().min(1),
  next: contentIdSchema.optional(),
  effects: z.record(z.string(), z.number()).optional(),
});

const choiceLine = z.object({ choices: z.array(choice).min(1).max(MAX_CHOICES) });

export const dialogSchema = z.object({
  id: contentIdSchema,
  conditions: z.record(z.string(), z.unknown()).optional(),
  lines: z.array(z.union([textLine, choiceLine])).min(1),
  once: z.boolean().optional(),
  priority: z.number().optional(),
});

export const dialogFileSchema = idListSchema(dialogSchema).superRefine((dialogs, ctx) => {
  for (const d of dialogs)
    d.lines.forEach((line, i) => {
      if ('choices' in line && i !== d.lines.length - 1)
        ctx.addIssue({ code: 'custom', message: `${d.id}: pilihan harus di baris terakhir` });
    });
});

export type Dialog = z.infer<typeof dialogSchema>;
export type DialogLine = Dialog['lines'][number];
export type TextLine = z.infer<typeof textLine>;
export type Choice = z.infer<typeof choice>;
