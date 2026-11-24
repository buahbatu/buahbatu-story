# 04 · Catatan Keputusan (ADR)

Setiap keputusan teknis/desain penting dicatat di sini supaya tidak diperdebatkan ulang. Tambah ADR baru di bagian bawah dengan template yang ada di akhir file.

---

### ADR-001 · 2D pixel top-down, bukan 3D
- **Status**: Diganti oleh ADR-022 (2026-11-24)
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
- **Status**: Diganti oleh ADR-022 (2026-11-24)
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
- **Status**: Diganti oleh ADR-022 (2026-11-24); bagian versi TypeScript tetap berlaku
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
- **Status**: Diganti oleh ADR-020 (2026-11-23)
- **Konteks**: Integer scaling murni (P0-05) membuat game di iPhone landscape (734×343, sedikit di bawah 360) hanya ×2 piksel fisik → memakai ±58% lebar layar.
- **Keputusan**: Di layar DPR ≥ 2, kalau integer mengisi < 80% ruang, pakai skala pecahan nearest-neighbor yang memenuhi layar. Di DPR < 2 (desktop/laptop) tetap integer murni.
- **Alasan**: Di layar sepadat HP/Retina, piksel game yang 1 piksel fisik lebih tebal tidak terlihat; di desktop (piksel fisik besar) ketidakrataan 2/3 px terlihat dan mengganggu saat kamera bergerak.
- **Konsekuensi**: Jendela browser desktop yang kecil (mis. 1366×657) tetap ×1 dengan bingkai lebar (perilaku lama). Kalau nanti terasa kurang, bisa ditinjau ulang (mis. mode "Isi layar" di Pengaturan, P16-03).

### ADR-019 · Kode tanpa komentar & padat, skrip otomasi dalam TypeScript
- **Status**: Diterima (2026-11-23, permintaan user). Menggantikan `03` §4 versi lama.
- **Konteks**: User tidak ingin ada komentar di kode dan ingin kode padat.
- **Keputusan**: Semua komentar dihapus dari kode (dijaga tes `tests/no-comments.test.ts` berbasis parser TypeScript). Prettier `printWidth` 110 → 140, baris kosong di dalam blok dihapus. Skrip `scripts/*.mjs` (yang tipenya dulu bergantung pada komentar JSDoc) diubah jadi `scripts/*.ts`, dijalankan langsung oleh Node 24. `tsconfig`: `erasableSyntaxOnly`, `allowImportingTsExtensions`, tanpa `allowJs`.
- **Alasan**: Tanpa JSDoc, tipe skrip hilang dan lint strict di tes gagal; TypeScript asli memberi tipe tanpa komentar dan seluruh skrip kini ikut typecheck ketat.
- **Konsekuensi**: Rujukan "Desain: docs/…" di kode hilang, digantikan tabel sistem → dokumen di `tests/structure.test.ts` dan rujukan di TODO/docs. Node < 24 tidak bisa menjalankan skrip (sudah dijaga `engines` & `.nvmrc`). Parameter property di class tidak dipakai.

### ADR-020 · Area pandang fleksibel, game wajib landscape, layar penuh di HP
- **Status**: Diterima (2026-11-23, keputusan user). Menggantikan ADR-018 dan aturan resolusi tetap 640×360 di `40` §7.
- **Konteks**: Di laptop user (1366×768, Chrome) aturan integer + resolusi tetap membuat game hanya ×1 (±separuh layar); F11 pun masih berbingkai. Di HP, user ingin game wajib landscape dan tanpa bar browser.
- **Keputusan**: (1) Zoom selalu integer per piksel fisik, ukuran dunia yang terlihat mengikuti layar (tinggi ±360, batas 270–450, lebar maks. 960) → selalu penuh layar. (2) Perangkat sentuh tegak: game disembunyikan & di-pause, tampil animasi putar HP. (3) Android: layar penuh + kunci landscape pada sentuhan pertama; PWA `display: fullscreen`, `orientation: landscape` dengan ikon sendiri.
- **Alasan**: Cara standar game pixel art (piksel tetap rata & tajam tanpa bingkai). Fullscreen API wajib dipicu aksi user; iPhone Safari tidak mendukungnya untuk halaman biasa, jadi PWA jadi jalurnya.
- **Konsekuensi**: Semua scene & HUD wajib membaca ukuran dari `this.scale` dan menyesuaikan saat resize. Kamera (P1-06) dan peta harus siap memperlihatkan area berbeda per layar. Pemain di layar lebar melihat sedikit lebih banyak dunia (tidak memengaruhi multiplayer karena dunia adalah data).

