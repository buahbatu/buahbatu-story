# ✅ TODO — Roadmap Buahbatu Story

> **Aturan wajib** (detail di `AGENTS.md` §3–4):
> 1. Kerjakan **berurutan**, **1 task** sekaligus.
> 2. Sebelum mulai: ubah `[ ]` → `[~]` + `🟡 YYYY-MM-DD`.
> 3. Setelah selesai & terverifikasi (lint, typecheck, test, build): ubah ke `[x]` + `✅ YYYY-MM-DD · catatan singkat`.
> 4. **Update tabel Progres** di bawah + tambah entri di `CHANGELOG.md`.
> 5. Blocked → `[!]` + alasan. Dibatalkan → `[-]` + alasan.
> 6. Task terlalu besar → pecah jadi `Pn-xxa`, `Pn-xxb`.
> 7. Ide baru → taruh di **💡 Backlog Ide**, jangan langsung dikerjakan.
> 8. **Kriteria selesai fase dibuktikan dengan tes otomatis yang dijalankan AI** (`e2e/<fase>.spec.ts`), bukan dicek manual oleh user.
> 9. **Jangan minta user melakukan langkah manual** yang bisa dikerjakan lewat CLI/script. User hanya mengisi token di `.env.local` (`docs/51`).

**Legenda**: `[ ]` belum · `[~]` dikerjakan · `[x]` selesai · `[!]` blocked · `[-]` batal
**Ref** = nomor dokumen di `docs/` (misal `12` = `docs/12-pertanian-peternakan.md`)

---

## 📊 Progres per Fase

| Fase | Nama | Versi | Selesai | Total | Status |
|---|---|---|---|---|---|
| P0 | Setup Proyek & Otomasi | v0.1 | 15 | 15 | ✅ |
| P1 | Fondasi Dunia 2.5D & Gerak | v0.1 | 20 | 23 | 🟡 |
| P2 | Waktu, Cuaca & Save Lokal | v0.1 | 0 | 9 | ⬜ |
| P3 | Pertanian, Ternak & Inventory | v0.2 | 0 | 11 | ⬜ |
| P4 | Ekonomi, Toko & Karier Dasar | v0.2 | 0 | 8 | ⬜ |
| P5 | Backend & Cloud Save | v0.3 | 0 | 10 | ⬜ |
| P6 | Multiplayer Berdua | v0.3 | 0 | 12 | ⬜ |
| P7 | Karakter & Outfit | v0.4 | 0 | 9 | ⬜ |
| P8 | HP, NPC, Dialog & Quest | v0.5 | 0 | 14 | ⬜ |
| P9 | Kebutuhan, Mood & Hubungan | v0.6 | 0 | 12 | ⬜ |
| P10 | Aktivitas | v0.7 | 0 | 11 | ⬜ |
| P11 | Voice | v0.8 | 0 | 8 | ⬜ |
| P12 | Kendaraan & Peta Bandung | v0.9 | 0 | 10 | ⬜ |
| P13 | Properti, Kredit & Pernikahan | v0.10 | 0 | 13 | ⬜ |
| P14 | Keluarga & Anak | v0.11 | 0 | 9 | ⬜ |
| P15 | Festival, Event & Endgame | v0.12 | 0 | 12 | ⬜ |
| P16 | Polish & Rilis v1.0 | v1.0 | 0 | 10 | ⬜ |
| **Total** | | | **35** | **196** | |

Status: ⬜ belum · 🟡 berjalan · ✅ selesai

## 🧠 Mode Effort (permintaan user, 2026-11-24)
AI menulis mode yang disarankan di baris **⏭️ Berikutnya** setiap laporan, dan mengingatkan user **sebelum** task yang modenya berbeda dari task sebelumnya.

- **🔴 High**: sinkron multiplayer, keamanan/login/rahasia, save & migrasi, inti engine/render, logika uang & kredit, debug CI merah yang membandel.
- **🟢 Medium**: isi konten (item, dialog, NPC, quest), peta prototipe, UI sederhana, docs.

| Fase | Default | Pengecualian 🔴 High |
|---|---|---|
| P1 | 🟢 | P1-04 karakter 3D, P1-04b tampilan PS1, P1-04c pemuat aset 3D, P1-04e bangunan 3D, P1-05 collision, P1-06 kamera |
| P2 | 🟢 | P2-04 Day Tick, P2-07 skema save & migrasi, P2-08 save/load |
| P3 | 🟢 | — |
| P4 | 🟢 | P4-06 karier generik, P4-08 simulasi ekonomi |
| P5 | 🔴 | semua (Supabase, RLS, login, cloud save) |
| P6 | 🔴 | semua (multiplayer) |
| P7 | 🟢 | P7-01 layered sprite, P7-08 sinkron outfit realtime |
| P8 | 🟢 | P8-04 pathfinding & jadwal, P8-05 dialog berkondisi, P8-07 quest engine, P8-09 cutscene sinkron |
| P9 | 🟢 | P9-04 meter hubungan, P9-07 gate event berdua, P9-09 pasangan offline |
| P10 | 🟢 | P10-04 mode foto + Storage, P10-06 gua, P10-10 minigame versus pasangan |
| P11 | 🔴 | kecuali P11-01 & P11-02 (🟢) |
| P12 | 🟢 | P12-01–03 art & map final, P12-05 sistem kendaraan, P12-07 bonceng sinkron |
| P13 | 🟢 | P13-01 kredit, P13-04 dekor realtime, P13-11 aset bersama |
| P14 | 🟢 | — |
| P15 | 🟢 | P15-02 event tanggal asli (rahasia dari yang berulang tahun) |
| P16 | 🟢 | P16-05 optimasi performa, P16-08 E2E & perf di CI, P16-10 rilis |

