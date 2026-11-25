# 02 · Arsitektur

## 1. Prinsip
1. **Multiplayer-ready sejak hari pertama.** Semua perubahan state lewat **Command**, jadi nanti Command tinggal dikirim lewat jaringan.
2. **Logika murni terpisah dari engine (Three.js).** Aturan game (tumbuh tanaman, harga, cicilan, quest) ditulis sebagai fungsi murni yang bisa di-test tanpa browser.
3. **Data-driven.** Konten = JSON di `src/content/`, kode = mesin. Menambah item/NPC/quest **tidak perlu** mengubah kode.
4. **Modular per sistem.** Setiap sistem punya folder sendiri dan berkomunikasi lewat **EventBus** bertipe, tidak saling import sembarangan.
5. **Satu sumber kebenaran.** `GameState` adalah satu objek serializable (bisa langsung disimpan sebagai JSON).

## 2. Struktur Folder
```
buahbatu-story/
├─ AGENTS.md · CLAUDE.md · README.md · TODO.md · CHANGELOG.md · PROMPT.md · CREDITS.md
├─ docs/                       # dokumen desain (folder ini)
├─ maps/                       # sumber Tiled (.tmx/.tsx), BUKAN yang di-load game
├─ public/
│  └─ assets/
│     ├─ maps/                 # hasil export Tiled (.tmj/.json)
│     ├─ tilesets/
│     ├─ sprites/              # atlas objek, item, tanaman
│     ├─ characters/           # layer LPC (body, hair, outfit...)
│     ├─ portraits/
│     ├─ ui/
│     ├─ audio/{music,sfx,ambience,blips}/
│     └─ fonts/
├─ src/
│  ├─ engine/                  # Engine Three.js: renderer resolusi rendah, loop, scene manager (ADR-022)
│  ├─ main.ts                  # entry: renderer Three.js + scene manager + mount UI Preact
│  ├─ config/
│  │  ├─ game.ts               # resolusi, physics, scale
│  │  ├─ balance.ts            # SEMUA angka balancing
│  ├─ core/
│  │  ├─ state/                # GameState types, createInitialState, selectors
│  │  ├─ commands/             # tipe Command, dispatcher, registry handler
│  │  ├─ events/               # EventBus bertipe + daftar GameEvent
│  │  ├─ rng.ts                # RNG seeded (deterministik)
│  │  ├─ clock.ts              # jam game (dipakai sistem waktu)
│  │  └─ logger.ts
│  ├─ systems/                 # satu folder per sistem
│  │  ├─ time/  weather/  farming/  animals/  inventory/  economy/
│  │  ├─ shops/ careers/  bank/  housing/  vehicles/  outfits/
│  │  ├─ needs/ relationship/  family/  npc/  dialog/  quests/
│  │  ├─ cutscene/  events/  fishing/  cooking/  crafting/  exploration/
│  │  ├─ photo/ collections/  progression/  audio/
│  │  └─ <sistem>/
│  │     ├─ types.ts           # tipe data sistem
│  │     ├─ logic.ts           # fungsi MURNI (wajib di-test)
│  │     ├─ handlers.ts        # handler Command → panggil logic → emit event
│  │     ├─ view.ts            # (opsional) adapter ke Three.js
│  │     └─ logic.test.ts
│  ├─ scenes/
│  │  ├─ BootScene.ts  PreloadScene.ts  TitleScene.ts
│  │  ├─ CharacterCreatorScene.ts
│  │  └─ WorldScene.ts         # memuat area aktif, entity, kamera
│  ├─ entities/                # Player, RemotePlayer, Npc, Crop, Animal, Vehicle, Interactable
│  ├─ input/                   # abstraksi input (keyboard/touch/gamepad → Action)
│  ├─ ui/                      # Preact
│  │  ├─ App.tsx  hud/  phone/  menus/  dialog/  components/  styles/
│  ├─ net/
│  │  ├─ supabase.ts  auth.ts  presence.ts  sync.ts  host.ts
│  │  └─ voice/                # webrtc, proximity, voicenote
│  ├─ save/
│  │  ├─ schema.ts             # zod schema save
│  │  ├─ migrations/           # v1→v2, dst.
│  │  ├─ local.ts  cloud.ts  index.ts
│  ├─ content/                 # JSON data + loader zod
│  │  ├─ items.json  crops.json  animals.json  fish.json  recipes.json
│  │  ├─ outfits.json  furniture.json  vehicles.json  properties.json
│  │  ├─ shops.json  careers.json  npcs/  dialogs/  quests/  cutscenes/
│  │  ├─ festivals.json  random-events.json  achievements.json
│  │  ├─ personal/             # GITIGNORE, lihat 43-konten-personal.md
│  │  └─ index.ts              # load + validasi semua konten
│  └─ utils/
├─ api/                        # Vercel functions (keepalive, turn-credentials)
├─ supabase/migrations/        # file SQL berurutan
├─ scripts/                    # validate-content, tools
└─ tests/                      # test integrasi / e2e
```

