# 10 · Dunia: Bandung

## 1. Konsep
Bandung versi pixel yang hangat dan sedikit "fantasi" (ada 4 musim, salju tipis di musim dingin). Dunia dibagi menjadi **area** yang saling terhubung, seperti Harvest Moon: jalan ke ujung peta/pintu → layar fade → masuk area lain.

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

Gaya: LPC 32px, palet hangat, ikuti `42-aset-lisensi.md`.

## 6. Konvensi Tiled (WAJIB)
- Tile size: **32×32**. Ukuran area outdoor: 60×40 sampai 100×70 tile.
- Format export: **JSON (.tmj)** → `public/assets/maps/<areaId>.tmj`.
- Urutan layer:

| Layer | Tipe | Isi |
|---|---|---|
| `Ground` | tile | tanah, rumput, jalan |
| `GroundDetail` | tile | bunga kecil, retakan, garis jalan |
| `Farmable` | tile | penanda tile yang bisa dicangkul (properti `farmable=true`) |
| `Decor` | tile | pagar, semak (di bawah karakter) |
| `Above` | tile | atap, tajuk pohon (di atas karakter) |
| `Collision` | object | rectangle/polygon tabrakan |
| `Objects` | object | spawn, pintu, interactable, zona |

- Properti objek di layer `Objects`:

| `type` | Properti wajib |
|---|---|
| `spawn` | `id` |
| `door` | `targetArea`, `targetSpawn` |
| `edge` | `targetArea`, `targetSpawn` (transisi ujung peta) |
| `interact` | `action` (misal `shop:seed_shop`, `bed`, `shipping_bin`, `board`) |
| `npc_anchor` | `id` (titik referensi jadwal NPC) |
| `zone` | `name` (misal `fishing:river`, `music:cafe`) |
| `road` | — (area yang bisa dilewati kendaraan) |
| `bus_stop` | `stopId` |

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
