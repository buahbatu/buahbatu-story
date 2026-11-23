# 20 · Aktivitas

## 1. 🎣 Mancing
- Lokasi: sungai Tahura (Dago), Situ Patenggang, kolam Lembang, Kawah Putih (ikan langka fantasi).
- **Minigame**: lempar (tahan untuk jarak) → tunggu gigitan (tanda "!") → **bar tegangan**: jaga indikator di zona hijau sampai ikan lelah.
- Ikan ditentukan oleh **lokasi × musim × jam × cuaca** (`fish.json`).
- Target: 30+ ikan, termasuk 4 **ikan legendaris** (1 per musim, hanya bisa didapat sekali).
- **Mancing berdua** 💗: dua pemain di spot yang sama → peluang ikan langka +, dan ada aksi "bantu tarik" saat ikan legendaris.
- Umpan & kail bisa di-craft/beli.

## 2. 🍳 Masak
- Butuh **dapur** (rumah/kontrakan; kos pakai kompor kecil dengan resep terbatas).
- **Resep** didapat dari TV (acara masak mingguan), NPC (heart events), festival, atau eksperimen.
- Masakan memberi **buff** (energi, kecepatan, keberuntungan mancing, mood) dan bisa jadi hadiah.

| Contoh resep | Bahan | Efek |
|---|---|---|
| Batagor | Ikan, tepung, tahu | Energi +, Sosial + |
| Surabi oncom | Tepung beras, kelapa, oncom | Energi + |
| Nasi liwet | Beras, ikan asin, daun salam | Energi ++ (porsi berdua) |
| Seblak | Kerupuk, telur, cabai | Hiburan + |
| Mie kocok | Mie, kikil, tauge | Hangat (musim dingin) |
| Colenak | Peuyeum, gula merah | Mood + |
| Bandrek | Jahe, gula merah | Hangat, tahan dingin |
| Yogurt stroberi | Yogurt Lembang, stroberi | Keberuntungan + |

- **Masak berdua** 💗: menu "porsi berdua" + minigame kerja sama (satu memotong, satu mengaduk) → kualitas +.
- Target: 40+ resep. Semua masuk **Ensiklopedia**.

## 3. 🔨 Crafting
- Meja kerja di rumah. Resep dibuka lewat level skill & quest.
- Kategori: pertanian (penyiram otomatis, pupuk, orang-orangan sawah), dekor (pagar, lampu taman, jalan setapak), mesin olahan, alat mancing, hadiah handmade (gelang, kartu ucapan **dengan teks custom**).

## 4. ⛰️ Eksplorasi Tangkuban Perahu
- **Gua kawah 20 lantai** (dibuka bertahap), **tanpa pertarungan**.
- Isi: batu & bijih (tembaga/besi/emas/kristal), fosil, artefak, jamur langka, kristal belerang.
- **Tantangan non-tempur**: energi terbatas, puzzle batu dorong, jalur gelap (butuh lentera), uap panas (hindari berdasarkan timing), lantai acak (prosedural sederhana dari template).
- Setiap 5 lantai ada **checkpoint** (lift).
- **Berdua**: puzzle tertentu butuh 2 orang (injak 2 tombol bersamaan).
- Abah Karta memberi dongeng legenda Sangkuriang sebagai lore.

## 5. 🏛️ Museum Geologi
Donasi fosil, mineral, dan artefak → koleksi museum. Setiap 10 donasi memberi hadiah (item langka, resep, baju). Melengkapi koleksi museum termasuk target endgame.

## 6. 📸 Mode Foto (app Kamera)
- Ambil foto kapan saja: sembunyikan HUD, pilih **pose** (untuk kamu & pasangan jika berdua online), **filter** (vintage, hangat, hitam-putih), dan **bingkai**.
- Foto disimpan ke **Album** (IndexedDB lokal + Supabase Storage agar sinkron).
- **Quest foto**: "Foto berdua di Gedung Sate saat salju", "Foto 10 jenis ikan".
- Foto bisa dipajang di bingkai rumah.
- Export foto ke galeri perangkat (download PNG).

## 7. 🎮 Minigame
| Minigame | Lokasi | Mode |
|---|---|---|
| Racik Kopi | Kafe Braga | Solo (karier) |
| Balok Braga (puzzle jatuh ala Tetris) | Arcade Braga | Solo / skor tertinggi berdua |
| Ritme Angklung | Saung Udjo | Solo / **duet** |
| Lomba 17-an (karung, kerupuk, panjat pinang) | Festival Panas | Co-op / versus |
| Karaoke | Kafe malam | Berdua (pilih lagu → ritme) |
| Catur / Congklak | Rumah | Versus pasangan |
| Tebak Gambar | Rumah | Berdua (satu menggambar, satu menebak) |
| Petik Stroberi Cepat | Lembang | Co-op |

- Skor tertinggi tercatat di **Papan Skor Rumah** (kamu vs pasangan, buat saling pamer).

## 8. 🐞 Mengumpulkan
- **Serangga & kupu-kupu** (pakai jaring) di Tahura & Lembang, tergantung musim/jam.
- **Bahan liar (forage)**: jamur, buah liar, bunga, kerang (pantai bulan madu).
- Semua masuk Ensiklopedia.