**Sedang dikerjakan:** —
**Task berikutnya:** P1-10b

---

## P0 · Setup Proyek & Otomasi
- [x] **P0-00** Deteksi pola akun per folder dari proyek **kelola, prins, shaflow, kis** (tanpa menampilkan rahasia) → ringkas ke user → konfirmasi akun → ADR · Ref: 51 · ✅ 2026-11-23 · pola shaflow (wrapper `scripts/platform.mjs`), akun `buahbatu`, git config lokal, repo public selama dev (ADR-010, ADR-014)
- [x] **P0-01** Init Vite + TypeScript, install Phaser, Preact, zod, idb-keyval, easystarjs, supabase-js · Ref: 01 · ✅ 2026-11-23 · Phaser 4.2.1, Vite 8, TS ~6.0 dipin (ADR-016); typecheck+build hijau, lint/test menyusul P0-03/P0-04
- [x] **P0-02** Buat struktur folder lengkap sesuai arsitektur (folder kosong + `index.ts` placeholder) · Ref: 02 · ✅ 2026-11-23 · 28 sistem + 41 index.ts, `constants.ts` (TILE_SIZE, DEPTH), tes struktur 80 lolos
- [x] **P0-03** tsconfig strict, ESLint (typescript-eslint), Prettier, EditorConfig, script npm · Ref: 01, 03 · ✅ 2026-11-23 · ESLint strictTypeChecked + aturan arsitektur (uji balik 6/6 tertangkap), Prettier, LF
- [x] **P0-04** Vitest + contoh test + script `validate:content` (kerangka) · Ref: 03, 50 · ✅ 2026-11-23 · validator konten zod (ID snake_case, ID unik, file wajib terdaftar), 98 tes lolos; validate:content lewat Vitest (tanpa tsx)
- [x] **P0-05** Konfigurasi Phaser: `pixelArt`, resolusi 640×360, integer scaling, resize handler · Ref: 02, 40 · ✅ 2026-11-23 · zoom integer per pixel FISIK (tajam di DPR 1/1.25/1.5/3, diuji per piksel), resize/rotasi/DPR handler, arcade physics
- [x] **P0-06** Scene Boot → Preload (loading bar) → Title (placeholder) · Ref: 02 · ✅ 2026-11-23 · Boot (validasi konten) → Preload (loading bar) → Title (judul, tagline, versi); i18n id.json + t() ditarik dari P0-08 karena Title butuh teks
- [x] **P0-07** Core: EventBus bertipe, GameState awal, CommandDispatcher, RNG seeded, logger + test · Ref: 02 · ✅ 2026-11-23 · RNG mulberry32 di dalam state, EventBus bertipe, GameState+selectors, dispatcher atomik Immer (patch+rollback), logger dengan redaksi rahasia; 188 tes
- [x] **P0-08** Root Preact overlay di atas canvas + style pixel dasar + font + file i18n `id.json` · Ref: 40 · ✅ 2026-11-23 · overlay Preact sejajar canvas (UI ikut zoom pixel fisik), font Pixelify Sans + Press Start 2P (OFL), panel pixel, toast maks. 3, store UI; diverifikasi screenshot
- [x] **P0-09** Lengkapi `.env.example`, `.gitignore` (personal, `.env.local`, `.vercel/`), `CREDITS.md`, `vercel.json` · Ref: 51, 42, 43 · ✅ 2026-11-23 · env template bertanda rahasia/publik + dijaga tes sinkron docs/51, .gitignore diuji git check-ignore, vercel.json (CI-only, cache /_app immutable, header keamanan)
- [x] **P0-10a** Script `npm run doctor` (cek tools, akun, env per fase, tanpa menampilkan rahasia) + pre-commit `gitleaks` · Ref: 51 · ✅ 2026-11-23 · doctor per fase (11 ok/0 gagal), gitleaks 8.30.1 di .tools (checksum diverifikasi), hook pre-commit menolak token palsu, riwayat 11 commit bersih
- [x] **P0-10b** Script `npm run setup` (git identitas, GitHub repo (public selama dev, ADR-010), Vercel link + env) idempotent · Ref: 51 · ✅ 2026-11-23 · setup 7 ok/0 gagal & idempotent (2x run tanpa perubahan); project Vercel buahbatu-story ter-link (akun buahbatu); doctor 14 ok
- [x] **P0-11** Playwright + test hook `window.__BB__` + smoke E2E + snapshot visual + emulasi HP landscape + `npm run verify` · Ref: 50 · ✅ 2026-11-23 · Playwright 1.64.1, hook __BB__ (tidak ada di build prod), 25 E2E di desktop+Android+iPhone landscape, 6 baseline snapshot dinilai, npm run verify hijau
- [x] **P0-12** GitHub Actions CI (`verify`) + deploy Preview/Production otomatis + smoke test URL + rollback · Ref: 51, 50 · ✅ 2026-11-23 · CI verify+deploy hijau; production https://buahbatu-story.vercel.app; preview terlindungi + smoke via bypass; baseline Linux; rollback dipasang tapi belum pernah terpicu
- [x] **P0-13** Jalankan `npm run setup` end-to-end → push pertama → title screen online di Vercel (dibuktikan smoke E2E ke URL production) · Ref: 51 · ✅ 2026-11-23 · setup e2e 12 ok idempotent; 20 commit & run CI oleh akun buahbatu (global tetap satuteknologi-id); CI hijau 0 warning; smoke production 4/4 + screenshot dinilai

