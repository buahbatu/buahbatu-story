# 10 · Dunia: Bandung

## 1. Konsep
Bandung versi 2.5D low-poly (ala Back to Nature) yang hangat dan sedikit "fantasi" (ada 4 musim, salju tipis di musim dingin). Dunia dibagi menjadi **area** yang saling terhubung, seperti Harvest Moon: jalan ke ujung peta/pintu → layar fade → masuk area lain.

## 2. Daftar Area

### Area awal (v1)
| ID | Area | Fungsi utama | Isi penting |
|---|---|---|---|
| `lembang` | **Lembang** | Pertanian & peternakan | Kebun Warga (plot sewa), peternakan sapi perah, toko bibit, rumah Kang Asep (mentor) |
| `dago` | **Dago** | Hunian & kencan | Kos Pemain A, kafe bukit (city light malam), Tahura (hutan, mancing sungai, serangga) |
| `buahbatu` | **Buahbatu** ⭐ | Kampung halaman Michelle (Pemain B) | Rumah keluarga Michelle (start Pemain B), deretan jajanan & kafe Jl. Buahbatu, taman kompleks, warung langganan, tempat-tempat masa kecil Michelle (`43`) |
| `cihampelas` | **Cihampelas** | Belanja baju | Deretan toko jeans/outlet, jalan layang (skywalk) |
| `braga` | **Braga** | Pusat kota & kerja | Kafe tempat kerja barista, galeri, toko perhiasan (cincin), toko furnitur, bank |
| `gedung_sate` | **Gedung Sate & Gasibu** | Balai kota & festival | Lapangan festival, kantor kelurahan, Museum Geologi (donasi), pasar minggu Gasibu |
| `alun_alun` | **Alun-alun & Asia-Afrika** | Sosial & transport | Papan permintaan warga, halte angkot utama, Gedung Merdeka, jajanan malam |

### Area lanjutan (dibuka lewat progres / Proyek Revitalisasi)
| ID | Area | Fungsi | Cara buka |
|---|---|---|---|
| `pasar_baru` | Pasar Baru | Penjahit, kain, bahan masak murah | Bab 2 cerita |
| `ciwidey` | Ciwidey · Kebun Teh · Kawah Putih | Kencan, petik stroberi, lamaran | Proyek "Ciwidey Asri" |
| `situ_patenggang` | Situ Patenggang | Mancing danau, perahu, legenda cinta | Proyek "Ciwidey Asri" |
| `tangkuban` | Tangkuban Perahu | Eksplorasi gua kawah (mineral, fosil) | Proyek "Kawah Lestari" |
| `udjo` | Saung Angklung Udjo | Minigame ritme angklung, festival musik | Proyek "Angklung Lestari" |
| `kampus` | Kawasan Kampus | Karier pendidikan, perpustakaan | Tahun 1 Gugur |
| `sekolah` | Sekolah (TK/SD) | Sekolah anak | Saat punya anak |
| `bulan_madu` | Pantai (one-off) | Bulan madu | Setelah menikah |
| `personal_*` | **Tempat asli kalian** | Kenangan | Lihat `43-konten-personal.md` |

## 3. Peta Hubungan Area
```
                 [tangkuban]
                      │
 [ciwidey]──angkot──[lembang]───────[dago]──────[kampus]
     │                               │
[situ_patenggang]              [cihampelas]
                                     │
       [pasar_baru]──[alun_alun]──[braga]──[gedung_sate]
                          │                     │
                    (halte angkot pusat)   [buahbatu] ⭐
```

### ⭐ Buahbatu: area spesial
Buahbatu adalah **area paling personal** di game, karena judul game diambil dari sini.
- **Rumah keluarga Michelle**: tempat start Pemain B. Kamarnya bisa didekor, dan orang tua Michelle muncul sebagai NPC (`18`).
- **Jajanan & kafe Jl. Buahbatu**: lokasi kencan kuliner (alternatif Alun-alun) dan quest "cobain semua jajanan langganan Michelle".
- **Tempat masa kecil Michelle**: sekolah, taman, dan warung langganan diisi dari kuesioner (`43`). Tiap tempat menyimpan kenangan rahasia.
- **Event "Main ke Rumah"** (tahap PDKT/Pacaran): Pemain A pertama kali berkunjung ke rumah Michelle dan ketemu orang tuanya.
- **Event "Minta Restu"** (syarat lamaran, `16` & `19`): ngobrol serius dengan orang tua Michelle di Buahbatu.
- Detail bangunan & jalan mengikuti suasana asli Buahbatu sebisa mungkin. Pakai foto referensi dari Michelle.
- Jalan kaki antar area yang bersebelahan.
- **Angkot** dari halte untuk fast travel berbayar (lihat `14-properti-kendaraan.md`).
- Kendaraan pribadi mempercepat gerak di jalan raya.

