# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dan [Semantic Versioning](https://semver.org/).
Setiap task selesai **wajib** menambah entri di `[Unreleased]` dengan ID task.

Kategori: `Ditambah` · `Diubah` · `Diperbaiki` · `Dihapus` · `Docs`

## [Unreleased]

### Ditambah
- **P0-12** GitHub Actions `.github/workflows/ci.yml`: job `verify` (gitleaks seluruh riwayat, lint, typecheck, unit, build, E2E) lalu job `deploy` hanya kalau hijau: Production untuk `main`, Preview untuk branch lain (`vercel build/deploy --prebuilt`). Smoke test Playwright ke URL deploy (`playwright.deploy.config.ts`, `e2e-deploy/`) dengan header bypass proteksi Vercel; rollback otomatis ke production sebelumnya kalau smoke gagal. Action dipin ke commit SHA. Baseline snapshot Linux dibuat CI sebagai artifact lalu dinilai & di-commit AI; workflow manual `snapshots.yml`. `npm run setup` kini menambah scope `workflow`, memvalidasi `VERCEL_TOKEN`, membuat secret bypass, dan memasang 4 GitHub Secrets. Production: https://buahbatu-story.vercel.app
- **P0-11** E2E Playwright (`@playwright/test` 1.64.1, Chromium): `playwright.config.ts` dengan project `desktop`, `android-landscape`, `iphone-landscape`; spec `e2e/smoke` (boot → Title tanpa error, font termuat, Command lewat hook, seed deterministik, toast), `e2e/scaling` (integer per pixel fisik, utuh di layar, overlay sejajar), `e2e/visual` (snapshot Title & toast, baseline Windows). Test hook `window.__BB__` (`src/testing/`) hanya di build `--mode test` / dev `?test=1`. `GameRuntime` (`src/core/runtime.ts`) menghidupkan GameState + dispatcher di game. Script `build:test`, `e2e`, `e2e:update`, `verify`.
- **P0-10b** `npm run setup` (`scripts/setup.mjs`), idempotent: buat `.env.local` dari template & isi otomatis tanpa menimpa nilai user, gitleaks + hook, identitas & credential git lokal, repo GitHub (dibuat public kalau belum ada) + remote + push awal, login Vercel per folder (device login dibuka di Chrome profil `LOGIN_CHROME_PROFILE`), `project add` + `link` project `buahbatu-story`, sinkron env ke Vercel Production & Preview (nilai lewat stdin). Helper `scripts/lib/browser.mjs`, `upsertEnv`, + tes.
- **P0-10a** `npm run doctor` (`scripts/doctor.mjs`, hanya membaca): cek tools, git lokal, akun GitHub + scope, login/link Vercel, `.env.local`; kebutuhan mengikuti fase TODO (⏳ belum waktunya / ❌ wajib sekarang), nilai rahasia tidak pernah dicetak. `npm run tools`: gitleaks 8.30.1 ke `.tools/` dengan verifikasi SHA-256. Hook `.githooks/pre-commit` (aktif otomatis lewat `prepare`) menolak commit berisi rahasia. Pustaka skrip murni `scripts/lib/{env,tasks,report}.mjs` + tes.
- **P0-09** `vercel.json`: deploy hanya lewat CI (`git.deploymentEnabled: false`), region `sin1`, cache immutable untuk file ber-hash `/_app/*`, cache pendek untuk `/assets/*`, header keamanan (nosniff, referrer, frame DENY, Permissions-Policy mic `self`). `.env.example` disusun ulang dengan penanda 🔒 rahasia / 🌐 publik. `.gitignore` dilengkapi (hasil tes, Supabase lokal, editor). `CREDITS.md` dirapikan + lisensi library. Tes `tests/repo-config.test.ts`: env template sinkron dengan `docs/51` §4, template tanpa nilai, `VITE_*` bukan rahasia, entri `.gitignore` wajib, aturan `vercel.json`.
- **P0-08** Overlay Preact (`src/ui/`) ditumpuk tepat di atas canvas: ukuran & skala mengikuti zoom integer (`--zoom`, `--game-w/h`), jadi UI juga tajam per pixel fisik. Style pixel (`ui/styles/pixel.css`: panel krem/kayu, border 2px, bayangan keras, aksen stroberi, `prefers-reduced-motion`). Font **Pixelify Sans** & **Press Start 2P** (OFL, `public/assets/fonts`, tercatat di `CREDITS.md`), ditunggu sebelum Title tampil (`utils/fonts.ts`, timeout 3 dtk). Store UI tanpa dependency (`ui/store.ts`, `useStore`), toast EventBus → maks. 3 bertumpuk, versi game pindah ke overlay. Helper `snapToPixel` untuk teks Phaser.
- **P0-07** Core arsitektur: `core/rng.ts` (mulberry32, state RNG di dalam GameState, `int/chance/pick/weighted`, `hashSeed`), `core/events` (EventBus bertipe, listener error diisolasi), `core/state` (GameState v1 + `createInitialState` murni + selectors), `core/commands` (CommandDispatcher atomik berbasis Immer, `patches`/`inversePatches`, `HandlerMap` wajib lengkap, Command pertama `world/setFlag`), `core/logger.ts` (level, scope, redaksi otomatis JWT/token/field rahasia). Angka awal di `config/balance.ts`. Dependency baru: `immer`.
- **P0-06** Scene `Boot` (validasi konten, pesan ramah kalau rusak) → `Preload` (loading bar dari event progress loader) → `Title` placeholder (langit bertingkat, bukit, petak kebun, judul, tagline, versi dari `package.json`). `src/content/i18n/id.json` + `t()` bertipe (key divalidasi zod), `src/config/palette.ts`, `src/utils/progress.ts`.
- **P0-05** `src/config/game.ts`: config Phaser 640×360 (`pixelArt`, `roundPixels`, arcade physics) + `installIntegerScaling` (resize, rotasi HP, pindah monitor/zoom browser). `src/utils/scale.ts`: zoom integer dihitung per pixel fisik (tajam juga di display scaling 125%/150%), fallback pecahan untuk layar < 640×360.
- **P0-04** Vitest (`vitest.config.ts`), kerangka validasi konten zod (`src/content/{schema,registry,validate,index}.ts`): ID snake_case, ID unik, setiap JSON wajib punya skema, `personal/` tidak pernah dimuat. Script `test`, `test:watch`, `validate:content`.
- **P0-03** ESLint flat config (`typescript-eslint` strictTypeChecked + stylistic) dengan aturan arsitektur: logika murni tanpa Phaser/Preact/Supabase, tanpa import silang `logic.ts`, `SERVICE_ROLE` dilarang di client. Prettier, EditorConfig, `.gitattributes` (LF), rekomendasi VS Code, script `lint`, `lint:fix`, `format`, `format:check`.
- **P0-02** Struktur folder lengkap sesuai `docs/02` §2: 28 folder `src/systems/*`, core, config, scenes, entities, input, ui, net, save, content, utils (placeholder `index.ts` + rujukan dokumen), folder aset `public/assets/*`, `maps/`, `api/`, `supabase/migrations/`, `e2e/`. `src/config/constants.ts` berisi `TILE_SIZE` & `DEPTH`. Tes `tests/structure.test.ts` menjaga struktur.
- **P0-01** Proyek Vite 8 + TypeScript strict + Phaser 4.2.1 di root repo; dependency inti (preact, zod, idb-keyval, easystarjs, supabase-js) + dev tools (vitest, eslint stack, prettier, @preact/preset-vite). Scene placeholder 640×360 `pixelArt`, Phaser dipisah ke chunk sendiri (±357 KB gzip).
- **P0-00** Akun per folder: `scripts/platform.mjs` (wrapper `gh`/`vercel`/`supabase` memakai akun proyek tanpa mengubah login global), git identitas + credential helper lokal untuk akun `buahbatu`, `.gitignore` minimal.

