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
| `prop` | `model` ∈ `PROP_MODELS` (`farmhouse`, `tree`, `fence`, `strawberry_plot`); opsional `rotation` (derajat), `scale`, `length` (pagar) |

- Posisi objek titik (point) = pusat prop/spawn. Satuan dibaca dalam tile.
- Atlas tanah placeholder: `public/assets/tilesets/ground.png` (8×2 tile 16px, buatan sendiri); diganti aset final di P12/P15. Peta uji: `sandbox` (40×30).

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