### ADR-021 · (dibatalkan) Gaya chibi 2D 16px
- **Status**: Diganti oleh ADR-022 sebelum dikerjakan. User sempat memilih gaya chibi 2D, lalu menegaskan acuan sebenarnya adalah *Harvest Moon: Back to Nature* (PS1), bukan Stardew Valley.

### ADR-022 · Visual 2.5D ala Harvest Moon: Back to Nature, engine Three.js
- **Status**: Diterima (2026-11-24, keputusan user). Menggantikan ADR-001 (2D top-down), ADR-004 (LPC 32px), ADR-016 (Phaser 4). Merevisi Non-Goals `00` §6. **Bagian karakter sprite & sudut kamera diganti ADR-024.**
- **Konteks**: Acuan user adalah **Harvest Moon: Back to Nature** (PS1): dunia 3D low-poly bertekstur, kamera miring dari atas, karakter berupa sprite 2D chibi. Docs lama mengarah ke 2D pixel top-down (lebih mirip Stardew Valley) sehingga tidak sesuai.
- **Keputusan**:
  1. **Engine**: **Three.js** (WebGL) menggantikan Phaser. Logika game, Command, state, UI Preact, CI, tes, layar penuh/putar HP tetap.
  2. **Gaya**: dunia **3D low-poly** (tanah petak, rumah, pohon, pagar dari geometri sederhana + tekstur pixel kecil, `NearestFilter`), **karakter & NPC sprite chibi** (billboard menghadap kamera, 8 arah), **kamera perspektif miring** dari atas mengikuti pemain. Semua aset orisinal berlatar Bandung; tidak menyalin aset, karakter, peta, atau tampilan spesifik game mana pun.
  3. **Rasa PS1**: dirender ke **resolusi internal rendah** (tinggi ±240) lalu diperbesar zoom integer tanpa blur (memakai `computeView`, ADR-020), tekstur nearest-neighbor, palet hangat.
  4. **Peta**: tetap disusun sebagai **grid** (Tiled `.tmj`: layer tanah, ketinggian, objek, tabrakan) lalu **dibangun otomatis jadi 3D**. Gameplay (cangkul, tanam, tabrakan, NPC pathfinding) tetap berbasis grid seperti Back to Nature.
  5. Bangunan unik per daerah (`10` §5) dibuat dari model low-poly modular + tekstur, digenerate lewat kode/data sehingga variasinya banyak.
- **Alasan**: Satu-satunya cara memenuhi visi user. Three.js matang, gratis, jalan di browser & HP; low-poly + render resolusi rendah tetap ringan. Grid-based world menjaga semua desain sistem (farming, dekor, NPC) tetap berlaku.
- **Konsekuensi**: Task berbasis Phaser (scene, kamera 2D, sprite LPC) disusun ulang (TODO P1). Pekerjaan grafik lebih besar (model + tekstur + sprite). Budget performa (`50` §6) diukur ulang untuk 3D. Snapshot visual dibuat ulang. Docs yang menyebut Phaser/LPC/top-down direvisi bertahap saat task terkait dikerjakan; yang inti (`00`, `01`, `02`, `10` §6, `42`) direvisi sekarang.

### ADR-024 · Karakter 3D low-poly & tampilan dunia ala PS1 (koreksi ADR-022)
- **Status**: Diterima (2026-11-24, keputusan user). Mengganti bagian "karakter & NPC sprite chibi billboard" dan sudut kamera di ADR-022.
- **Konteks**: Setelah sprite chibi P1-04 dibuat, user menilai tampilannya masih "2D, tidak seperti Harvest Moon PS1". Pengecekan ulang: engine Back to Nature diturunkan dari Harvest Moon 64; karakter, hewan, dan dunianya **poligon 3D low-poly** dengan kamera tetap bersudut miring. Asumsi ADR-022 bahwa karakter BTN berupa sprite 2D keliru.
- **Keputusan**: (1) Pemain, NPC, dan hewan menjadi **model 3D low-poly chibi** (kepala besar, wajah & baju bertekstur pixel kecil, anggota badan kaku yang berayun; animasi prosedural per bagian, tanpa rig tulang), terkena cahaya & bayangan seperti objek dunia. (2) **Sudut kamera diturunkan** dari 52° supaya dinding & volume 3D lebih terlihat. (3) **Tanah tidak lagi terasa tilemap**: transisi antar jenis tanah, variasi warna per petak, rumput/semak 3D kecil. (4) **Bayangan nyata** dari matahari (shadow map) + shading lebih kontras ala PS1. Grid gameplay tetap.
- **Alasan**: Memenuhi acuan visual user secara benar.
- **Konsekuensi**: P1-04 dikerjakan ulang (sprite 2D dihapus); task baru **P1-04b** (tampilan dunia ala PS1: kamera, tanah alami, bayangan). Sistem outfit P7 memakai part/tekstur 3D, bukan layer spritesheet (`15` direvisi saat P7). Semua snapshot dunia dibuat ulang.

