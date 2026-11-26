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
- **Tetap berlaku**: ~~foto, audio, kuesioner, dan isi `src/content/personal/` tidak pernah di-commit~~ → **diganti ADR-033 (2026-11-26)**: konten personal kini di-commit atas keputusan user. Rahasia (token/kunci) tetap tidak pernah di-commit.
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
- **Status**: Diterima (2026-11-24, keputusan user). **Poin 3 diganti ADR-030, poin 4 diganti ADR-031 (2026-11-26).** Menggantikan ADR-001 (2D top-down), ADR-004 (LPC 32px), ADR-016 (Phaser 4). Merevisi Non-Goals `00` §6. **Bagian karakter sprite & sudut kamera diganti ADR-024.**
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
- **Status**: Diterima (2026-11-24, keputusan user). Bagian tampilan PS1 (tekstur pixel, shading kontras) diganti **ADR-030** (2026-11-26). Mengganti bagian "karakter & NPC sprite chibi billboard" dan sudut kamera di ADR-022.
- **Konteks**: Setelah sprite chibi P1-04 dibuat, user menilai tampilannya masih "2D, tidak seperti Harvest Moon PS1". Pengecekan ulang: engine Back to Nature diturunkan dari Harvest Moon 64; karakter, hewan, dan dunianya **poligon 3D low-poly** dengan kamera tetap bersudut miring. Asumsi ADR-022 bahwa karakter BTN berupa sprite 2D keliru.
- **Keputusan**: (1) Pemain, NPC, dan hewan menjadi **model 3D low-poly chibi** (kepala besar, wajah & baju bertekstur pixel kecil, anggota badan kaku yang berayun; animasi prosedural per bagian, tanpa rig tulang), terkena cahaya & bayangan seperti objek dunia. (2) **Sudut kamera diturunkan** dari 52° supaya dinding & volume 3D lebih terlihat. (3) **Tanah tidak lagi terasa tilemap**: transisi antar jenis tanah, variasi warna per petak, rumput/semak 3D kecil. (4) **Bayangan nyata** dari matahari (shadow map) + shading lebih kontras ala PS1. Grid gameplay tetap.
- **Alasan**: Memenuhi acuan visual user secara benar.
- **Konsekuensi**: P1-04 dikerjakan ulang (sprite 2D dihapus); task baru **P1-04b** (tampilan dunia ala PS1: kamera, tanah alami, bayangan). Sistem outfit P7 memakai part/tekstur 3D, bukan layer spritesheet (`15` direvisi saat P7). Semua snapshot dunia dibuat ulang.

### ADR-025 · Aset 3D jadi (CC0) untuk karakter & objek dunia, bukan model buatan kode
- **Status**: Diterima (2026-11-24, keputusan user). Merevisi ADR-022 poin 5 & ADR-024 poin 1.
- **Konteks**: Model karakter buatan kode terasa kaku. User mengingatkan rencana awal memakai aset jadi; ADR-022 sempat memutuskan bangunan "digenerate lewat kode" tanpa menjelaskan kelebihan-kekurangannya. Dicoba juga AI text-to-3D (FLUX → Hunyuan3D/TRELLIS): konsep bagus, tetapi kuota GPU gratis terbatas & model hasilnya tanpa rig (tidak bisa melangkah).
- **Keputusan**: (1) **Karakter** memakai **Kenney Mini Characters 2.0 (CC0)**: GLB bertulang dengan animasi (idle, walk, sprint, sit, pick-up, interact, emote, …), **diwarnai ulang per sel palet** (`colormap.png`, gradasi dipertahankan) untuk pemain A, Michelle, dan NPC; dimuat `GLTFLoader` + `SkeletonUtils.clone`, material Lambert agar kena cahaya dunia. (2) **Bangunan, prop & alam** berangsur pindah ke paket 3D CC0 dari keluarga gaya yang serasi (Kenney), landmark Bandung dirakit custom (P1-04b/P12). (3) Kode tetap untuk tanah/peta, pewarnaan ulang, dan render ala PS1 (resolusi rendah, nearest, cahaya, bayangan). (4) AI text-to-3D boleh dicoba lagi untuk landmark/karakter final (P7/P12) bila tersedia token HF & rig.
- **Alasan**: Animasi & bentuk jauh lebih hidup, legal (CC0), cepat.
- **Konsekuensi**: Model kode `model.ts`/sprite dihapus. Aset di `public/assets/models/`, lisensi di `public/assets/licenses/`, tercatat di `CREDITS.md`. Anggaran chunk engine 600 → 700 kB (inti Three.js kini memuat skinning & animasi; add-on dipisah ke chunk `three-addons`). Pelaksanaan bertahap (P1-04c/d/e): model dimuat lewat pemuat aset bersama (pramuat per peta, klon berbagi geometri), material diganti Lambert dengan warna alami + tekstur pixel proyek agar serasi dengan tanah PS1; objek khas Bandung (tiang PLN, gerobak, tembok kompleks, papan nama) tetap custom. **Bangunan dikecualikan** (keputusan user 2026-11-24, P1-04e): model Kenney City Kit (Suburban/Commercial) sudah dicoba & dibandingkan berdampingan, tetapi terlihat rumah pinggiran kota modern yang mulus; bangunan tetap dirakit kode (genteng/bambu/seng bertekstur pixel) dan dipoles detail khas rumah Indonesia.