### Diubah
- ADR-018 (keputusan user, opsi B): di layar DPR ≥ 2 (HP/Retina), kalau integer mengisi < 80% ruang, pakai skala pecahan nearest-neighbor yang memenuhi layar. iPhone landscape 734×343 kini penuh (×2,86, sebelumnya ×2 & ±58% lebar). Desktop/laptop DPR < 2 & Android 780×360 tetap integer (snapshot tidak berubah). `docs/40` §7 diperbarui.
- **P0-11** Playwright selalu build & menjalankan server baru (`reuseExistingServer: false`): server lama yang masih hidup sempat membuat E2E menguji build basi.
- **P0-11** `docs/50` §2: status test hook, project perangkat, lokasi snapshot per OS, alasan 1 worker lokal & trace hanya saat retry (WebGL headless dirender CPU; perangkat dev 2 core / 4 GB).
- **P0-10b** `.gitignore` memakai pola `.env*` & `.vercel` persis seperti yang dicari `vercel link` (sebelumnya CLI menambahkan baris sendiri yang membuat `!.env.example` tidak berlaku); urutannya dijaga tes. `.env.example` + `LOGIN_CHROME_PROFILE` (opsional). `docs/51` §5: status implementasi setup.
- Tagline layar judul diganti jadi bahasa Inggris atas permintaan user: "A game made with love for Michelle Melinda" (pengecualian dari aturan teks UI berbahasa Indonesia; tetap lewat `i18n/id.json`).
- **P0-10a** Task P0-10 dipecah jadi P0-10a (doctor + gitleaks) & P0-10b (setup) karena >400 baris (AGENTS §6); total task 184. `scripts/platform.mjs` direfaktor (helper non-fatal dipakai ulang doctor/setup, parser env di `scripts/lib/env.mjs`). `tsconfig`: `allowJs` (tanpa `checkJs`) supaya tes bisa memakai tipe JSDoc skrip. `docs/51` §5 & §7 diperbarui.
- **P0-09** Output Vite pindah ke `/_app/` (`build.assetsDir`) supaya file ber-hash tidak bercampur dengan `public/assets`. `docs/01` §4: `TURN_API_KEY` diganti `METERED_APP_NAME`/`METERED_API_KEY` agar sama dengan `docs/51` & `.env.example`. Cron keep-alive sengaja belum di `vercel.json` (fungsinya baru ada di P5-08).
- **P0-07** ADR-017 (Immer untuk Command). `docs/02` §4 contoh Handler disesuaikan dengan implementasi (draft + `succeed`/`reject`).
- **P0-06** File i18n `id.json` + helper `t()` dibuat lebih awal dari jadwal P0-08 (Title sudah butuh teks dan teks UI tidak boleh di-hardcode). P0-08 tetap mengerjakan font, overlay Preact, dan style.
- **P0-05** `docs/40` §7: aturan integer scaling per pixel fisik. Canvas di-center oleh CSS (autoCenter Phaser membuat offset dobel).
- **P0-04** `validate:content` memakai Vitest (bukan `tsx`) supaya tidak menambah dependency dan memakai loader `import.meta.glob` yang sama dengan game. `docs/01` §3 disesuaikan.
- **P0-01** ADR-016: Phaser 4 + TypeScript dipin ~6.0 (belum didukung typescript-eslint untuk TS 7). `docs/01` §1 & §3 disesuaikan.
- ADR-015: login tertutup tanpa registrasi publik, Lupa password mendeteksi email terdaftar (rate limit). `docs/32` §1–2 dan task P5-04 disesuaikan.
- **P0-00** ADR-014 diterima (pola shaflow). ADR-010 diubah: repo **public selama development**, private saat final. Docs 01/03/43/50/51 disesuaikan.

