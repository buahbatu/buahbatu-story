import { z } from 'zod';
import { contentIdSchema, idListSchema } from '../../content/schema';

export const CHANNELS = ['music', 'sfx', 'ambience'] as const;
export type Channel = (typeof CHANNELS)[number];

export const SURFACES = ['grass', 'gravel', 'wood', 'hard', 'soft', 'water'] as const;
export type Surface = (typeof SURFACES)[number];

const soundSchema = z.object({
  id: contentIdSchema,
  channel: z.enum(CHANNELS),
  files: z.array(z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'path tanpa ekstensi, mis. sfx/step-grass-0')).min(1),
  volume: z.number().min(0).max(1),
  loop: z.boolean().optional(),
  rate: z.tuple([z.number().positive(), z.number().positive()]).optional(),
});

export const soundFileSchema = z
  .object({
    sounds: idListSchema(soundSchema),
    steps: z.record(z.enum(SURFACES), contentIdSchema),
    terrain: z.record(z.string(), z.enum(SURFACES)),
  })
  .superRefine((data, ctx) => {
    const ids = new Set(data.sounds.map((s) => s.id));
    for (const [surface, id] of Object.entries(data.steps))
      if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `Suara langkah ${surface} → ${id} tidak ada` });
    for (const surface of SURFACES)
      if (!(surface in data.steps)) ctx.addIssue({ code: 'custom', message: `Permukaan ${surface} belum punya suara langkah` });
  });

export type SoundDef = z.infer<typeof soundSchema>;
export type SoundFile = z.infer<typeof soundFileSchema>;
