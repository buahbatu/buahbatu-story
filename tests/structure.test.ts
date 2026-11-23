import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const words = (s: string) => s.trim().split(/\s+/);
const SYSTEMS = words(`time:11 weather:11 farming:12 animals:12 inventory:12 economy:13 shops:13 careers:13 bank:13
  housing:14 vehicles:14 outfits:15 needs:16 relationship:16 family:17 npc:18 dialog:18 quests:19 cutscene:19 events:19
  fishing:20 cooking:20 crafting:20 exploration:20 photo:20 collections:21 progression:21 audio:41`).map(
  (s) => s.split(':') as [string, string],
);
const DIRECTORIES = words(`maps api supabase/migrations scripts tests e2e docs
  public/assets/maps public/assets/tilesets public/assets/sprites public/assets/characters public/assets/portraits
  public/assets/ui public/assets/fonts public/assets/licenses public/assets/audio/music public/assets/audio/sfx
  public/assets/audio/ambience public/assets/audio/blips src/content/npcs src/content/dialogs src/content/quests
  src/content/cutscenes src/content/i18n src/content/personal.example src/ui/hud src/ui/phone src/ui/menus
  src/ui/dialog src/ui/components src/ui/styles`);
const FILES = words(`src/main.ts src/config/game.ts src/config/balance.ts
  src/core/state/index.ts src/core/commands/index.ts src/core/events/index.ts src/core/rng.ts src/core/clock.ts
  src/core/logger.ts src/scenes/index.ts src/entities/index.ts src/input/index.ts src/ui/index.ts src/net/index.ts
  src/net/voice/index.ts src/save/index.ts src/save/migrations/index.ts src/content/index.ts src/utils/index.ts`);
const isDir = (p: string) => existsSync(join(root, p)) && statSync(join(root, p)).isDirectory();
const docs = readdirSync(join(root, 'docs'));

describe('struktur proyek (docs/02 §2)', () => {
  it.each(DIRECTORIES)('folder %s ada', (dir) => {
    expect(isDir(dir)).toBe(true);
  });
  it.each(FILES)('file %s ada', (file) => {
    expect(existsSync(join(root, file))).toBe(true);
  });
  it.each(SYSTEMS)('sistem %s punya index.ts dan dokumen desain docs/%s-*', (name, doc) => {
    expect(existsSync(join(root, 'src/systems', name, 'index.ts'))).toBe(true);
    expect(docs.some((f) => f.startsWith(`${doc}-`))).toBe(true);
  });
  it('tidak ada folder sistem di luar daftar', () => {
    expect(readdirSync(join(root, 'src/systems')).sort()).toEqual(SYSTEMS.map(([name]) => name).sort());
  });
  it('konten personal tidak pernah ikut di-commit', () => {
    expect(readFileSync(join(root, '.gitignore'), 'utf8')).toMatch(/^src\/content\/personal\/$/m);
  });
});