**Kriteria selesai P0:** `npm run verify` hijau; push ke `main` otomatis memakai akun proyek ini, lolos CI, dan ter-deploy; smoke E2E ke URL production lolos. User hanya mengisi token di `.env.local`.

---

## P1 · Fondasi Dunia 2.5D & Gerak (ADR-022)
- [x] **P1-00** Migrasi engine ke Three.js: renderer resolusi rendah ala PS1 (render target dari `computeView`, diperbesar integer tanpa blur), scene manager (Boot → Preload → Title), latar judul 3D low-poly, hapus Phaser, test hook & E2E tetap hijau · Ref: 02, 40 · ✅ 2026-11-24 · Phaser → Three.js 0.187: render resolusi rendah ala PS1 + upscale integer, scene manager, layar judul 3D low-poly beranimasi (kamera bergerak), loading/error ke overlay; bundle 357→132 KB gzip
- [x] **P1-01a** Format peta: konvensi layer 3D (Ground, Height, Farmable, Collision, Objects + prop), skema zod, logika murni pembaca peta + test, atlas tekstur tanah placeholder 16px, peta uji `sandbox` · Ref: 10, 42 · ✅ 2026-11-24 · skema zod + parseArea, semua peta divalidasi tes, atlas 16px & sandbox 40×30
- [x] **P1-01b** Pembangun dunia 3D: lantai bertekstur, tebing ketinggian, prop low-poly, `WorldScene`, test hook masuk area, E2E + snapshot · Ref: 10, 02 · ✅ 2026-11-24 · tanah atlas + tebing + prop dari peta, WorldScene, enterArea, ?area=, snapshot dinilai
- [x] **P1-02a** Peta prototipe luar ruang `lembang` & `buahbatu` (kecil) + kit bangunan bervariasi & prop jalanan, daftar area (`AREA_IDS`), generator peta di `scripts/maps/` · Ref: 10 · ✅ 2026-11-24 · kit bangunan + 14 prop, lembang & buahbatu, papan terbaca, AREA_IDS, npm run maps
- [x] **P1-02b** Interior `kos_a` & rumah Michelle: mode interior (latar gelap, tanpa tanah lanjutan), dinding ruangan, perabot · Ref: 10 · ✅ 2026-11-24 · mode interior, 17 perabot, kos_a & rumah_michelle, keramik/karpet
- [x] **P1-03** Abstraksi input → Action (keyboard dulu) · Ref: 40 · ✅ 2026-11-24 · InputState + rebind + zod, keyboard (code), Tab/Spasi milik game, lepas saat blur
- [x] **P1-04** Entity Player: karakter **3D chibi** (ADR-024/025: Kenney Mini CC0 diwarnai ulang, animasi idle/walk/sprint asli), gerak 8 arah, jalan/lari · Ref: 15 · ✅ 2026-11-24 · karakter 3D Kenney Mini CC0 diwarnai ulang (A & Michelle), animasi asli, kamera 40°
- [x] **P1-04b** Tampilan dunia ala PS1 (ADR-024): air bercekungan + permukaan transparan beriak, bayangan matahari (shadow map), tanah alami (variasi warna & rotasi tekstur per petak, rumput 3D), poles papan nama · Ref: 42, 10 · ✅ 2026-11-24 · bayangan matahari, air cekung transparan beriak, rumput 3D, tekstur diputar acak
- [x] **P1-04c** Pemuat aset 3D CC0 (ADR-025) + alam & jalan: pohon, pinus, semak, batu, pagar, pot, lampu jalan, tiang listrik (Kenney Nature/City Roads, diwarnai alami) · Ref: 42, 10 · ✅ 2026-11-24 · pohon/pinus/semak/batu/pagar/pot/lampu jalan Kenney CC0 bertekstur pixel, tiang PLN tetap custom
- [x] **P1-04d** Furnitur interior ke Kenney Furniture Kit (CC0) · Ref: 42, 10 · ✅ 2026-11-24 · 13 perabot dari tabel data FURNITURE, tapak tetap, kayu bertekstur papan
- [x] **P1-04e** Bangunan: dibandingkan dengan Kenney City Kit, **user memilih tetap rakitan kode** (lebih Bandung & PS1) lalu dipoles detail khas rumah Indonesia (roster, lisplang, talang, bubungan, kanopi pintu, meteran PLN, teralis, AC) · Ref: 42, 10 · ✅ 2026-11-24 · Kenney City Kit dicoba, user pilih rakitan kode; +roster, lisplang, talang, bubungan, kanopi pintu, meteran, teralis, AC
- [x] **P1-05** Collision berbasis grid & objek + pemain tetap terlihat saat tertutup pohon/bangunan (siluet/memudar) · Ref: 02, 10 · ✅ 2026-11-24 · tabrakan kotak/air/tebing anti-tembus, tangga batu, prop penutup memudar transparan
- [x] **P1-05b** Nyebur ke kolam (permintaan user): air dangkal bisa dimasuki (gerak melambat, karakter terendam sebagian), efek cipratan saat masuk, karakter tampak basah, tetesan air jatuh dari pakaian setelah naik ke darat (beberapa detik); air dalam tetap tidak bisa dimasuki · Ref: 10, 40 · ✅ 2026-11-24 · tepi kolam dangkal (×0,5), cipratan + riak, basah & mengering, tetesan; tengah kolam tetap dalam
- [x] **P1-05c** Lompat (permintaan user 2026-11-24): tombol lompat, animasi & lengkung lompatan, bisa melompati rintangan rendah/naik tepian rendah sesuai aturan tabrakan; tombol diputuskan bersama user (Spasi kini dipakai alat) · Ref: 40, 15 · ✅ 2026-11-24 · tombol B (Dekor → G), lengkung 0,55 dtk/0,6, animasi jump Kenney, naik tepian rendah saat melayang
- [x] **P1-06** Kamera 2.5D miring ala Back to Nature: follow pemain, batas peta, **zoom in/out**, **putar & geser kamera** (pan/arahkan sudut pandang, permintaan user 2026-11-24; kamera kembali mengikuti pemain) (diputuskan user: scroll/cubit/`+` `-` = zoom, Q/R putar, klik kanan seret = geser) · Ref: 40 · ✅ 2026-11-24 · follow halus, batas peta, zoom scroll/+−/cubit, putar Q/R, geser klik kanan, WASD relatif kamera
- [x] **P1-07** Sistem interaksi: deteksi objek terdekat + prompt "E ..." · Ref: 10, 40 · ✅ 2026-11-25 · objek terdekat+di depan, prompt [E] melayang (pindah ke atas kepala bila objek di depan), log interaksi; tombol: lompat Spasi, alat C
- [x] **P1-08** Kotak dialog Preact (typewriter, pilihan, potret placeholder, log) · Ref: 40, 18 · ✅ 2026-11-25 · bingkai ornamen, teks mengetik, pilihan (keyboard/angka/klik), riwayat L, papan Kebun Warga bisa dibaca
- [x] **P1-09** Transisi area (pintu & tepi peta) + fade + spawn point · Ref: 10 · ✅ 2026-11-25 · pintu (E) & tepi (otomatis) + fade, area belum ada → pesan ramah, index.json peta
- [x] **P1-10** Kontrol sentuh: joystick virtual + tombol aksi (deteksi portrait + layar penuh HP sudah dikerjakan lebih awal, ADR-020) · Ref: 40 · ✅ 2026-11-25 · joystick melayang analog (penuh = lari), tombol A/B/Lompat, prompt "A", sembunyi saat dialog
- [ ] **P1-10b** Redesain kontrol sentuh (masukan user 2026-11-25: desain jelek): gaya **modern transparan** (lingkaran gelap tembus pandang, garis putih tipis, ikon), joystick **tetap di tempat** & lebih besar, tidak mepet tepi (safe area), tombol ikon: Aksi (besar), Lompat, Lari (tahan), Alat; **pindah otomatis**: HP/tablet/iPad tampil, desktop tidak, laptop sentuh/iPad+keyboard ikut input terakhir · Ref: 40
- [x] **P1-11** Mode debug `?debug=1` (FPS, collision, grid) · Ref: 50 · ✅ 2026-11-25 · panel FPS/draw call/posisi + overlay Grid & Kolisi (bisa dimatikan), terkunci di Production
- [ ] **P1-12** Kontur tanah **campuran** (keputusan user 2026-11-25): lereng landai halus untuk bukit/lembah + undakan/tebing bertingkat; kolisi & tinggi pemain mengikuti lereng, petak ladang tetap datar · Ref: 10
- [ ] **P1-13** Air terjun & sungai antar-ketinggian: air jatuh dari tebing ke kolam, percikan & riak, (suara gemericik menyusul sistem audio) · Ref: 10, 42