## 4. Interior
| Interior | Area |
|---|---|
| Kamar kos A | Dago |
| Rumah keluarga Michelle (kamar B, ruang tamu, dapur) | Buahbatu |
| Rumah Kang Asep, kandang, toko bibit | Lembang |
| Kafe Braga, bank, toko furnitur, toko perhiasan, galeri | Braga |
| Toko baju (3 toko) | Cihampelas |
| Museum Geologi, kantor kelurahan | Gedung Sate |
| Kontrakan → rumah → rumah impian | Bisa dibeli/dibangun di Lembang/Dago (lihat `14`) |
| Gua lantai 1–20 | Tangkuban |

## 5. Landmark yang Digambar Custom
Gedung Sate · Jalan Braga (fasad kolonial + lampu jalan) · Gedung Merdeka · Masjid Raya/alun-alun (taman rumput sintetis) · Kebun teh · Kawah Putih (air hijau toska) · Tangkuban Perahu · Skywalk Cihampelas · Saung Angklung Udjo.

Gaya: 2.5D low-poly + tekstur pixel, palet hangat, ikuti `42-aset-lisensi.md` (ADR-022).

### Aturan detail peta (permintaan user, 2026-11-24)
- **Peta luas dan detail**, bukan petak kosong. Setiap area punya **identitas visual sendiri** (palet, material jalan/atap, vegetasi, properti jalanan) sehingga pemain langsung tahu sedang di mana. Contoh: Lembang = kayu, kebun, kabut; Braga = fasad kolonial krem, lampu jalan kuning, trotoar batu; Buahbatu = rumah kompleks, warung, gerobak jajanan.
- **Setiap bangunan berbeda.** Tidak ada bangunan "copy-paste": bentuk, warna, atap, pintu/jendela, papan nama, dan detail depan (pot, sepeda, jemuran, kursi) divariasikan. Kalau memakai komponen modular, kombinasinya harus unik per bangunan.
- Detail kecil yang membuat hidup: tanda jalan, tiang listrik, pot bunga, gerobak, kucing liar, bayangan pohon.
- **Nama tempat (ADR-023)**: nama jalan, landmark, dan kafe/warung/toko lokal memakai **nama asli** (data OpenStreetMap + cek manual); merek besar/waralaba memakai **plesetan** (contoh: SPBU "Pertamani", minimarket "Alfamurah"/"Indomart-mart", kopi waralaba "Starbaks"). Bentuk bangunan bebas.
- Konsekuensi: kebutuhan art besar; dikerjakan bertahap per area (P1-02 prototipe, P12 & P15 final) dan bergantung pada keputusan gaya grafik (`42`).

## 6. Konvensi Peta (WAJIB)
Peta digambar di **Tiled** sebagai denah 2D, lalu dibangun jadi dunia 3D low-poly (ADR-022). Satu tile = 1 satuan dunia 3D.
- Tile size: **16×16** (`TILE_PX` di `src/config/world.ts`). Ukuran area outdoor: 60×40 sampai 100×70 tile.
- Format: **JSON (.tmj)** → `public/assets/maps/<areaId>.tmj`, tileset **embedded** (bukan `.tsx` terpisah). File bisa langsung dibuka & diedit di Tiled.
- Validasi: `parseArea` (`src/world/map/logic.ts`, skema zod `schema.ts`) dan `tests/maps.test.ts` memeriksa **semua** peta di repo (urutan layer, ukuran data, properti wajib, tileset ada, tujuan pintu ada, model prop dikenal). Peta yang melanggar → tes gagal.
- Urutan layer (persis, `MAP_LAYERS`):

