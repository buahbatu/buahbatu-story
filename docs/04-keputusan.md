# 04 · Catatan Keputusan (ADR)

Setiap keputusan teknis/desain penting dicatat di sini supaya tidak diperdebatkan ulang. Tambah ADR baru di bagian bawah dengan template yang ada di akhir file.

---

### ADR-001 · 2D pixel top-down, bukan 3D
- **Status**: Diterima
- **Konteks**: Ingin nuansa Harvest Moon, banyak sistem (farming grid, dekor, NPC). 3D jauh lebih berat dikerjakan.
- **Keputusan**: 2D pixel top-down dengan Phaser.
- **Konsekuensi**: Aset gratis berlimpah, grid farming/dekor sederhana. Visual "mirip wajah" dicapai lewat potret dialog.

### ADR-002 · TypeScript strict
- **Keputusan**: Seluruh kode TS strict.
- **Alasan**: Proyek jangka panjang, banyak sistem, dikerjakan bareng AI, jadi tipe mencegah banyak bug.

### ADR-003 · Supabase (bukan Firebase) + keep-alive cron
- **Konteks**: Butuh Auth, DB, Realtime (multiplayer + presence), Storage (voice note). Supabase free tier mem-*pause* project yang tidak aktif ±7 hari.
- **Keputusan**: Supabase + Vercel Cron harian yang melakukan query ringan.
- **Konsekuensi**: Dashboard tabel enak dipakai, Realtime Presence/Broadcast cocok untuk multiplayer. Perlu dipantau kalau kebijakan pause berubah.

### ADR-004 · Art direction LPC 32px
- **Konteks**: Butuh karakter berlapis (ganti baju) gratis dan konsisten. Aset 16px (Sprout Lands) tidak cocok dengan karakter LPC.
- **Keputusan**: Seluruh aset mengikuti gaya **LPC, tile 32×32**. Landmark Bandung digambar sendiri mengikuti palet LPC.
- **Konsekuensi**: Wajib mematuhi lisensi LPC (CC-BY-SA/GPL/OGA-BY) dan mencatat kredit di `CREDITS.md`. Alternatif berbayar: Mana Seed (16px), hanya kalau seluruh gaya ikut diganti.

### ADR-005 · UI menu memakai Preact DOM overlay
- **Keputusan**: Dunia game di canvas Phaser; HUD, HP, menu, dan dialog di Preact.
- **Alasan**: Menu kompleks (grid inventory, toko, lemari, bank) jauh lebih mudah, responsif, dan aksesibel di DOM.
- **Konsekuensi**: Komunikasi Phaser ↔ UI hanya lewat EventBus + store.

### ADR-006 · Host-authoritative tanpa server sendiri
- **Konteks**: Hanya 2 pemain, tanpa VPS.
- **Keputusan**: Pemain yang online duluan menjadi **host**: menjalankan jam, cuaca, NPC, dan memvalidasi Command. Pemain lain mengirim Command ke host. Host menyimpan ke DB.
- **Konsekuensi**: Perlu mekanisme handover saat host keluar (`30-multiplayer.md`).

### ADR-007 · Empat musim fantasi
- **Konteks**: Bandung aslinya punya musim hujan/kemarau, tapi gameplay Harvest Moon butuh 4 musim.
- **Keputusan**: Pakai Semi/Panas/Gugur/Dingin versi "Bandung fantasi" (salju tipis di musim dingin).
- **Konsekuensi**: Nama musim bisa di-rename lewat i18n kalau nanti mau diganti.

### ADR-008 · Semua mutasi state lewat Command
- **Alasan**: Testable, bisa di-replay, siap jaringan. Lihat `02-arsitektur.md` §4.

### ADR-009 · Tanpa hukuman berat
- **Keputusan**: Tidak ada kematian, penyitaan, atau game over. Kegagalan = konsekuensi kecil yang lucu (surat teguran, pingsan lalu bangun di rumah, mood turun).

### ADR-010 · Konten personal privat
- **Status**: Diubah 2026-11-23 (keputusan user di P0-00)
- **Keputusan awal**: Repo GitHub **private**. Foto/audio personal disimpan di folder `src/content/personal/` (gitignore) atau bucket Supabase **privat**.
- **Perubahan**: Repo GitHub **public selama masa development** supaya menit GitHub Actions tidak terbatas. Saat game final/stabil, repo diubah ke **private**. Docs desain (termasuk nama Pemain B) di-commit apa adanya atas persetujuan user.
- **Tetap berlaku**: foto, audio, kuesioner, dan isi `src/content/personal/` **tidak pernah** di-commit (gitignore + gitleaks). Media personal hanya dari bucket Supabase privat setelah login.
- **Konsekuensi**: Isi repo selama public bisa sudah di-clone/fork/cache pihak lain. Mengubah ke private nanti tidak menariknya kembali.