**Kriteria selesai P1:** bisa jalan di Lembang, masuk/keluar kos, ngobrol dengan papan (dialog), main di HP & laptop.

---

## P2 · Waktu, Cuaca & Save Lokal
- [ ] **P2-01** Logic jam & kalender (menit → hari → musim → tahun) + test · Ref: 11
- [ ] **P2-02** HUD jam/tanggal/musim (Preact) · Ref: 11, 40
- [ ] **P2-03** Siklus siang/malam (cahaya matahari & ambient 3D + lampu) · Ref: 11
- [ ] **P2-04** Tidur, Day Tick pipeline (kerangka berurutan), pingsan 02:00, layar ringkasan hari · Ref: 11
- [ ] **P2-05** Generator cuaca seeded per musim + test · Ref: 11
- [ ] **P2-06** Efek visual cuaca: hujan, kabut, salju, angin (partikel + pooling) · Ref: 11
- [ ] **P2-07** Skema save zod + `schemaVersion` + kerangka migrasi + test · Ref: 32
- [ ] **P2-08** Save/load IndexedDB + autosave saat tidur + indikator "Tersimpan ✓" · Ref: 32, 40
- [ ] **P2-09** Export/import save `.json` di menu Pengaturan (sederhana) · Ref: 32

**Kriteria selesai P2:** hari berganti, cuaca berubah, refresh browser → progres tetap ada. 🎉 **Rilis v0.1**

---

