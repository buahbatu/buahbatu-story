# 11 · Waktu, Musim & Cuaca

## 1. Jam Game
| Parameter | Nilai default (`balance.ts`) |
|---|---|
| 1 menit game | 0,7 detik nyata |
| Hari dimulai | 06:00 |
| Batas tidur | 02:00 (lewat dari ini → pingsan) |
| Durasi 1 hari | 20 jam game ≈ **14 menit nyata** |
| Tick UI | Tiap 10 menit game |

- Waktu **berhenti** saat: menu/HP dibuka (hanya saat solo), dialog, cutscene.
- Saat berdua online, waktu **tidak berhenti** waktu buka menu (seperti Stardew multiplayer).

## 2. Kalender
- 1 minggu = 7 hari (**Senin–Minggu**).
- 1 musim = **28 hari** (4 minggu).
- 1 tahun = 4 musim: **Semi → Panas → Gugur → Dingin**.
- Hari libur (Minggu): toko tertentu tutup, pasar Gasibu buka.

## 3. Tidur & Ganti Hari
- **Solo**: tidur → layar ringkasan hari (penjualan, quest, ulang tahun besok) → 06:00 hari berikutnya.
- **Berdua**: hari berganti hanya jika **dua-duanya tidur**. Yang tidur duluan melihat layar "Menunggu {nama} tidur… 😴" dan masih bisa chat/voice.
- **Pingsan 02:00**: bangun di rumah, energi hanya terisi 50%, kehilangan 5% uang ("biaya ojek pulang"), dan dapat moodlet "Kelelahan".
- Saat ganti hari, host menjalankan **Day Tick** berurutan:
  1. Penjualan Kotak Kirim
  2. Tanaman tumbuh / layu
  3. Ternak menghasilkan produk
  4. Cicilan (setiap Senin)
  5. Cuaca besok di-generate
  6. Jadwal NPC & event hari ini
  7. Autosave

## 4. Siang / Malam
| Jam | Fase | Efek visual |
|---|---|---|
| 06:00–07:00 | Subuh | Tint biru-oranye, kabut (Lembang) |
| 07:00–17:00 | Siang | Normal |
| 17:00–19:00 | Senja | Tint oranye |
| 19:00–02:00 | Malam | Gelap + lampu jalan/jendela menyala (light sprite) |

Implementasi: overlay rectangle dengan blend mode + sprite cahaya additive, interpolasi warna per menit.

## 5. Musim
| Musim | Nuansa | Tanaman unggulan | Festival (lihat `19`) |
|---|---|---|---|
| 🌸 **Semi** | Bunga, segar | Stroberi, sawi, wortel, kentang | Festival Bunga · Pesta Teh |
| ☀️ **Panas** | Cerah, ramai | Tomat, cabai, jagung, semangka | Lomba 17-an · Malam Kembang Api |
| 🍂 **Gugur** | Hangat, panen | Labu, ubi cilembu, kol, padi | Seren Taun (panen) · Festival Kuliner |
| ❄️ **Dingin** | Sejuk, salju tipis | Hanya di greenhouse | Festival Lampion · Malam Tahun Baru |

Hari terakhir musim: tanaman yang tidak cocok untuk musim berikutnya akan **layu**, dengan notifikasi H-3.

## 6. Cuaca
| Cuaca | Efek gameplay |
|---|---|
| Cerah | Normal |
| Berawan | Ikan tertentu muncul |
| Hujan | Tanaman otomatis tersiram; NPC di dalam ruangan; moodlet "Kehujanan" kalau tanpa payung |
| Badai | Sebagian toko tutup; ada risiko pagar rusak (perbaikan murah); bonus hangat kalau berdua di rumah 💗 |
| Kabut | Hanya Lembang/Dago pagi; serangga & ikan langka |
| Berangin | Festival layang-layang, kincir angin berputar |
| Salju | Hanya musim Dingin; kebun luar tidak bisa ditanami |

### Peluang per musim (default)
| | Cerah | Berawan | Hujan | Badai | Kabut | Berangin | Salju |
|---|---|---|---|---|---|---|---|
| Semi | 45 | 20 | 25 | 3 | 5 | 2 | 0 |
| Panas | 55 | 15 | 15 | 8 | 0 | 7 | 0 |
| Gugur | 35 | 25 | 25 | 5 | 5 | 5 | 0 |
| Dingin | 25 | 25 | 10 | 0 | 10 | 0 | 30 |

- Cuaca di-generate memakai RNG seeded (deterministik).
- Hari festival selalu **Cerah** (override).
- Prakiraan cuaca besok dilihat di **app Cuaca** di HP atau TV rumah.

## 7. Waktu Nyata (Real-World Date)
Game membaca tanggal asli perangkat untuk event spesial (ultah, anniversary, dll.), lihat `19-quest-event-festival.md` §6. Tanggal asli **tidak** mengubah musim/kalender game.

## 8. Catatan Multiplayer
- Jam dijalankan **host** dan dikirim tiap menit game (`world:tick`). Klien melakukan interpolasi.
- Waktu dunia **hanya berjalan saat ada minimal 1 pemain online**. Dunia membeku saat keduanya offline.