## 3. Lapisan & Aliran Data
```
 Input (keyboard/touch)            Jaringan (pasangan)
          │                                │
          ▼                                ▼
   Action (move, use, interact)      Command dari remote
          │                                │
          └──────────► Command ◄───────────┘
                          │
                          ▼
              CommandDispatcher (di HOST)
                          │ panggil handler sistem
                          ▼
         logic.ts (murni) → GameState baru + GameEvent[]
                          │
             ┌────────────┼──────────────┐
             ▼            ▼              ▼
        EventBus      Save (debounce)   Net broadcast (kalau host)
             │
     ┌───────┴────────┐
     ▼                ▼
 3D view (Three)  Preact UI
```
- **Gerak karakter** tidak lewat Command (terlalu sering); dikirim sebagai *broadcast posisi* (lihat `30-multiplayer.md`).
- Saat solo, pemain otomatis jadi **host**.

## 4. Command Pattern
```ts
// src/core/commands/types.ts
export type PlayerId = 'A' | 'B';

export type Command =
  | { type: 'farm/till'; by: PlayerId; area: AreaId; tile: TilePos }
  | { type: 'farm/plant'; by: PlayerId; area: AreaId; tile: TilePos; seedId: ItemId }
  | { type: 'farm/water'; by: PlayerId; area: AreaId; tile: TilePos }
  | { type: 'shop/buy'; by: PlayerId; shopId: ShopId; itemId: ItemId; qty: number }
  | { type: 'time/sleep'; by: PlayerId };
  // ...tambah per sistem

export interface CommandResult {
  ok: boolean;
  reason?: string;        // kunci teks i18n, misal 'error.notEnoughMoney'
  events: GameEvent[];
}

// src/core/commands/types.ts (implementasi P0-07, ADR-017)
export type HandlerOutcome = { ok: true; events: GameEvent[] } | { ok: false; reason: I18nKey };
export type Handler<C extends Command> = (draft: Draft<GameState>, cmd: C) => HandlerOutcome;
export type HandlerMap = { [T in CommandType]: Handler<CommandOf<T>> }; // wajib lengkap

// src/core/commands/world.ts (contoh)
export const setFlag: Handler<CommandOf<'world/setFlag'>> = (draft, cmd) => {
  if (!FLAG_KEY.test(cmd.key)) return reject('error.invalidCommand');
  draft.world.flags[cmd.key] = cmd.value;
  return succeed([{ type: 'world/flagChanged', /* ... */ }]);
};
// CommandDispatcher.dispatch(cmd) → { ok, reason?, events, patches, inversePatches }
```
Aturan:
- Handler **memutasi `draft` Immer**, lalu mengembalikan `succeed(events)` atau `reject(reasonKey)`. Dispatcher menjalankannya secara **atomik**: reject/throw → state tidak berubah sama sekali.
- Handler **tidak boleh** menyentuh engine (Three.js), DOM, atau jaringan.
- Semua keputusan acak memakai `rng` dari state (seeded) supaya host dan klien konsisten.