## P3 · Pertanian, Ternak & Inventory
- [ ] **P3-01** Skema & data `items.json` + loader zod + validasi ID unik · Ref: 12, 02
- [ ] **P3-02** Inventory (tas + hotbar 10 slot) logic + test · Ref: 12
- [ ] **P3-03** UI inventory & hotbar (drag-drop, tooltip) · Ref: 40
- [ ] **P3-04** Alat (cangkul, penyiram, sabit, kapak, beliung) + sistem energi · Ref: 12, 16
- [ ] **P3-05** Status tanah (gembur, tersiram, reset harian) via Command · Ref: 12
- [ ] **P3-06** Tanaman: tanam, tumbuh per hari, layu, regrow, kualitas + test · Ref: 12
- [ ] **P3-07** Data `crops.json` minimal 16 tanaman + sprite tahap tumbuh · Ref: 12
- [ ] **P3-08** Kotak Kirim + penjualan saat Day Tick + ringkasan · Ref: 12, 13
- [ ] **P3-09** Pupuk & crafting dasar (meja kerja, penyiram otomatis) · Ref: 12, 20
- [ ] **P3-10** Ternak: kandang ayam & sapi, makan, elus, hati, produk + test · Ref: 12
- [ ] **P3-11** Peliharaan (kucing/anjing; termasuk kucing Michelle **Luna** putih & **Ngkok** putih-abu, `docs/43`) + mesin olahan dasar (selai, yogurt) · Ref: 12

**Kriteria selesai P3:** loop tanam → siram → panen → kirim → dapat uang berjalan selama 1 musim penuh.

---

## P4 · Ekonomi, Toko & Karier Dasar
- [ ] **P4-01** Dompet + log transaksi + test · Ref: 13
- [ ] **P4-02** Sistem toko generik data-driven (jam buka, stok musiman, beli/jual) · Ref: 13
- [ ] **P4-03** UI toko (beli/jual, jumlah, konfirmasi) · Ref: 13, 40
- [ ] **P4-04** Toko bibit Kang Asep + warung Bu Euis · Ref: 13
- [ ] **P4-05** Harga dinamis (musim, saturasi, permintaan harian) + test · Ref: 13
- [ ] **P4-06** Sistem karier generik (level, shift, performa, promosi, time-skip) + test · Ref: 13
- [ ] **P4-07** Karier Kuliner level 1–3 + minigame Racik Kopi · Ref: 13, 20
- [ ] **P4-08** Script `simulate-economy.ts` + balancing awal · Ref: 13, 50

**Kriteria selesai P4:** bisa hidup dari bertani **atau** kerja di kafe; kurva uang mendekati target. 🎉 **Rilis v0.2**

---

## P5 · Backend & Cloud Save
- [ ] **P5-01** Setup Supabase otomatis lewat `npm run setup` (buat project, ambil keys → `.env.local`, `supabase link`, `db push` migrasi `001_init.sql`, matikan signup publik) · Ref: 32, 51
- [ ] **P5-02** RLS `002_rls.sql` + uji akses (user lain tidak bisa baca) · Ref: 32
- [ ] **P5-03** Fungsi `create_household` & `join_household(code)` (maks. 2 anggota) · Ref: 32
- [ ] **P5-04** UI login (tanpa daftar) + Lupa password dengan cek email terdaftar (`api/password-reset.ts`, rate limit) + buat/gabung household di Title (ADR-015) · Ref: 32, 40
- [ ] **P5-05** Cloud save world & player + `save_world` optimistic version · Ref: 32
- [ ] **P5-06** Sinkron lokal ↔ cloud saat login + resolusi konflik · Ref: 32
- [ ] **P5-07** Snapshot harian + restore dari Pengaturan · Ref: 32
- [ ] **P5-08** Vercel Cron keep-alive (`api/keepalive.ts`) + `CRON_SECRET` di-generate & disinkron ke Vercel otomatis · Ref: 32, 51
- [ ] **P5-09** Bucket Storage privat `media` + policy (dibuat lewat script) · Ref: 32
- [ ] **P5-10** Akun & household tes A/B dibuat otomatis + fixture login Playwright + pembersihan data tes · Ref: 50, 51

**Kriteria selesai P5:** login di device lain → progres sama; project tidak ter-pause.

---

## P6 · Multiplayer Berdua
- [ ] **P6-01** Channel privat `household:{id}` + Realtime Authorization · Ref: 30, 32
- [ ] **P6-02** Presence + notifikasi "💗 {partner} online" + status · Ref: 30
- [ ] **P6-03** Broadcast posisi 10 Hz + RemotePlayer + interpolasi · Ref: 30
- [ ] **P6-04** Pemilihan host deterministik + handover · Ref: 30
- [ ] **P6-05** Command lewat jaringan (cmd → host → ack/patch) + prediksi & rollback · Ref: 30, 02
- [ ] **P6-06** Sinkron jam & cuaca dari host (`world:tick`) · Ref: 30, 11
- [ ] **P6-07** Sinkron tanah, tanaman, ternak, objek dunia (`state:patch`) · Ref: 30
- [ ] **P6-08** Ganti hari hanya saat keduanya tidur + layar menunggu · Ref: 11
- [ ] **P6-09** Emote + chat bubble + app Chat sederhana (simpan ke DB) · Ref: 30, 40
- [ ] **P6-10** Reconnect, antrean Command, overlay koneksi putus · Ref: 30
- [ ] **P6-11** Indikator arah pasangan di luar layar · Ref: 30
- [ ] **P6-12** E2E multiplayer otomatis (2 browser context, semua skenario `50` §4) + masuk CI · Ref: 30, 50

**Kriteria selesai P6:** kalian bisa bertani bareng di dunia yang sama dari dua device. 🎉 **Rilis v0.3: BISA MAIN BERDUA**

---

