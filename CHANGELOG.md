# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dan [Semantic Versioning](https://semver.org/).
Setiap task selesai **wajib** menambah entri di `[Unreleased]` dengan ID task.

Kategori: `Ditambah` · `Diubah` · `Diperbaiki` · `Dihapus` · `Docs`

## [Unreleased]

### Ditambah
- **P0-00** Akun per folder: `scripts/platform.mjs` (wrapper `gh`/`vercel`/`supabase` memakai akun proyek tanpa mengubah login global), git identitas + credential helper lokal untuk akun `buahbatu`, `.gitignore` minimal.

### Diubah
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