### ADR-025 · Aset 3D jadi (CC0) untuk karakter & objek dunia, bukan model buatan kode
- **Status**: Diterima (2026-11-24, keputusan user). Merevisi ADR-022 poin 5 & ADR-024 poin 1.
- **Konteks**: Model karakter buatan kode terasa kaku. User mengingatkan rencana awal memakai aset jadi; ADR-022 sempat memutuskan bangunan "digenerate lewat kode" tanpa menjelaskan kelebihan-kekurangannya. Dicoba juga AI text-to-3D (FLUX → Hunyuan3D/TRELLIS): konsep bagus, tetapi kuota GPU gratis terbatas & model hasilnya tanpa rig (tidak bisa melangkah).
- **Keputusan**: (1) **Karakter** memakai **Kenney Mini Characters 2.0 (CC0)**: GLB bertulang dengan animasi (idle, walk, sprint, sit, pick-up, interact, emote, …), **diwarnai ulang per sel palet** (`colormap.png`, gradasi dipertahankan) untuk pemain A, Michelle, dan NPC; dimuat `GLTFLoader` + `SkeletonUtils.clone`, material Lambert agar kena cahaya dunia. (2) **Bangunan, prop & alam** berangsur pindah ke paket 3D CC0 dari keluarga gaya yang serasi (Kenney), landmark Bandung dirakit custom (P1-04b/P12). (3) Kode tetap untuk tanah/peta, pewarnaan ulang, dan render ala PS1 (resolusi rendah, nearest, cahaya, bayangan). (4) AI text-to-3D boleh dicoba lagi untuk landmark/karakter final (P7/P12) bila tersedia token HF & rig.
- **Alasan**: Animasi & bentuk jauh lebih hidup, legal (CC0), cepat.
- **Konsekuensi**: Model kode `model.ts`/sprite dihapus. Aset di `public/assets/models/`, lisensi di `public/assets/licenses/`, tercatat di `CREDITS.md`. Anggaran chunk engine 600 → 700 kB (inti Three.js kini memuat skinning & animasi; add-on dipisah ke chunk `three-addons`). Pelaksanaan bertahap (P1-04c/d/e): model dimuat lewat pemuat aset bersama (pramuat per peta, klon berbagi geometri), material diganti Lambert dengan warna alami + tekstur pixel proyek agar serasi dengan tanah PS1; objek khas Bandung (tiang PLN, gerobak, tembok kompleks, papan nama) tetap custom.

### ADR-023 · Nama tempat mengikuti Bandung asli (permintaan user, 2026-11-24)
- **Status**: Diterima
- **Konteks**: User ingin peta terasa seperti Bandung sungguhan: nama jalan, landmark, dan tempat kopi/toko lokal sesuai kenyataan. Bentuk bangunan bebas.
- **Keputusan**: (1) Nama jalan & landmark publik memakai **nama asli**, tata letak kira-kira mengikuti peta nyata. (2) Kafe, warung, dan toko **lokal** sekitar memakai **nama asli** (keputusan user). (3) **Merek besar/waralaba nasional & internasional** (SPBU, minimarket, kopi/fast food waralaba) memakai **plesetan** tanpa logo asli. (4) Sumber data posisi & nama: **OpenStreetMap** (ODbL, atribusi di `CREDITS.md`) + pengecekan manual; Google Maps hanya sebagai acuan lihat, **tidak di-scrape** (melanggar ketentuannya). Tempat kenangan kalian dari kuesioner (`43`).
- **Alasan**: Rasa "Bandung beneran" (pilar visi #3) tanpa risiko merek dagang besar; repo masih publik selama development (ADR-010).
- **Konsekuensi**: Dikerjakan saat peta final P12-01–03 & P15-06. Nama asli tetap teks i18n `sign.*` (maks. ±10 huruf per papan bangunan; nama panjang → papan berdiri). Daftar nama per area + sumbernya dicatat di `docs/10` saat area itu dikerjakan. Peta prototipe P1 tetap memakai nama umum.

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