## P7 · Karakter & Outfit
> 📣 **Sebelum P7-02 dimulai, kabari user** (permintaan user, 2026-11-24) & minta data karakter **Michelle** dan pemain A: foto wajah jelas (depan, terang), gaya rambut/hijab, kacamata, warna kulit, warna & outfit favorit/khas, outfit momen penting, tanggal lahir, nama panggilan & panggilan sayang. Kuesioner lengkap tentang kalian (kenangan, tempat, lagu, inside joke, dll.) menyusul di P8-11 (`docs/43` §3).

- [ ] **P7-01** Sistem layered sprite chibi (bake layer ke satu tekstur untuk billboard) · Ref: 15
- [ ] **P7-02** Layer karakter chibi (body, rambut, hijab, baju dasar) + `CREDITS.md` · Ref: 15, 42
- [ ] **P7-03** Character Creator scene (kulit, wajah, rambut, hijab, warna, trait, ultah) · Ref: 15, 16
- [ ] **P7-04** Potret dialog pemain A & B (8 ekspresi) dari foto · Ref: 15, 43
- [ ] **P7-05** Slot outfit + `outfits.json` (≥ 40 item awal) + validasi · Ref: 15
- [ ] **P7-06** Lemari + preset outfit · Ref: 15
- [ ] **P7-07** Toko baju Cihampelas + ruang ganti (preview 4 arah) · Ref: 15
- [ ] **P7-08** Hadiahkan baju ke pasangan + sinkron outfit realtime · Ref: 15, 30
- [ ] **P7-09** Efek ringan outfit (warmth, baju kerja) · Ref: 15

**Kriteria selesai P7:** karakter mirip kalian, bisa beli & ganti baju, pasangan melihat perubahannya. 🎉 **Rilis v0.4**

---

## P8 · HP, NPC, Dialog & Quest
> 📣 **Sebelum P8-03 dimulai, kabari user** (permintaan user, 2026-11-24) & minta data NPC dari keluarga/teman asli, mulai dari **Eldyi** (sepupu Michelle) serta Mamah & Papah Michelle: sifat & cara bicara, panggilan ke Michelle & pasangannya, kegiatan/pekerjaan sehari-hari, tempat tinggal, ulang tahun, hadiah yang disukai & tidak disukai, ciri penampilan untuk sprite, cerita/kenangan bareng. Data asli masuk `src/content/personal/` (tidak di-commit, `docs/43`).

- [ ] **P8-01** Kerangka HP (app launcher, navigasi, wallpaper) · Ref: 40
- [ ] **P8-02** App Quest, Kalender, Cuaca, Peta (dasar) · Ref: 40
- [ ] **P8-03** Data NPC + spawn + potret · Ref: 18
- [ ] **P8-04** Pathfinding EasyStar + jadwal harian & override · Ref: 18
- [ ] **P8-05** Dialog berkondisi (kondisi, variabel, prioritas, cooldown) + test · Ref: 18
- [ ] **P8-06** Pertemanan NPC + hadiah (loved..hated) + ultah NPC · Ref: 18
- [ ] **P8-07** Quest engine (objectives via event, rewards, state machine) + test · Ref: 19
- [ ] **P8-08** Quest harian + papan warga Alun-alun · Ref: 19
- [ ] **P8-09** Cutscene engine (script JSON, sinkron host) · Ref: 19
- [ ] **P8-10** 10 NPC pertama dengan jadwal & dialog (termasuk Mamah & Papah Michelle) · Ref: 18
- [ ] **P8-11** Isi kuesioner personal + `personal/` + fallback `personal.example` · Ref: 43
- [ ] **P8-12** Bab 1 "Pendatang Baru" · Ref: 19
- [ ] **P8-13** Bab 2 "Kebetulan yang Disengaja" (cutscene ketemu, co-op) · Ref: 19, 16
- [ ] **P8-14** Bab 3 "Ngopi di Braga" · Ref: 19

**Kriteria selesai P8:** kota terasa hidup, ada cerita yang bisa diikuti sampai Bab 3. 🎉 **Rilis v0.5**

---

## P9 · Kebutuhan, Mood & Hubungan
- [ ] **P9-01** Needs (energi, lapar, sosial, hiburan) + HUD + test · Ref: 16
- [ ] **P9-02** Moodlet & perhitungan mood + test · Ref: 16
- [ ] **P9-03** Trait & aspirasi (data + efek) · Ref: 16
- [ ] **P9-04** Meter Pertemanan & Romansa antar pemain + test · Ref: 16
- [ ] **P9-05** Menu interaksi radial + model Ajak → Terima/Tolak · Ref: 16, 30
- [ ] **P9-06** Animasi interaksi berdua (peluk, gandeng, dansa, foto) · Ref: 16, 15
- [ ] **P9-07** Tahap hubungan + gate event (wajib berdua online) + **durasi minimal tiap tahap, nembak/lamaran oleh siapa saja, bisa diterima/ditunda/ditolak + jeda coba lagi, wajib bawa bunga** (`docs/16`, permintaan user) · Ref: 16
- [ ] **P9-08** Aktivitas kencan (ngopi, city light Dago, kuliner malam) · Ref: 16
- [ ] **P9-09** Interaksi saat pasangan offline (karakter tidur, kejutan, Bonus Kangen) · Ref: 16
- [ ] **P9-10** Quest romantis (≥ 10) · Ref: 19
- [ ] **P9-11** Bab 4 & 5 (PDKT → jadian) + event "Main ke Rumah" Buahbatu + meter Restu + kenangan personal · Ref: 19, 10, 18, 43
- [ ] **P9-12** Album Kenangan (foto, teks, audio) di app Album · Ref: 43, 31

