# 14 · Properti, Dekor, Kredit & Kendaraan

## 1. Tangga Hunian
| Tahap | Hunian | Cara | Kapasitas dekor |
|---|---|---|---|
| 1 | **A**: kamar kos di Dago · **B (Michelle)**: kamarnya di rumah keluarga di Buahbatu | A: sewa Rp100 rb/minggu · B: gratis, tapi ada "tugas rumah" kecil dari Mamah (quest harian ringan) | 1 ruang kecil |
| 2 | Kontrakan | Sewa Rp400 rb/minggu | 2 ruang |
| 3 | Rumah tipe 36 | Beli / KPR | 3 ruang + halaman |
| 4 | Rumah 2 lantai | Beli / KPR / renovasi | 6 ruang + kebun |
| 5 | **Rumah Impian** | Bangun di tanah sendiri | Bebas (layout custom) |

- Sebelum menikah, masing-masing punya hunian sendiri (bisa saling **berkunjung**: ketuk pintu, lalu yang punya rumah menerima atau menolak).
- Setelah menikah: pilih tinggal di salah satu hunian atau beli rumah baru bersama.
- Rumah lama bisa **disewakan** (pendapatan pasif) atau dijual.

## 2. Mode Dekor (ala Sims)
- Masuk lewat HP → app **Rumahku** atau dengan menekan tombol `B` di dalam rumah sendiri.
- **Grid 32px**, furnitur punya ukuran (1×1, 2×1, 2×2, …) dan 4 arah rotasi.
- Fitur: pindah (**drag & drop** dengan mouse atau jari, atau tombol), putar, simpan ke gudang, jual kembali (refund 50%), **undo/redo** (tanpa batas selama sesi dekor).
- Ganti **wallpaper / cat dinding & lantai per ruangan**.

### Build Mode (P13-04b, keputusan user 2026-11-25)
- Hanya di rumah **milik sendiri** (rumah tipe 36 ke atas & Rumah Impian), bukan kos/kontrakan.
- Gambar & hapus **dinding** di grid, bentuk ruangan baru, pasang/pindah **pintu & jendela**; biaya per segmen dinding dipotong dari dompet.
- Batas: luas tanah/lantai rumah; furnitur yang terhalang dinding baru otomatis masuk gudang.

### Renovasi lewat Tukang (P13-04c)
- Jalur gampang ala HM: pesan ke **Mang Engkos** → pilih paket (tambah kamar, dapur, kamar mandi, lantai 2) → bayar tunai atau kredit → selesai 2–7 hari game.
- Paket renovasi memakai template denah yang rapi; setelah jadi tetap bisa diubah lewat Build Mode.
- Katalog dari Toko Furnitur Braga, toko online, hadiah quest, dan crafting.
- **Berdua**: keduanya bisa mendekor bersamaan; perubahan muncul realtime. Item yang sedang dipegang seseorang dikunci untuk pemain lain.

### Skor Rumah
| Skor | Dari | Efek |
|---|---|---|
| **Nyaman** | Kasur, sofa, karpet | Bonus energi saat tidur |
| **Indah** | Dekorasi, tanaman, lukisan | Moodlet "Rumah Cantik" |
| **Fungsional** | Dapur, meja kerja, TV | Membuka aksi (masak, kerja remote) |

Furnitur khusus membuka aksi: **dapur** (masak), **TV** (cuaca, resep), **meja kerja** (freelance), **rak buku** (skill), **ranjang bayi** (anak), **foto bingkai** (menampilkan foto dari album kenangan).

## 3. Tanah
- Plot tanah dijual di **Lembang** (pertanian) dan **Dago** (hunian).
- Tanah pertanian: memperluas kebun (16×16 → 32×32 → …), lalu bangun kandang, greenhouse, dan gudang.
- Tanah hunian: lokasi **Rumah Impian** (pilih template denah atau custom).
- Konstruksi oleh tukang (NPC Mang Engkos) butuh waktu 2–7 hari game.

## 4. Kredit
### Aturan umum
| Jenis | DP min | Tenor (minggu game) | Bunga flat total |
|---|---|---|---|
| Kredit motor | 20% | 4–12 | 5–10% |
| Kredit mobil | 25% | 8–24 | 8–15% |
| KPR rumah | 20% | 12–48 | 10–20% |
| Kredit tanah | 30% | 8–24 | 8–15% |

- Bunga bergantung pada **Skor Kepercayaan Bank** (A–E).
- **Cicilan otomatis** setiap Senin 06:00 dari dompet (dompet bersama setelah menikah).
- **Saldo kurang?** Tidak ada penyitaan:
  - Masuk surat teguran lucu dari Pak Dadang 📨
  - Denda kecil 2% dari cicilan
  - Skor turun 1 tingkat setelah 2 kali telat
  - Pelunasan cepat dapat diskon bunga + skor naik
- Semua perhitungan di `systems/bank/logic.ts` dan **wajib** ada unit test.

## 5. Kendaraan
| Kendaraan | Kecepatan | Penumpang | Harga contoh | Catatan |
|---|---|---|---|---|
| Jalan kaki | 1× | — | — | |
| Sepeda | 1,5× | 1 | Rp300 rb | Tanpa bensin |
| Motor bebek | 2× | 2 (bonceng) | Rp3 jt | Bensin |
| Motor matic / vespa | 2,2× | 2 | Rp5–8 jt | Gaya berbeda |
| Mobil city car | 2,5× | 4 | Rp25 jt | Muat banyak barang |
| Mobil keluarga | 2,3× | 7 | Rp45 jt | Muat anak + belanjaan |

- Kendaraan cepat hanya di tile `road`. Di luar jalan, pemain otomatis turun.
- **Bensin**: tangki habis → kendaraan jalan pelan sampai ke SPBU (tidak mogok total). Ini money sink ringan.
- **Bonceng/naik bareng** 💗: saat berdua online, pasangan bisa naik ke kendaraan kamu (ajak → terima). Naik bareng menambah poin Romansa per menit.
- **Kustom**: warna, stiker, helm (masuk slot outfit).
- **Parkir**: kendaraan tersimpan di titik terakhir atau di garasi rumah.

## 6. Transportasi Umum
- **Angkot**: halte di setiap area → pilih tujuan → bayar Rp4.000 → fade → tiba. Ada NPC sopir Mang Oleh dengan dialog random.
- **Ojek online** (app HP, setelah Bab 2): dijemput di mana saja, lebih mahal.
- Angkot tidak beroperasi pukul 23:00–05:00.