### ADR-011 · IndexedDB untuk save lokal
- **Alasan**: Batas localStorage ±5MB dan sinkron (blocking). IndexedDB lebih besar dan async.

### ADR-012 · Dunia bersama wajib online
- **Keputusan**: Mutasi dunia bersama membutuhkan koneksi. Saat koneksi putus ada *grace period*: Command diantrekan maks. 60 detik, setelah itu game di-pause dengan layar "Menyambung ulang…".
- **Alasan**: Menghindari konflik save yang rumit.

### ADR-013 · Tes dijalankan AI, deploy hanya lewat CI
- **Keputusan**: Semua verifikasi (unit, E2E, multiplayer 2 browser, visual, performa) ditulis dan dijalankan AI agent. Deploy production hanya dari CI yang hijau.
- **Alasan**: User tidak perlu ngetes manual; bug tertangkap sebelum sampai ke Michelle.
- **Konsekuensi**: Game wajib punya test hook (`window.__BB__`) dan mode deterministik (seed + freeze). Playtest manusia hanya untuk "rasa main".

### ADR-014 · Akun per folder (multi-proyek di satu perangkat)
- **Status**: Diterima (P0-00, 2026-11-23)
- **Konteks**: Satu perangkat dipakai banyak proyek dengan akun berbeda; push/deploy tidak boleh nyasar ke akun lain. Hasil pemeriksaan proyek lain (tanpa membaca nilai rahasia):
  - **Semua (kelola, prins, shaflow, kis)**: remote HTTPS, identitas + credential helper per akun lewat `includeIf "gitdir:…"` di `~/.gitconfig` → `~/.gitconfig-<proyek>`. Tidak ada SSH alias.
  - **gh**: keempat akun login bersamaan di keyring `gh` (akun aktif global: `satuteknologi-id`).
  - **shaflow** (paling rapi): wrapper `scripts/platform.mjs` → `gh` diberi `GH_TOKEN` dari `gh auth token -u <akun>`, Vercel memakai `--global-config .vercel-cli` (login per folder), Supabase memakai `SUPABASE_ACCESS_TOKEN` dari file env lokal + CLI sebagai devDependency.
  - **kis**: deploy lewat GitHub Actions, `vercel.json` → `git.deploymentEnabled: false`.
- **Keputusan**: Pakai pola **shaflow**, dengan akun GitHub **`buahbatu`** (email commit dari user):
  1. Git: identitas & credential helper di **`git config --local`** repo ini (bukan `includeIf` di `~/.gitconfig`, supaya file global tidak disentuh). Helper meminta token **dinamis** dari `gh auth token -u buahbatu`, jadi tidak ada token tertulis di file config.
  2. `gh`: akun `buahbatu` ditambahkan ke keyring `gh` lewat device login, lalu akun aktif global dikembalikan ke semula (`gh auth switch`). Perintah proyek memakai `node scripts/platform.mjs gh …`.
  3. Vercel: `node scripts/platform.mjs vercel …` (`--global-config .vercel-cli`, plus `--token`/`--scope` dari `.env.local` kalau diisi).
  4. Supabase: `node scripts/platform.mjs supabase …` dengan `SUPABASE_ACCESS_TOKEN` dari `.env.local`; CLI dipasang sebagai devDependency saat dibutuhkan (P5-01).
  5. Login browser dibuka di Chrome profil **Kelola POS** (`--profile-directory="Profile 2"`); user cukup klik.
  6. Deploy hanya lewat CI (`git.deploymentEnabled: false`), sama seperti kis.
- **Konsekuensi**: `GH_TOKEN` di `.env.local` tidak wajib (opsional untuk CI/mesin lain). Folder `.vercel-cli/` wajib di-`.gitignore`. Kalau repo dipindah folder, config lokal ikut karena tersimpan di `.git/config`.

