# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dan [Semantic Versioning](https://semver.org/).
Setiap task selesai **wajib** menambah entri di `[Unreleased]` dengan ID task.

Kategori: `Ditambah` · `Diubah` · `Diperbaiki` · `Dihapus` · `Docs`

## [Unreleased]

### Ditambah
- **P0-01** Proyek Vite 8 + TypeScript strict + Phaser 4.2.1 di root repo; dependency inti (preact, zod, idb-keyval, easystarjs, supabase-js) + dev tools (vitest, eslint stack, prettier, @preact/preset-vite). Scene placeholder 640×360 `pixelArt`, Phaser dipisah ke chunk sendiri (±357 KB gzip).
- **P0-00** Akun per folder: `scripts/platform.mjs` (wrapper `gh`/`vercel`/`supabase` memakai akun proyek tanpa mengubah login global), git identitas + credential helper lokal untuk akun `buahbatu`, `.gitignore` minimal.

### Diubah
- **P0-01** ADR-016: Phaser 4 + TypeScript dipin ~6.0 (belum didukung typescript-eslint untuk TS 7). `docs/01` §1 & §3 disesuaikan.
- ADR-015: login tertutup tanpa registrasi publik, Lupa password mendeteksi email terdaftar (rate limit). `docs/32` §1–2 dan task P5-04 disesuaikan.
- **P0-00** ADR-014 diterima (pola shaflow). ADR-010 diubah: repo **public selama development**, private saat final. Docs 01/03/43/50/51 disesuaikan.

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
