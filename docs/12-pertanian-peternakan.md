# 12 · Pertanian & Peternakan

## 1. Alat
| Alat | Fungsi | Energi |
|---|---|---|
| Cangkul | Menggemburkan tanah | 2 |
| Penyiram | Menyiram (kapasitas terbatas, isi ulang di sumur/sungai) | 2 |
| Sabit | Panen padi/rumput, bersihkan gulma | 1 |
| Kapak | Tebang pohon/ranting → kayu | 4 |
| Beliung | Hancurkan batu → batu, mineral | 4 |
| Pancing | Mancing (lihat `20`) | 3 |
| Keranjang | Petik buah/stroberi lebih cepat | 1 |

### Upgrade alat (di pandai besi Pasar Baru)
`Biasa → Tembaga → Besi → Emas → Kristal Kawah`

| Level | Efek | Biaya contoh |
|---|---|---|
| Tembaga | Area 1×3 | Rp20.000 + 5 bijih tembaga |
| Besi | Area 3×3 | Rp50.000 + 5 bijih besi |
| Emas | Area 3×5, energi −1 | Rp100.000 + 5 bijih emas |
| Kristal Kawah | Area 5×5, energi −2 | Rp250.000 + 3 kristal |

Proses upgrade memakan **2 hari** (alat tidak bisa dipakai selama itu, jadi strategi tetap diperlukan).

## 2. Tanah
Status tile `Farmable`:
```
rumput → (cangkul) → gembur → (tanam) → ditanami → (siram) → tersiram
```
- Status tersiram reset setiap pagi (kecuali hujan).
- Tanah gembur yang tidak ditanami selama 3 hari kembali jadi rumput.
- **Pupuk**: Biasa (+kualitas), Super (+kualitas lebih tinggi), Penyubur (tumbuh 10–25% lebih cepat), Penahan Air (peluang tetap basah besok).

## 3. Tanaman
### Mekanik
- Tumbuh 1 tahap per hari **jika tersiram**.
- Tidak disiram 1 hari → tidak tumbuh. Tidak disiram 3 hari → layu (bisa diselamatkan dengan *Pupuk Pemulih*).
- **Regrow**: beberapa tanaman bisa dipanen berkali-kali.
- **Kualitas panen**: ⭐ Biasa / ⭐⭐ Perak / ⭐⭐⭐ Emas / 💎 Spesial, dipengaruhi pupuk + skill Bertani + bonus "ditanam berdua".
- **Tanaman Raksasa**: tanaman 3×3 yang sejenis punya peluang 1% per hari bergabung jadi raksasa. Langka dan masuk koleksi.
- **Bonus berdua** 💗: tanaman yang ditanam satu pemain lalu disiram pemain lain mendapat +5% peluang kualitas lebih tinggi.

### Daftar awal (`crops.json`, minimal 16)
| Musim | Tanaman | Hari tumbuh | Regrow | Harga jual dasar |
|---|---|---|---|---|
| Semi | Stroberi Lembang | 8 | 4 hari | Rp12.000 |
| Semi | Sawi | 4 | — | Rp3.500 |
| Semi | Wortel | 6 | — | Rp5.000 |
| Semi | Kentang | 6 | — | Rp6.000 |
| Panas | Tomat | 10 | 4 hari | Rp6.000 |
| Panas | Cabai rawit | 5 | 3 hari | Rp4.000 |
| Panas | Jagung manis | 12 | 4 hari | Rp5.000 |
| Panas | Semangka | 12 | — | Rp30.000 |
| Gugur | Labu | 13 | — | Rp32.000 |
| Gugur | Ubi Cilembu | 7 | — | Rp9.000 |
| Gugur | Kol | 9 | — | Rp8.000 |
| Gugur | Padi | 10 | — | Rp7.000 (perlu sabit) |
| Semi/Panas | Mawar | 7 | 5 hari | Rp15.000 (bisa jadi hadiah) |
| Semua (greenhouse) | Jamur | 6 | 4 hari | Rp9.000 |
| Perennial | Teh (perdu) | 28 | 7 hari | Rp6.000 → olah jadi teh |
| Perennial | Kopi Java Preanger | 28 | 10 hari | Rp10.000 → olah jadi kopi |

Contoh skema:
```json
{
  "id": "strawberry_lembang",
  "seedId": "seed_strawberry",
  "seasons": ["spring"],
  "stages": [1, 2, 2, 3],
  "regrowDays": 4,
  "harvestItem": "strawberry",
  "harvestQty": [1, 2],
  "sellPrice": 12000,
  "spriteKey": "crops/strawberry",
  "xp": 8
}
```

## 4. Bangunan Pertanian
| Bangunan | Fungsi | Cara dapat |
|---|---|---|
| Kotak Kirim | Jual hasil (dibayar malam) | Sejak awal |
| Kandang ayam | 4 → 8 → 12 ayam | Beli / upgrade |
| Kandang sapi | 4 → 8 → 12 ternak besar | Beli / upgrade |
| Greenhouse | Tanam semua musim | Proyek "Lembang Hijau" |
| Gudang | Penyimpanan ekstra | Beli |
| Sumur | Isi penyiram | Sejak awal |
| Penyiram otomatis | Siram 4/8/24 tile setiap pagi | Crafting |
| Kotak lebah | Madu (rasa sesuai bunga sekitar) | Crafting |

## 5. Peternakan
| Ternak | Produk | Perawatan harian |
|---|---|---|
| Ayam | Telur | Kasih makan, elus |
| Sapi perah | Susu (khas Lembang 🐄) | Kasih makan, elus, sikat |
| Kambing | Susu kambing | Kasih makan, elus |
| Kelinci | Bulu | Kasih makan, elus |
| Bebek | Telur bebek | Kasih makan, kolam |

- Setiap ternak punya **meter sayang (0–10 hati)**. Makin tinggi hatinya, makin bagus kualitas produknya.
- Ternak bisa diberi nama dan masuk koleksi foto.
- Lupa memberi makan = hati turun sedikit (tidak ada ternak yang mati).
- Festival Ternak (Seren Taun): kontes ternak dengan hadiah.

## 6. Mesin Olahan
| Mesin | Input → Output | Waktu |
|---|---|---|
| Panci Selai | Buah → Selai (×2 harga) | 1 hari |
| Toples Acar | Sayur → Acar | 1 hari |
| Mesin Yogurt | Susu → Yogurt Lembang | 6 jam |
| Mesin Keju | Susu → Keju | 1 hari |
| Pengering | Teh/kopi → Teh/kopi kering | 1 hari |
| Penyangrai | Kopi kering → Kopi bubuk | 6 jam |
| Tong Fermentasi | Buah → Sirup/minuman | 3 hari |

## 7. Peliharaan
- Kucing atau anjing (pilih di awal tahun 1; bisa disamakan dengan peliharaan asli kalian).
- **Rumah penuh kucing (ADR-028)**: boleh punya banyak kucing. **Beli** di pet shop → langsung beri nama. **Kucing kampung** bisa didekati & dibawa pulang; namanya baru bisa diberikan setelah **meter Nyaman** penuh (beberapa hari diberi makan, dielus, punya tempat tidur). Kucing suka ikan hasil mancing (`20`).
- Dielus setiap hari → hati naik → peliharaan kadang membawa "hadiah" kecil.
- Setelah menikah, peliharaan ikut pindah ke rumah bersama.