### Diperbaiki
- **P0-12** Validasi `VERCEL_TOKEN` di setup sempat meloloskan token yang dibatasi per project, padahal Vercel CLI butuh akses akun & team (deploy pertama gagal di `vercel pull`). Kini setup menguji akun, team & project seperti CLI.
- **P0-10b** `parseEnv` salah membaca `KEY=  # catatan` sebagai bernilai (komentar setelah nilai kosong). Setup sempat menulis ulang credential helper di setiap run (output git di-trim sehingga baris reset hilang) → sekarang idempotent. Setup sempat membuka tautan telemetri Vercel alih-alih halaman login → kini hanya URL login/device yang dibuka.

### Docs
- Dokumen desain awal (GDD modular), `AGENTS.md`, `TODO.md`, `PROMPT.md`.
- Judul resmi **Buahbatu Story**. Area spesial `buahbatu` (rumah keluarga Michelle = start Pemain B), NPC orang tua Michelle + meter Restu, event "Main ke Rumah" & "Minta Restu". Task baru P12-03.
- Otomasi penuh: akun per folder (meniru pola proyek kelola/prins/shaflow/kis), `npm run setup/doctor/verify/ship`, CI + deploy otomatis, tes E2E/multiplayer/visual dijalankan AI. Dokumen baru `docs/51-otomasi-akun-env.md`, `.env.example`. Task baru P0-00, P0-10–P0-13, P5-10 (total 183).

<!--
Contoh entri:
### Ditambah
- **P3-06** Tanaman tumbuh per hari, layu jika tidak disiram 3 hari, sistem regrow & kualitas.

### Diperbaiki
- **P3-06** Tanaman layu tidak hilang saat ganti musim.
-->