**Kriteria selesai P9:** kalian bisa jadian di game dengan momen yang personal. 🎉 **Rilis v0.6**

---

## P10 · Aktivitas
- [ ] **P10-01** Mancing: minigame + `fish.json` (≥ 30) + test seleksi ikan · Ref: 20
- [ ] **P10-02** Masak: dapur, resep Sunda (≥ 20 awal), buff, masak berdua · Ref: 20
- [ ] **P10-03** Crafting lengkap (kategori, resep terbuka via skill) · Ref: 20
- [ ] **P10-04** Mode foto (pose, filter, bingkai) + simpan album + sinkron Storage · Ref: 20
- [ ] **P10-05** Ensiklopedia koleksi · Ref: 21
- [ ] **P10-06** Gua Tangkuban lantai 1–10 (template, bijih, puzzle, lentera) · Ref: 20
- [ ] **P10-07** Museum Geologi (donasi + hadiah) · Ref: 20
- [ ] **P10-08** Upgrade alat di pandai besi · Ref: 12
- [ ] **P10-09** Minigame Balok Braga + papan skor rumah · Ref: 20
- [ ] **P10-10** Minigame Catur/Congklak & Tebak Gambar (versus pasangan) · Ref: 20
- [ ] **P10-11** Serangga & forage · Ref: 20

**Kriteria selesai P10:** banyak hal untuk dilakukan selain bertani. 🎉 **Rilis v0.7**

---

## P11 · Voice
- [ ] **P11-01** Blip suara karakter (WebAudio, profil per karakter) · Ref: 31
- [ ] **P11-02** Pemutar suara kenangan (+ subtitle opsional) · Ref: 31
- [ ] **P11-03** Voice note: rekam, upload, mailbox, signed URL, putar · Ref: 31, 32
- [ ] **P11-04** Lampirkan voice note ke hadiah · Ref: 31
- [ ] **P11-05** `api/turn-credentials.ts` + konfigurasi STUN/TURN + env TURN disinkron ke Vercel (`env:sync`) · Ref: 31, 51
- [ ] **P11-06** Voice chat WebRTC + signaling via channel · Ref: 31
- [ ] **P11-07** Proximity gain + indikator bicara + push-to-talk/open mic · Ref: 31
- [ ] **P11-08** App Telepon (panggil, ringtone, angkat, fallback voice note) · Ref: 31

**Kriteria selesai P11:** bisa ngobrol pakai suara di dalam game, makin dekat makin jelas. 🎉 **Rilis v0.8**

---

## P12 · Kendaraan & Peta Bandung
- [ ] **P12-01** Art & map final: Dago, Braga, Cihampelas + nama tempat asli dari OSM (ADR-023) · Ref: 10, 42
- [ ] **P12-02** Art & map final: Gedung Sate, Alun-alun, Pasar Baru + nama tempat asli dari OSM (ADR-023) · Ref: 10, 42
- [ ] **P12-03** Art & map final: **Buahbatu ⭐** (rumah keluarga Michelle, Jl. Buahbatu, tempat masa kecil dari kuesioner) + nama tempat asli dari OSM (ADR-023) · Ref: 10, 43
- [ ] **P12-04** Angkot + halte (fast travel berbayar, jam operasi, Mang Oleh) · Ref: 14
- [ ] **P12-05** Sistem kendaraan: naik/turun, tile `road`, kecepatan, bensin, parkir · Ref: 14
- [ ] **P12-06** Sepeda & motor + dealer · Ref: 14
- [ ] **P12-07** Bonceng pasangan (ajak/terima, sinkron, poin Romansa) · Ref: 14, 16
- [ ] **P12-08** App Ojek + App Peta lengkap · Ref: 14, 40
- [ ] **P12-09** Kustom kendaraan (warna, stiker, helm) · Ref: 14
- [ ] **P12-10** Karier tambahan: Kreatif & Pariwisata · Ref: 13

**Kriteria selesai P12:** keliling Bandung (sampai Buahbatu) pakai motor sambil bonceng pasangan. 🎉 **Rilis v0.9**

---

## P13 · Properti, Kredit & Pernikahan
- [ ] **P13-01** Sistem kredit (DP, tenor, cicilan Senin, denda, skor bank) + test lengkap · Ref: 14, 13
- [ ] **P13-02** Bank (Pak Dadang) + app Bank: tabungan, transfer, kredit · Ref: 13
- [ ] **P13-03** Sewa/beli hunian: kos → kontrakan → rumah · Ref: 14
- [ ] **P13-04** Mode dekor ala Sims (grid, rotasi, undo, wallpaper/lantai, realtime berdua) · Ref: 14
- [ ] **P13-05** `furniture.json` (≥ 80) + toko furnitur + skor rumah · Ref: 14
- [ ] **P13-06** Berkunjung ke rumah pasangan (ketuk pintu, izin) · Ref: 14
- [ ] **P13-07** Beli tanah + konstruksi bangunan (kandang, greenhouse, gudang) · Ref: 14
- [ ] **P13-08** Bab 6 & Proyek Revitalisasi awal (Lembang Hijau) · Ref: 21, 19
- [ ] **P13-09** Bab 7: "Minta Restu" di Buahbatu + Lamaran (toko perhiasan, pilih lokasi, cutscene) · Ref: 16, 18, 19
- [ ] **P13-10** Bab 8 Persiapan & upacara pernikahan + bulan madu · Ref: 16, 19
- [ ] **P13-11** Dompet & aset bersama, pindah serumah · Ref: 13, 14
- [ ] **P13-12** Mobil + kredit mobil · Ref: 14
- [ ] **P13-13** Rumah Impian (bangun di tanah sendiri) · Ref: 14