| Layer | Tipe | Isi |
|---|---|---|
| `Ground` | tile | jenis permukaan; **setiap** tile wajib punya properti `terrain` (`grass`, `grass_flowers`, `dirt`, `path`, `tilled`, `sand`, `water`, `stone`, `wood_floor`, `cliff`). `water` otomatis tidak bisa dilewati |
| `Height` | tile | ketinggian dataran: tile berproperti `height` = 1/2/3 (× `HEIGHT_STEP` 1 satuan = setinggi 1 tile); kosong = 0. Beda tinggi jadi tebing |
| `Farmable` | tile | penanda tile yang bisa dicangkul (properti `farmable=true`) |
| `Collision` | object | rectangle tabrakan (bangunan, batang pohon, batu) |
| `Objects` | object | spawn, pintu, interactable, zona, **prop 3D** |

- Layer `GroundDetail`, `Decor`, `Above` dari konsep 2D dihapus: hiasan & benda tinggi kini jadi **prop 3D** (objek `prop`), dan "di atas karakter" ditangani kedalaman 3D.
- Properti objek di layer `Objects` (`OBJECT_RULES`):

| `type` | Properti wajib |
|---|---|
| `spawn` | `id` (unik; minimal satu per peta) |
| `door` | `targetArea`, `targetSpawn` |
| `edge` | `targetArea`, `targetSpawn` (transisi ujung peta) |
| `interact` | `action` (misal `shop:seed_shop`, `bed`, `shipping_bin`, `board`) |
| `npc_anchor` | `id` (titik referensi jadwal NPC) |
| `zone` | `name` (misal `fishing:river`, `music:cafe`) |
| `road` | — (area yang bisa dilewati kendaraan) |
| `bus_stop` | `stopId` |
| `prop` | `model` ∈ `PROP_MODELS` (lihat tabel prop di bawah); opsional `rotation` (derajat) |

- Posisi objek titik (point) = pusat prop/spawn. Satuan dibaca dalam tile.
- Atlas tanah placeholder: `public/assets/tilesets/ground.png` (8×3 tile 16px, buatan sendiri; id 14 `asphalt`, 15 `paving`, 16 `ceramic`, 17 `carpet`); diganti aset final di P12/P15.
- **Properti peta** (Map Properties di Tiled, opsional): `sky`, `fog` (warna hex), `fogNear`, `fogFar` untuk suasana area (mis. Lembang berkabut), `cameraDistance`, dan `interior` (bool).
- **Interior**: peta seukuran ruangan; prop `room` (`w`, `d`, `wallColor`, `trim`) di tengah peta membangun dinding belakang & samping di luar tepi peta (dinding depan sengaja tidak ada, ala BTN), sekat `partition` (`length`, `rotation`). Latar gelap, tanpa tanah lanjutan, kamera melihat seluruh ruangan (pusat peta, sedikit ke belakang). Lantai: `wood_floor`, `ceramic` (keramik), `carpet`.
- **Daftar area** `AREA_IDS` (`src/config/world.ts`): setiap file peta wajib terdaftar. Pintu/tepi boleh menuju area yang belum dibuat asalkan terdaftar; kalau petanya sudah ada, `targetSpawn` wajib ada di sana (dicek `tests/maps.test.ts`).
- **Generator peta prototipe**: `npm run maps` (`scripts/maps/`: `atlas.ts`, `lib.ts` `MapBuilder`, satu file per area). Selama prototipe, ubah peta lewat generatornya; kalau sebuah peta mulai diedit manual di Tiled, hapus generatornya supaya tidak tertimpa.

| Model prop | Properti opsional |
|---|---|
| `building` | `w`, `d`, `floors` (1–2), `wall` (`planks`/`plaster`/`brick`/`bamboo`), `wallColor` (plester), `roof` (`gable`/`hip`/`flat`; datar dapat toren), `roofColor`, `zinc` (atap seng), `trim`, `doorColor`, `doorX`, `windows`, `shutters`, `awning` (warna kanopi belang), `sign` (kunci i18n), `signColor`, `porch`, `bars` (teralis jendela), `ac` (unit AC di dinding samping). Otomatis: lisplang, talang + pipa turun (kecuali seng), bubungan atap perisai; rumah berdinding plester/bata tanpa kanopi toko dapat roster di atas pintu & jendela, kotak meteran PLN, dan kanopi beton di atas pintu (kalau tanpa teras) |
| `farmhouse` | — (rumah pertanian detail, layar judul & sandbox) |
| `tree`, `pine`, `rock` | `scale` (varian model & putaran dipilih deterministik dari posisi) |
| `bush` | `scale`, `flowers` (warna) |
| `fence` | `length`, `style` (`wood`/`bamboo`/`wall` tembok kompleks) |
| `strawberry_plot` | `cols`, `rows` |
| `stairs` | `w`, `d` (tapak di tanah bawah), `dir` (`n`/`s`/`e`/`w` arah naik), `rise` (jumlah tingkat); tinggi pijakan naik bertahap di atas tapaknya |
| `pot` | `flower` (warna) |
| `food_cart` | `color`, `label` (kunci i18n) |
| `sign` | `text` (kunci i18n), `color` |
| `haystack`, `bench`, `street_lamp`, `power_pole` (tiang PLN custom) | — |
| `room`, `partition` | lihat Interior |
| `wall_window` | `curtain` (warna gorden) |
| `wall_frame`, `bed`, `wardrobe`, `chair`, `sofa` | `color` |
| `rug` | `w`, `d`, `color` |
| `desk`, `tv`, `coffee_table`, `bookshelf`, `kitchen`, `fridge`, `dining_table`, `vanity` | — |

