// Menjaga struktur folder sesuai arsitektur supaya tidak hilang diam-diam.
// Desain: docs/02-arsitektur.md §2 (task P0-02)
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

const SYSTEMS = [
  'time',
  'weather',
  'farming',
  'animals',
  'inventory',
  'economy',
  'shops',
  'careers',
  'bank',
  'housing',
  'vehicles',
  'outfits',
  'needs',
  'relationship',
  'family',
  'npc',
  'dialog',
  'quests',
  'cutscene',
  'events',
  'fishing',
  'cooking',
  'crafting',
  'exploration',
  'photo',
  'collections',
  'progression',
  'audio',
] as const;

const DIRECTORIES = [
  'maps',
  'api',
  'supabase/migrations',
  'scripts',
  'tests',
  'e2e',
  'docs',
  'public/assets/maps',
  'public/assets/tilesets',
  'public/assets/sprites',
  'public/assets/characters',
  'public/assets/portraits',
  'public/assets/ui',
  'public/assets/fonts',
  'public/assets/licenses',
  'public/assets/audio/music',
  'public/assets/audio/sfx',
  'public/assets/audio/ambience',
  'public/assets/audio/blips',
  'src/content/npcs',
  'src/content/dialogs',
  'src/content/quests',
  'src/content/cutscenes',
  'src/content/i18n',
  'src/content/personal.example',
  'src/ui/hud',
  'src/ui/phone',
  'src/ui/menus',
  'src/ui/dialog',
  'src/ui/components',
  'src/ui/styles',
] as const;

const FILES = [
  'src/main.ts',
  'src/config/game.ts',
  'src/config/balance.ts',
  'src/config/constants.ts',
  'src/core/state/index.ts',
  'src/core/commands/index.ts',
  'src/core/events/index.ts',
  'src/core/rng.ts',
  'src/core/clock.ts',
  'src/core/logger.ts',
  'src/scenes/index.ts',
  'src/entities/index.ts',
  'src/input/index.ts',
  'src/ui/index.ts',
  'src/net/index.ts',
  'src/net/voice/index.ts',
  'src/save/index.ts',
  'src/save/migrations/index.ts',
  'src/content/index.ts',
  'src/utils/index.ts',
] as const;

const isDir = (p: string) => existsSync(join(root, p)) && statSync(join(root, p)).isDirectory();

describe('struktur proyek (docs/02 §2)', () => {
  it.each(DIRECTORIES)('folder %s ada', (dir) => {
    expect(isDir(dir)).toBe(true);
  });

  it.each(FILES)('file %s ada', (file) => {
    expect(existsSync(join(root, file))).toBe(true);
  });

  it.each(SYSTEMS)('sistem %s punya index.ts yang merujuk dokumen desain', (name) => {
    const file = join(root, 'src/systems', name, 'index.ts');
    expect(existsSync(file)).toBe(true);
    const ref = /Desain: (docs\/[\w.-]+\.md)/.exec(readFileSync(file, 'utf8'))?.[1];
    expect(ref, 'rujukan dokumen').toBeDefined();
    expect(existsSync(join(root, ref ?? ''))).toBe(true);
  });

  it('konten personal tidak pernah ikut di-commit', () => {
    const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');
    expect(gitignore).toMatch(/^src\/content\/personal\/$/m);
  });
});
