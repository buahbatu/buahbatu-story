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

export const MOODS = ['title', 'day', 'evening', 'night'] as const;
export type Mood = (typeof MOODS)[number];

const trackSchema = z.object({
  id: contentIdSchema,
  file: z.string().regex(/^music\/[a-z0-9-]+$/, 'path musik tanpa ekstensi, mis. music/title'),
  volume: z.number().min(0).max(1),
});

export const soundFileSchema = z
  .object({
    sounds: idListSchema(soundSchema),
    music: z.object({ tracks: idListSchema(trackSchema), moods: z.record(z.enum(MOODS), z.array(contentIdSchema).min(1)) }),
    steps: z.record(z.enum(SURFACES), contentIdSchema),
    terrain: z.record(z.string(), z.enum(SURFACES)),
  })
  .superRefine((data, ctx) => {
    const ids = new Set(data.sounds.map((s) => s.id));
    for (const [surface, id] of Object.entries(data.steps))
      if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `Suara langkah ${surface} → ${id} tidak ada` });
    for (const surface of SURFACES)
      if (!(surface in data.steps)) ctx.addIssue({ code: 'custom', message: `Permukaan ${surface} belum punya suara langkah` });
    const tracks = new Set(data.music.tracks.map((t) => t.id));
    for (const mood of MOODS) {
      for (const id of data.music.moods[mood])
        if (!tracks.has(id)) ctx.addIssue({ code: 'custom', message: `Lagu ${id} (${mood}) tidak ada` });
    }
  });

export type SoundDef = z.infer<typeof soundSchema>;
export type TrackDef = z.infer<typeof trackSchema>;
export type SoundFile = z.infer<typeof soundFileSchema>;