- **Tampilan ala PS1 (P1-04b)**: bayangan matahari (`SHADOW`, shadow map dasar yang tajam, mengikuti kamera), air = **cekungan** sedalam `WATER_DEPTH` dengan tepi menurun + **permukaan transparan beriak** (`WATER`, mesh `water`, riak bergerak pelan), tanah alami = rotasi tekstur acak per petak untuk tanah organik + variasi terang tipis + **rumput 3D** (instanced, deterministik per petak, tidak di petak terhalang). Semua angka di `config/world.ts`.
- **Aset 3D CC0 (P1-04c, ADR-025)**: `tree`, `pine`, `bush`, `rock`, `fence` (kayu/bambu), `pot`, `street_lamp` dan **perabot interior** (P1-04d, tabel `FURNITURE`: tiap perabot = bagian model Kenney Furniture Kit dengan ukuran tapak tetap, warna kain/kayu dari properti `color`) memakai model Kenney (`public/assets/models/`), dipramuat per peta (`PROP_ASSETS`), material Lambert berwarna alami + tekstur pixel proyek (`ASSET_LOOK`), ukuran diseragamkan. Tetap custom: tembok kompleks, tiang PLN, gerobak, papan nama, petak stroberi, jerami (sampai P3), dinding ruangan/sekat/jendela/bingkai foto, bangunan (P1-04e).
- **Tabrakan (P1-05)**: badan pemain kotak ±`PLAYER.radius` (`balance.ts`). Terhalang oleh: kotak layer `Collision` (generator: `building`, `item`, `solid`, `tree`, `fence` otomatis menambah kotak), petak air, tepi peta, dan **beda tinggi pijakan > `PLAYER.maxStep`** (tebing tidak bisa dipanjat/diturun; pakai prop `stairs`). Gerak dipecah langkah ≤0,1 supaya tidak menembus pagar tipis, dan meluncur sepanjang dinding saat diagonal. Spawn wajib di tempat bebas (dicek `tests/maps.test.ts`).
- **Pemain tetap terlihat (P1-05)**: prop yang memotong garis kamera → dada/kepala pemain dipudarkan transparan (`OCCLUSION`, `src/world/occlusion.ts`), kembali pelan saat tidak menutupi; `room`, `rug`, `stairs` tidak ikut.
- **Papan nama**: teks dari i18n (`sign.*`), **maksimal ±10 huruf** supaya terbaca di resolusi rendah (font Press Start 2P 8px, papan dimiringkan menghadap kamera). Nama panjang → papan berdiri (`sign`) yang lebih lebar.
- Peta prototipe yang ada: `sandbox` (40×30), `lembang` (48×36), `buahbatu` (44×34), interior `kos_a` (7×6) & `rumah_michelle` (15×9: kamar Michelle, ruang tamu, dapur).

## 7. Atmosfer per Area
| Area | Musik | Ambience | Ciri khas |
|---|---|---|---|
| Lembang | Akustik santai | Ayam, sapi, angin | Kabut pagi |
| Dago | Lo-fi | Burung, sungai Tahura | City light malam |
| Braga | Jazz kafe | Keramaian, langkah kaki | Lampu jalan kuning |
| Cihampelas | Pop ceria | Pengamen, motor | Ramai siang |
| Buahbatu ⭐ | Akustik hangat (tema Michelle) | Kompleks rumah, anak main, tukang jualan lewat | Lampu teras sore, wangi jajanan malam |
| Gedung Sate | Orkestra ringan | Burung merpati | Festival |
| Alun-alun | Angklung modern | Anak-anak main | Jajanan malam |