## 5. GameState (garis besar)
```ts
interface GameState {
  meta: { schemaVersion: number; householdId: string; createdAt: string };
  world: {
    clock: { day: number; season: Season; year: number; minute: number };
    weather: { today: WeatherId; tomorrow: WeatherId };
    rngSeed: number;
    areas: Record<AreaId, AreaState>;   // tanah, tanaman, objek
    animals: AnimalState[];
    npcs: Record<NpcId, NpcState>;
    town: { projects: ProjectState[]; museum: DonationState };
    flags: Record<string, boolean | number | string>;
  };
  household: {
    stage: RelationshipStage;
    bond: { friendship: number; romance: number };
    sharedWallet: number | null;        // null sebelum nikah
    properties: PropertyState[];
    loans: LoanState[];
    children: ChildState[];
    memoriesUnlocked: string[];
  };
  players: Record<PlayerId, PlayerState>;  // posisi, needs, wallet, inventory, outfit, skills, career
  quests: QuestLogState;
  collections: CollectionState;
}
```

## 6. Scene (scene manager sendiri di atas Three.js, ADR-022)
| Scene | Tugas |
|---|---|
| `BootScene` | Load config minimal, font |
| `PreloadScene` | Loading bar, load atlas umum & konten JSON |
| `TitleScene` | Login, pilih lanjut/baru, status pasangan |
| `CharacterCreatorScene` | Bikin karakter (sekali di awal) |
| `WorldScene` | Area aktif: tilemap, entity, kamera, efek cuaca/cahaya |

UI (HUD, HP, menu, dialog) **tidak** dibuat sebagai scene Phaser, tapi sebagai **Preact overlay** di atas canvas 3D, berkomunikasi lewat EventBus + store.

Area dimuat **per area** (lazy). Pindah area = unload tilemap lama → load tilemap baru → fade.

## 7. EventBus
```ts
type GameEvent =
  | { type: 'time/minute'; minute: number }
  | { type: 'time/dayStarted'; day: number; season: Season }
  | { type: 'farm/harvested'; by: PlayerId; itemId: ItemId; qty: number; quality: Quality }
  | { type: 'relationship/stageChanged'; from: RelationshipStage; to: RelationshipStage }
  | { type: 'ui/toast'; key: string; params?: Record<string, string | number> };
```
Event dipakai untuk: update UI, memicu quest/achievement, SFX, notifikasi.

## 8. Depth (urutan gambar)
Dunia 3D (ADR-022): urutan gambar ditentukan depth buffer Three.js; sprite karakter (billboard) berdiri di dunia 3D sehingga otomatis bisa di depan/belakang pohon & bangunan.

## 9. Performa
- Texture atlas, bukan ratusan file gambar terpisah.
- Hanya area aktif yang dirender; area lain disimulasikan sebagai **data** (tanaman tetap tumbuh).
- Object pooling untuk partikel (hujan, daun, kembang api).
- Target: 60 fps di laptop, ≥30 fps di HP menengah.
- **Anggaran render (ADR-030)**: ≤ 200 draw call & ≤ 400 rb segitiga terlihat di tingkat kualitas Seimbang. Geometri statis digabung per chunk & per material; objek berulang memakai instancing; efek pasca-proses resolusi setengah di Rendah/Seimbang. Ukuran awal (P1B-01, sebelum batching): Buahbatu 1.092 draw call → wajib turun.
- **Dunia pulau (ADR-032)**: chunk 64×64 m dimuat di sekitar pemain (cincin 3×3 + LOD jauh), dibuang LRU, pramuat ke arah gerak; interior tetap scene terpisah.