**Kriteria selesai P13:** menikah di game, punya rumah sendiri dengan KPR. 🎉 **Rilis v0.10**

---

## P14 · Keluarga & Anak
- [ ] **P14-01** Keputusan punya anak / adopsi (persetujuan berdua) · Ref: 17
- [ ] **P14-02** Masa penantian + quest persiapan + cutscene kelahiran · Ref: 17
- [ ] **P14-03** Bayi: kebutuhan, perawatan, babysitter · Ref: 17
- [ ] **P14-04** Tumbuh kembang (bayi → balita → anak → remaja) + test · Ref: 17
- [ ] **P14-05** Penampilan & trait warisan · Ref: 17
- [ ] **P14-06** Sekolah: daftar, biaya, PR minigame, rapor, acara sekolah · Ref: 17
- [ ] **P14-07** Anak membantu + aktivitas keluarga + foto keluarga tahunan · Ref: 17
- [ ] **P14-08** App Keluarga + pohon keluarga · Ref: 17, 40
- [ ] **P14-09** Bab 9 & 10 · Ref: 19

**Kriteria selesai P14:** punya anak yang tumbuh dan sekolah. 🎉 **Rilis v0.11**

---

## P15 · Festival, Event & Endgame
- [ ] **P15-01** Sistem festival + 8 festival (`19` §5) · Ref: 19
- [ ] **P15-02** Event tanggal asli (ultah, anniversary) + quest kejutan yang tersembunyi dari yang berulang tahun · Ref: 19, 43
- [ ] **P15-03** Event acak harian · Ref: 19
- [ ] **P15-04** Skill 6 jenis + perk Lv5/Lv10 · Ref: 21
- [ ] **P15-05** Proyek Revitalisasi lengkap (6 proyek) · Ref: 21
- [ ] **P15-06** Area Ciwidey & Situ Patenggang · Ref: 10
- [ ] **P15-07** Gua Tangkuban lantai 11–20 + Saung Udjo (ritme angklung duet) · Ref: 20
- [ ] **P15-08** Achievement (≥ 100) · Ref: 21
- [ ] **P15-09** Karier Agribisnis & Pendidikan + Lv10 bisnis sendiri · Ref: 13
- [ ] **P15-10** Meter Kesempurnaan Hidup + konten tahun 3+ (legendaris, event langka) · Ref: 21
- [ ] **P15-11** Legacy anak (kelulusan, jalan hidup) · Ref: 17
- [ ] **P15-12** NPC lengkap (20–25) + heart events · Ref: 18

**Kriteria selesai P15:** selalu ada tujuan baru setiap musim dan tahun. 🎉 **Rilis v0.12**

---

## P16 · Polish & Rilis v1.0
- [ ] **P16-01** Audio lengkap (musik area/musim, ambience, SFX) · Ref: 41
- [ ] **P16-02** Tutorial bertahap · Ref: 40
- [ ] **P16-03** Pengaturan lengkap (audio, kontrol remap, teks, aksesibilitas) · Ref: 40
- [ ] **P16-04** Gamepad support · Ref: 40
- [ ] **P16-05** Optimasi performa HP (budget `50` §6) · Ref: 50
- [ ] **P16-06** Balancing pass ekonomi & progresi (simulasi 3 tahun) · Ref: 13, 21
- [ ] **P16-07** Layar Kredit (dari `CREDITS.md`) · Ref: 42
- [ ] **P16-08** Perluas E2E: playthrough tahun 1 dipercepat (solo & berdua) + perf test di CI · Ref: 50
- [ ] **P16-09** Playtest 2 minggu berdua + perbaikan bug · Ref: 50
- [ ] **P16-10** Checklist rilis + tag `v1.0.0` 🎉 · Ref: 50

---

## 💡 Backlog Ide
*(Ide baru masuk sini dulu, dibahas sebelum masuk fase.)*
- Kalender event musiman tahunan (Ramadan/Lebaran, Natal) yang bisa diaktifkan di pengaturan
- Mode "surat masa depan" (tulis surat yang baru bisa dibuka 1 tahun nyata kemudian)
- Hewan langka di Tahura (lutung)
- Kafe milik sendiri bisa didekor penuh
- Mini "TikTok" in-game: rekam GIF momen berdua
- *(teknis, dari P0-08)* Teks Phaser pakai **BitmapText** (font pixel di-bake jadi atlas) supaya tepi huruf 100% tajam; `fillText` canvas masih memberi antialias 1 px di tepi glyph. Cocok digarap bareng pipeline aset P1-01.
- *(dari user, dikerjakan bareng P5-04)* Layar judul beranimasi: huruf judul bergelombang pelan, subtitle muncul pelan, awan/parallax & kilau stroberi; hormati `prefers-reduced-motion`.
- *(dari user, 2026-11-24)* **Warga figuran ala GTA**: orang-orang tanpa nama yang jalan kaki, nongkrong, naik motor/angkot di kota (Braga, Alun-alun, Dago) supaya Bandung terasa ramai; beda dari NPC bernama di `18` (P8). Bisa disapa singkat, tanpa hubungan/quest. Perlu dibahas: kepadatan per area & jam, sinkron 2 pemain (cukup deterministik dari seed, tidak dikirim lewat jaringan), batas performa HP. Kandidat fase: P12 (kendaraan & peta Bandung).