### ADR-015 · Login tertutup tanpa registrasi publik
- **Status**: Diterima (2026-11-23, keputusan user)
- **Konteks**: Game hanya untuk 2 orang, sedangkan URL Vercel bisa dibuka siapa saja.
- **Keputusan**: Sign up publik dimatikan sejak awal. Akun A & B dibuat oleh kita lewat script admin. Layar login hanya punya **Masuk** dan **Lupa password**. Lupa password **mendeteksi apakah email terdaftar** (lewat Vercel function + service role) sebelum mengirim email reset.
- **Alasan**: Tidak ada orang asing yang bisa masuk. Pesan "email belum terdaftar" lebih jelas untuk 2 pemain daripada pesan generik.
- **Konsekuensi**: Deteksi email membuka celah enumerasi akun, jadi endpoint wajib di-rate-limit. Konten personal tetap wajib dari bucket privat (bukan bundle JS), karena login tidak melindungi file statis. Detail: `32` §2.

### ADR-016 · Phaser 4 + versi toolchain awal
- **Status**: Diterima (P0-01, 2026-11-23)
- **Konteks**: `01` meminta "Phaser versi stabil terbaru". Per November 2026 versinya **4.2.1** (4.0 stabil sejak April 2026; 3.90 adalah rilis terakhir v3). Contoh kode di docs masih memakai API Phaser 3. TypeScript terbaru (7.x, compiler native) belum didukung `typescript-eslint` (peer `<6.1.0`).
- **Keputusan**: Pakai **Phaser 4.2.x** (`import * as Phaser from 'phaser'`). TypeScript dipin **~6.0** sampai `typescript-eslint` mendukung TS 7. Vite 8 (Rolldown): opsi build memakai `build.rolldownOptions`, dan Phaser dipisah ke chunk sendiri.
- **Alasan**: Phaser 4 adalah jalur yang masih dirawat; API scene/tilemap/arcade umumnya sama dengan v3. Pin TS mencegah lint rusak di P0-03.
- **Konsekuensi**: Contoh kode Phaser 3 di docs perlu dicek ulang saat dipakai (renderer, pipeline/filter, beberapa API geometri berubah). Naikkan TS ke 7 begitu `typescript-eslint` mendukung (cek di task chore).

### ADR-017 · Immer untuk Command (atomik + patch)
- **Status**: Diterima (P0-07, 2026-11-23)
- **Konteks**: `02` §4 membolehkan handler memutasi state "secara terkontrol" atau memakai Immer. Multiplayer butuh: Command gagal tidak boleh meninggalkan state setengah jadi, klien butuh rollback prediksi (P6-05), dan host butuh mengirim perubahan kecil (`state:patch`, P6-07).
- **Keputusan**: Dependency baru **`immer`** (±5 KB gzip). `CommandDispatcher` menjalankan handler di dalam `produceWithPatches`; handler memutasi `draft` lalu mengembalikan `succeed(events)` / `reject(reasonKey)`. State hasil di-*freeze*.
- **Alasan**: Atomik gratis (reject/throw → draft dibuang, termasuk state RNG), `patches` + `inversePatches` langsung jadi bahan sinkron & rollback, freeze mencegah mutasi diam-diam di luar Command.
- **Konsekuensi**: Handler wajib memakai `createRng(draft.world)` (bukan `Math.random`) dan tidak boleh me-*return* objek state baru dari recipe. Peta handler (`HandlerMap`) diwajibkan lengkap oleh TypeScript untuk setiap jenis Command.

### ADR-018 · Skala pecahan di layar HP yang pendek
- **Status**: Diterima (2026-11-23, keputusan user, opsi B)
- **Konteks**: Integer scaling murni (P0-05) membuat game di iPhone landscape (734×343, sedikit di bawah 360) hanya ×2 piksel fisik → memakai ±58% lebar layar.
- **Keputusan**: Di layar DPR ≥ 2, kalau integer mengisi < 80% ruang, pakai skala pecahan nearest-neighbor yang memenuhi layar. Di DPR < 2 (desktop/laptop) tetap integer murni.
- **Alasan**: Di layar sepadat HP/Retina, piksel game yang 1 piksel fisik lebih tebal tidak terlihat; di desktop (piksel fisik besar) ketidakrataan 2/3 px terlihat dan mengganggu saat kamera bergerak.
- **Konsekuensi**: Jendela browser desktop yang kecil (mis. 1366×657) tetap ×1 dengan bingkai lebar (perilaku lama). Kalau nanti terasa kurang, bisa ditinjau ulang (mis. mode "Isi layar" di Pengaturan, P16-03).

---

## Template ADR Baru
```
### ADR-0XX · Judul singkat
- **Status**: Diusulkan / Diterima / Diganti oleh ADR-0YY
- **Konteks**: masalah apa
- **Keputusan**: pilih apa
- **Alasan**: kenapa
- **Konsekuensi**: dampaknya
```
