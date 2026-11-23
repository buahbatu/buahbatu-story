# 13 · Ekonomi, Toko & Karier

## 1. Mata Uang
- **Rupiah (Rp)**, disimpan sebagai integer (tanpa desimal).
- Sebelum menikah: **dompet pribadi** per pemain.
- Setelah menikah: **dompet bersama** + dompet pribadi tetap ada (untuk hadiah kejutan 🎁). Setoran ke dompet bersama dilakukan lewat app Bank.
- Semua transaksi tercatat di **log transaksi** (app Bank di HP) supaya bisa dicek.

## 2. Sumber Pemasukan
| Sumber | Detail |
|---|---|
| Kotak Kirim | Hasil kebun/ternak/olahan, dibayar saat ganti hari |
| Jual langsung | Ke toko tertentu (harga 80% dari Kotak Kirim, tapi uangnya langsung masuk) |
| Kerja/karier | Gaji per shift (lihat §5) |
| Quest | Hadiah uang & item |
| Festival | Hadiah lomba |
| Bunga tabungan | Kecil, mingguan |
| Sewa properti | Late game: menyewakan rumah lama |

## 3. Pengeluaran (Money Sink)
Supaya uang selalu punya tujuan dan game tidak cepat "selesai":
- Bibit, pupuk, pakan ternak
- Baju, aksesoris, potong rambut
- Furnitur, renovasi, rumah, tanah
- Kendaraan, bensin, servis, angkot
- Cicilan & bunga kredit
- Kencan (makan di kafe, tiket), hadiah
- Upgrade alat & bangunan
- Biaya pernikahan, kebutuhan anak, sekolah
- Donasi Proyek Revitalisasi Bandung

## 4. Toko
Sistem toko generik dan data-driven (`shops.json`):
```json
{
  "id": "seed_shop",
  "name": "Toko Tani Kang Asep",
  "area": "lembang",
  "hours": { "open": 9, "close": 17, "closedDays": ["sun"] },
  "stock": [
    { "itemId": "seed_strawberry", "price": 6000, "seasons": ["spring"] },
    { "itemId": "fertilizer_basic", "price": 1500 }
  ],
  "buysCategories": ["crop", "forage"],
  "dailyLimit": null
}
```

| Toko | Area | Jual |
|---|---|---|
| Toko Tani Kang Asep | Lembang | Bibit, pupuk, pakan, ternak |
| Warung Bu Euis | Dago | Makanan, bahan masak dasar |
| Toko baju (3) | Cihampelas | Jeans, kasual, jaket |
| Butik Braga | Braga | Baju pesta, formal |
| Toko Perhiasan | Braga | Cincin, kalung (hadiah, lamaran) |
| Toko Furnitur | Braga | Furnitur, wallpaper, lantai |
| Pasar Baru | Pasar Baru | Kain, bahan masak murah, pandai besi |
| Dealer | Gedung Sate | Motor, mobil |
| Pasar Minggu Gasibu | Gedung Sate | Barang acak & langka (hanya Minggu) |
| Toko Online (app HP) | — | Katalog terbatas, dikirim besok pagi |

### Harga dinamis
- **Musiman**: hasil di luar musim dihargai lebih mahal (greenhouse jadi menguntungkan).
- **Saturasi**: menjual terlalu banyak item yang sama di 1 minggu menurunkan harga sampai −30% (pulih perlahan). Mendorong variasi.
- **Permintaan harian**: app Berita menampilkan "Hari ini kafe Braga butuh stroberi! +30%".

## 5. Karier (ala Sims)
### Struktur
- Setiap jalur punya **level 1–10**, jam kerja, gaji per shift, dan syarat promosi (skill + performa + hari kerja).
- **Performa** (0–100) naik kalau datang tepat waktu, mood bagus, memakai baju kerja yang sesuai, dan menyelesaikan minigame/pilihan dengan baik.
- Saat bekerja, pemain memilih:
  - **Kerja aktif**: minigame singkat (lebih banyak XP & performa), atau
  - **Kerja cepat**: *time-skip* ala Sims (layar teks + 1–2 pilihan event kantor).
- Pemain tidak wajib berkarier (bisa full bertani), tapi karier memberi gaji stabil dan membuka konten.

### Jalur karier
| Jalur | Tempat | Level 1 → 10 | Minigame |
|---|---|---|---|
| ☕ **Kuliner** | Kafe Braga | Pelayan → Barista → Head Barista → … → Pemilik Kafe | Racik pesanan kopi |
| 🎨 **Kreatif** | Galeri Braga | Freelance → Desainer → … → Pemilik Studio | Puzzle warna/komposisi |
| 🌾 **Agribisnis** | Lembang | Buruh Tani → Mandor → … → Eksportir | Sortir hasil panen |
| 🧭 **Pariwisata** | Alun-alun | Pemandu → … → Pemilik Agen Wisata | Kuis Bandung |
| 📚 **Pendidikan** | Kampus/Sekolah | Guru Les → … → Kepala Sekolah | Bantu murid (soal sederhana) |

### Contoh tabel (Kuliner)
| Lv | Jabatan | Jam | Hari | Gaji/shift |
|---|---|---|---|---|
| 1 | Pelayan | 09–13 | Sen–Jum | Rp40.000 |
| 3 | Barista | 09–15 | Sen–Jum | Rp75.000 |
| 6 | Head Barista | 10–16 | Sen–Kam | Rp150.000 |
| 10 | Pemilik Kafe | Bebas | — | Bagi hasil harian |

Level 10 = **bisnis milik sendiri**. Pendapatan bergantung pada keputusan (menu, harga, dekor kafe). Ini konten endgame.

### Kerja sampingan (tanpa komitmen)
Kuli angkut di pasar, bantu panen tetangga, ojek (setelah punya motor), pengamen angklung. Dibayar per tugas.

## 6. Bank (Pak Dadang, Braga)
- **Tabungan**: bunga 0,5% per minggu (maks. Rp100.000/minggu supaya tidak dieksploitasi).
- **Kredit**: KPR, kredit motor, kredit mobil, kredit tanah. Detail di `14-properti-kendaraan.md` §4.
- **Skor Kepercayaan Bank** A–E, menentukan limit & bunga kredit.
- **Rekening bersama** setelah menikah.

## 7. Kurva Ekonomi (target balancing)
| Waktu | Penghasilan per hari (rata-rata) | Pembelian besar yang masuk akal |
|---|---|---|
| Minggu 1 | Rp20–50 rb | Bibit, baju murah |
| Akhir Semi thn 1 | Rp100–200 rb | Sepeda, upgrade alat |
| Akhir thn 1 | Rp300–600 rb | Motor (kredit), cincin |
| Thn 2 | Rp600 rb–1,5 jt | Rumah (KPR), mobil |
| Thn 3+ | Rp1,5 jt+ | Rumah impian, tanah luas, bisnis |

Semua angka ada di `balance.ts` dan diuji lewat simulasi sederhana (lihat `50-testing-deploy.md` §3).