### ADR-023 · Nama tempat mengikuti Bandung asli (permintaan user, 2026-11-24)
- **Status**: Diterima
- **Konteks**: User ingin peta terasa seperti Bandung sungguhan: nama jalan, landmark, dan tempat kopi/toko lokal sesuai kenyataan. Bentuk bangunan bebas.
- **Keputusan**: (1) Nama jalan & landmark publik memakai **nama asli**, tata letak kira-kira mengikuti peta nyata. (2) Kafe, warung, dan toko **lokal** sekitar memakai **nama asli** (keputusan user). (3) **Merek besar/waralaba nasional & internasional** (SPBU, minimarket, kopi/fast food waralaba) memakai **plesetan** tanpa logo asli. (4) Sumber data posisi & nama: **OpenStreetMap** (ODbL, atribusi di `CREDITS.md`) + pengecekan manual; Google Maps hanya sebagai acuan lihat, **tidak di-scrape** (melanggar ketentuannya). Tempat kenangan kalian dari kuesioner (`43`).
- **Alasan**: Rasa "Bandung beneran" (pilar visi #3) tanpa risiko merek dagang besar; repo masih publik selama development (ADR-010).
- **Konsekuensi**: Dikerjakan saat peta final P12-01–03 & P15-06. Nama asli tetap teks i18n `sign.*` (maks. ±10 huruf per papan bangunan; nama panjang → papan berdiri). Daftar nama per area + sumbernya dicatat di `docs/10` saat area itu dikerjakan. Peta prototipe P1 tetap memakai nama umum.

### ADR-026 · Kontur tanah campuran: undakan + bukit/lembah landai (keputusan user, 2026-11-25)
- **Status**: Diterima; model undakan per petak diganti **ADR-031** (2026-11-26)
- **Konteks**: user tidak mau peta datar rata per level ("kita main kontur tanah"). Model awal hanya undakan bulat (`Height` 0–3) + tangga.
- **Keputusan**: pilihan user **campuran**. Undakan/tebing tetap; ditambah objek peta `hill` (elips, `height` ±, `flat`) yang menambah tinggi halus per sudut petak. Permukaan = level petak + lereng, diinterpolasi per segitiga mesh.
- **Alasan**: tetap kompatibel dengan peta, kolisi, & tangga yang ada; data-driven (diatur di peta, bukan kode); bukit terlihat alami untuk Lembang/Dago/Ciwidey sementara ladang & bangunan tetap datar.
- **Konsekuensi**: `elevation()` kini kontinu (dipakai kolisi, prop, rumput, kamera). Aturan datar/kemiringan dijaga tes peta. Mesh terrain sedikit lebih besar (petak miring = 6 titik). Air terjun & sungai antar-ketinggian (P1-13) dibangun di atas ini.

### ADR-027 · Strategi rilis: langsung maksimal; cadangan v1 = 15 warga + peta luas (keputusan user, 2026-11-25)
- **Status**: Diterima
- **Konteks**: user tidak mau rilis bertahap yang setengah jadi ("rilis langsung maksimal"). Versi v0.x di TODO adalah tonggak internal untuk dicoba berdua, bukan rilis.
- **Keputusan**: rilis publik = **v1.0 lengkap** (±25 warga hidup penuh, semua area & fitur). **Cadangan** bila terpaksa rilis lebih awal: v1 minimal **15 warga** + **peta sudah luas**, lalu v2 langsung lengkap. Pengerjaan warga tetap berurutan (inti dulu), tanpa mengurangi target akhir.
- **Alasan**: kualitas & rasa "dunia hidup" lebih penting dari cepat rilis; tonggak internal tetap ada supaya masukan user bisa masuk tiap fase.
- **Konsekuensi**: target NPC di `18` = 25 (bukan 20–25); potret warga diputuskan AI: **pixel art 64×64, 5 ekspresi** (biasa, senang, sedih, kaget, marah).

### ADR-028 · Keluarga ditampilkan apa adanya, anak opsional, rumah penuh kucing (keputusan user, 2026-11-25)
- **Status**: Diterima
- **Konteks**: konten keluarga & anak menyentuh hal pribadi pemain. Game ini hadiah, jadi harus terasa aman & menghargai pilihan, bukan menggiring.
- **Keputusan**: (1) keluarga NPC pemain ditampilkan sesuai data personal dengan hangat (boleh tinggal terpisah), tanpa memaksakan gambaran ideal; (2) punya anak **sepenuhnya opsional** & hanya bila keduanya memilih, tanpa desakan dari NPC/quest; jalur tanpa anak setara; (3) **rumah penuh kucing**: beli kucing (langsung diberi nama) atau bawa pulang kucing kampung (diberi nama setelah meter Nyaman penuh).
- **Alasan**: pemain harus merasa dilihat & aman; pilihan hidup tetap milik pemain.
- **Konsekuensi**: docs `12` §7, `17`, `18` diperbarui; task baru P3-11b; P14-01 diberi syarat opsional. Detail pribadi tetap di `personal/` (tidak di repo).

### ADR-029 · Hemat Vercel: aset berversi + bersih-bersih deploy otomatis (keputusan user, 2026-11-25)
- **Status**: Diterima
- **Konteks**: jatah Vercel (jumlah deploy, bandwidth, request) terbatas; riwayat deploy menumpuk tiap push. Aset di `public/assets/` tidak ber-hash, sehingga cache 1 hari pernah membuat browser user memakai `ground.png` lama (jalan tampak hitam/biru).
- **Keputusan**: (1) semua aset game dimuat lewat `assetUrl()`/`versioned()` (`src/core/assetUrl.ts`) dengan `?v=<hash isi public/assets>` (dihitung saat build di `vite.config.ts`); `vercel.json` memberi URL berversi `Cache-Control: immutable` 1 tahun, URL tanpa versi tetap 1 hari + SWR; (2) job deploy CI menjalankan `scripts/vercel-prune.ts` setelah smoke test lolos: simpan **3 production** (termasuk target rollback) & **2 preview** READY terbaru, hapus sisanya, deploy yang sedang dibangun tidak disentuh.
- **Alasan**: aset hanya diunduh ulang kalau benar-benar berubah, tanpa risiko cache basi; jumlah deploy tetap kecil tanpa langkah manual.
- **Konsekuensi**: aset baru wajib dimuat lewat `assetUrl()`; smoke test deploy memeriksa `?v=` & header `immutable`; E2E memeriksa semua request aset berversi.

### ADR-030 · Grafik bergaya Animal Crossing: New Horizons (keputusan user, 2026-11-26)
- **Status**: Diterima. **Mengganti** ADR-022 poin 3 (render resolusi rendah ala PS1, tekstur nearest) dan bagian "render ala PS1" ADR-024/025. Logika game, Command, UI, multiplayer tidak berubah.
- **Konteks**: User menilai tampilan sekarang murahan: dunia kotak-kotak "kayak Minecraft", terlalu pixel. Rumusan final user: **gameplay Harvest Moon: Back to Nature + perpaduan The Sims & GTA + grafik Animal Crossing: New Horizons** ("benar-benar seperti ACNH, bukan versi sederhana"). Pengukuran awal (P1B-01, Chromium headless/GPU perangkat lunak, resolusi internal 426×240): Lembang 488 draw call/16 rb segitiga, **Buahbatu 1.092 draw call** → 37 fps desktop, 27 fps profil HP; sandbox 226 draw call → 60 fps. Beban utama = jumlah draw call (banyak mesh kecil terpisah), bukan segitiga.
- **Keputusan**:
  1. **Gaya**: low-poly **bulat & empuk** bergaya ACNH: material toon lembut + *rim light*, tekstur halus bergaya lukis (filter linear + mipmap), palet hangat-saturasi; karakter **chibi bulat ekspresif** (mata/mulut berganti, emote). Inspirasi gaya saja: semua model, karakter, & desain orisinal/berlisensi bebas, **tanpa aset atau desain Nintendo**.
  2. **Renderer**: resolusi penuh (`devicePixelRatio` dibatasi per tingkat kualitas) + anti-aliasing; pencahayaan per jam (color grading pagi/siang/sore/malam), bayangan lembut, **SSAO**, **bloom** halus, **tilt-shift** ringan, kabut atmosferik, langit gradasi.
  3. **Lengkung dunia** (shader vertex, hanya tampilan; logika tetap datar): default **Halus**, pilihan Kuat/Halus/Mati di pengaturan; otomatis lebih datar saat berkendara/di titik pemandangan. Tiga render pembanding disiapkan di P1B-02 untuk dipilih user. *(P1B-02c: user memilih **Halus** sebagai bawaan setelah melihat render Kuat/Halus/Mati. Pelaksanaan: shader menekuk posisi dunia ke bawah sebanding kuadrat jarak dari titik fokus kamera, terutama searah pandang (`src/render/curve.ts`); bayangan & logika tetap datar; interior otomatis datar; bidang/kotak panjang dipecah per 2 m (`src/render/segments.ts`) supaya melengkung mulus. Pengaturan grafis (Kualitas/Efek/Lengkung) di menu ⚙, tersimpan di perangkat, berlaku tanpa muat ulang.)*
  4. **Tingkat kualitas** otomatis (Rendah/Seimbang/Tinggi) dari kemampuan perangkat + FPS terukur; pengguna bisa ganti. *(Mode Retro pixel sempat direncanakan lalu **dihapus** atas keputusan user 2026-11-26: tidak sejalan dengan arah modern; HP lemah ditangani tingkat Rendah + resolusi dinamis.)*
  5. **Anggaran performa** (wajib, diukur tes P1B-11): ≤ **200 draw call** & ≤ 400 rb segitiga terlihat di tingkat Seimbang; geometri statis **digabung per chunk & per material**, objek berulang (rumput, bunga, pohon, pagar) memakai **instancing**; efek pasca-proses di resolusi setengah pada Rendah/Seimbang. Target tetap 60 fps laptop, ≥ 30 fps HP menengah.
  6. **UI**: tetap hangat (kayu/krem), tetapi font utama bersih & mudah dibaca; font pixel hanya aksen (logo, judul kecil).
  7. **Dependensi** yang diizinkan untuk P1B-02 (disebut alasannya di laporan task): `postprocessing` (pmndrs, MIT; komposisi efek lebih efisien dari EffectComposer bawaan) dan `n8ao` (MIT; SSAO cepat). Tanpa dependensi lain tanpa ADR. *(Terpasang di P1B-02b: `postprocessing` 6.39, `n8ao` 2.1. Catatan pelaksanaan: shader internal n8ao memakai `textureLod` eksplisit supaya tidak memunculkan peringatan kompilator HLSL X3595 di Chrome Windows; tilt-shift dimatikan di interior karena pemain tidak di tengah layar; efek mati bawaan di build tes, lihat `50` §2.)*
- **Alasan**: memenuhi rumusan user; draw call yang sudah tinggi di resolusi kecil membuktikan batching/instancing wajib sebelum menaikkan resolusi & efek.
- **Konsekuensi**: hampir semua snapshot visual dibuat ulang; `NearestFilter`/render target kecil dihapus; aset bertahap diganti (P1B-07) & karakter baru (P1B-08); docs `00`, `01`, `02` §9, `42` direvisi. Fase **P1B** (11 task) dikerjakan sebelum P2.

### ADR-031 · Medan bebas grid: dunia dari bentuk vektor, grid hanya untuk logika (keputusan user, 2026-11-26)
- **Status**: Diterima. **Mengganti** ADR-022 poin 4 (peta grid Tiled `.tmj` sebagai bentuk dunia) dan model undakan per petak ADR-026; konsep bukit/lembah landai ADR-026 tetap ada sebagai bentuk vektor.
- **Konteks**: tepi air, tebing, sungai, & danau yang mengikuti petak 1×1 terlihat kotak. User: "gamau kayak minecraft". Bertani ala HM tetap butuh petak.
- **Keputusan**:
  1. **Pengarangan dunia** di skrip TypeScript (`scripts/world/`) berupa **bentuk vektor**: garis pantai pulau (poligon), dataran (poligon + tinggi + jenis tepi: lereng rumput / tebing batu alami), bukit/lembah, **sungai** (garis lengkung + lebar & kedalaman per titik + arah alir), **danau/kolam** (poligon), jalan & setapak (garis + lebar + material), zona biome, objek (bangunan, prop, spawn, pintu, jembatan, air terjun).
  2. **Pemanggang** (`npm run world`) menghasilkan data per chunk: **heightfield halus** (sel 0,5 m), bobot material tanah (splat), permukaan & bentuk air, **grid logika 1 m** (bisa dilewati, kedalaman air, bisa ditanami, jenis tanah), daftar objek. Format data divalidasi zod & dites.
  3. **Runtime**: API logika tetap (`elevation`, `standHeight`, `walkLevel`, `waterAt`, `bodyBlocked`) tetapi membaca heightfield/grid logika chunk, jadi gameplay lama tetap jalan. Kemiringan > batas = tidak bisa didaki; tebing batu tetap pembatas alami.
  4. **Grid tidak terlihat**: muncul sebagai overlay halus hanya saat memegang alat/benih/mode dekor. Ladang tetap petak 1 m.
  5. **Air**: sungai & danau digambar dari bentuknya (tepi lengkung landai, berpasir/berbatu, buih tepi); **sungai tidak boleh buntu** (bermuara ke sungai lain, danau, atau laut); air terjun = titik pada sungai yang menurun tajam; jembatan diletakkan pada garis jalan yang memotong sungai.
  6. **Hiasan alam** (batu, rumput tinggi, alang-alang, teratai, bunga) disebar otomatis menurut aturan tempat (tepi air, kaki tebing, padang) + bisa diletakkan manual.
  7. Tiled `.tmj`, atlas tanah petak, objek `hill`/`waterfall`/`bridge` versi petak dipensiunkan setelah migrasi (P1B-10); tes aturan peta dipindah ke format baru.
- **Alasan**: tampilan organik tanpa kehilangan gameplay petak; vektor mudah diubah & dites; data per chunk cocok untuk dunia pulau (ADR-032).
- **Konsekuensi**: pipeline peta, mesh tanah, air, & tes peta ditulis ulang (P1B-04/05/06/10); `docs/10` §6 diganti spesifikasi format baru saat P1B-04.

### ADR-032 · Dunia satu pulau tanpa loading (keputusan user, 2026-11-25/26)
- **Status**: Diterima. Menggantikan model "area luar terpisah + transisi tepi peta" (`10` §1, P1-09) untuk dunia luar; **interior tetap** scene terpisah dengan transisi (P1-09b).
- **Konteks**: user ingin dunia luar menyambung tanpa loading (dua pemain di tempat berbeda tidak terasa sepi; bisa saling susul), berbentuk **pulau** tanpa ujung jalan; batas dunia = pantai & laut; **sungai besar penghubung antar desa** yang bermuara ke laut.
- **Keputusan**:
  1. **Satu koordinat dunia** (meter). Desa/daerah (Buahbatu, Lembang, Dago, Braga, Cihampelas, Ciwidey, Tangkuban, dst.) = **wilayah** di pulau yang sama, jaraknya Bandung **dipadatkan**.
  2. **Chunk** 64 × 64 m. Dimuat otomatis di sekitar pemain lokal (cincin 3×3, chunk jauh versi LOD sederhana/tersembunyi kabut & lengkung dunia), dibuang dengan LRU; pramuat ke arah gerak. Pasangan di chunk lain disimulasikan sebagai data & tampil di peta/minimap.
  3. **Batas dunia**: pantai berpasir → laut dangkal → laut (tidak bisa diseberangi kecuali nanti kapal); tidak ada tembok tak terlihat di darat.
  4. **Air**: jaringan sungai menyambung; satu **sungai besar** membelah pulau menghubungkan desa (dilintasi jembatan), semuanya bermuara ke laut atau danau.
  5. **Pintu** bangunan tetap memindahkan ke interior; objek `edge` antar area dihapus.
  6. Multiplayer (P6) memakai koordinat dunia + id chunk untuk interest management.
- **Alasan**: pengalaman ala GTA/HM tanpa layar loading, lebih hidup untuk berdua.
- **Konsekuensi**: streaming chunk & LOD (P1B-09), migrasi peta Lembang/Buahbatu/sandbox jadi pulau awal (P1B-10), sistem transisi tepi dipensiunkan; desain multiplayer `30` & simulasi area `02` §9 disesuaikan saat task terkait. Jarak & tata letak kasar pulau dibuat di P1B-09, peta final per desa tetap di P12.

### ADR-033 · Konten personal masuk repo publik (keputusan user, 2026-11-26)
- **Status**: Diterima. **Mengganti** bagian "Tetap berlaku" ADR-010 dan aturan `AGENTS.md` §5 tentang konten personal.
- **Konteks**: user ingin semua konten personal (nama lengkap, panggilan, tempat, tanggal, kenangan, foto, audio) masuk repo supaya tidak repot ("biar gak PR"). Repo tetap **publik** demi menit GitHub Actions tanpa batas (CI/E2E ±100 menit per task; jatah repo privat gratis 2.000 menit/bulan). User sudah diberi tahu risikonya: isi repo publik & URL deploy bisa dibaca siapa pun, termasuk orang yang mengenal kalian, dan riwayat git tidak bisa ditarik kembali.
- **Keputusan**: (1) `src/content/personal/` **di-commit** (tidak lagi di `.gitignore`); `personal.example/` tetap sebagai contoh/fallback. (2) Prinsip minimal: yang di-commit hanya yang **dipakai game** (nama, panggilan, tempat, tanggal, kenangan, dialog, media untuk cutscene/album); detail sensitif yang tidak dibutuhkan cerita tidak ditulis. (3) **Rahasia tetap tidak boleh** masuk repo (token, kunci, password; gitleaks tetap aktif). (4) Mengubah repo ke privat saat final (ADR-010) tetap rencana.
- **Alasan**: keputusan pemilik data; mengurangi pekerjaan manual menyalin file personal antar perangkat & ke CI.
- **Konsekuensi**: `AGENTS.md` §5 & `docs/43` §1 diperbarui; build boleh memuat konten personal (game dimainkan lewat URL publik). Teman/keluarga asli tetap **minta izin** sebelum nama/sifatnya dipakai (`43`).

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
