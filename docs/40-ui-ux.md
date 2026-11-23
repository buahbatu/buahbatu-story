# 40 · UI / UX

## 1. Gaya Visual UI
- **Pixel UI hangat**: panel krem/kayu, border pixel 2px, bayangan keras 1 tingkat, aksen warna stroberi & hijau daun.
- **Font**:
  - Judul: font pixel tebal (misal *Press Start 2P*, pakai hemat, ukuran kecil).
  - Teks/dialog: font pixel yang **mudah dibaca** (misal *Pixelify Sans* atau *VT323*).
- **Scaling integer** untuk semua elemen pixel (tidak blur).
- Animasi UI cepat (120–200 ms), menghormati `prefers-reduced-motion`.

## 2. HUD
```
┌─────────────────────────────────────────────────┐
│ ⚡▮▮▮▮▯ 🍜▮▮▮▯▯ 😄            Sen, 12 Semi · 14:30 │
│ 💬▮▮▮▮▯ 🎈▮▮▯▯▯             ☀️  Rp 125.400   │
│                                   💗 A online  │
│ [Quest dilacak: Bunga Tiap Pagi 1/3]           │
│                                                │
│                                                │
│          [1][2][3][4][5][6][7][8][9][0]   [📱] │
└─────────────────────────────────────────────────┘
```
- Kiri atas: needs + mood.
- Kanan atas: hari/tanggal/jam, cuaca, uang, status pasangan.
- Bawah: hotbar 10 slot + tombol HP.
- Prompt interaksi muncul di dekat objek ("E Siram", "E Ngobrol").
- HUD bisa disembunyikan (mode foto/sinematik).

## 3. 📱 HP (Pusat Menu, ala Sims/GTA)
Dibuka dengan `Tab` / tombol HP. Tampil sebagai ponsel pixel di layar.

| App | Fungsi | Terbuka |
|---|---|---|
| 💬 Chat | Chat dengan pasangan + riwayat | Tahap Kenalan |
| 📞 Telepon | Voice call pasangan | Tahap Kenalan |
| 💌 Pesan | Surat & voice note | Awal |
| 📋 Quest | Log quest + quest harian | Awal |
| 🗺️ Peta | Peta Bandung, posisi pasangan, NPC yang dikenal | Awal |
| 🗓️ Kalender | Festival, ultah NPC, cicilan | Awal |
| ☁️ Cuaca | Prakiraan besok | Awal |
| 🏦 Bank | Saldo, transfer, kredit, log transaksi | Bab 3 |
| 🛒 Toko Online | Belanja antar besok pagi | Bab 3 |
| 🛵 Ojek | Fast travel | Bab 2 |
| 📸 Kamera | Mode foto | Awal |
| 🖼️ Album | Foto + **Kenangan** | Awal |
| 💞 Hubungan | Meter, tahap, riwayat momen | Tahap Kenalan |
| 👨‍👩‍👧 Keluarga | Anak, pohon keluarga | Punya anak |
| 🏠 Rumahku | Mode dekor, info properti | Punya hunian |
| 📚 Ensiklopedia | Koleksi | Awal |
| 🏆 Pencapaian | Achievement, skill, aspirasi, Kesempurnaan Hidup | Awal |
| ⚙️ Pengaturan | Audio, kontrol, tampilan, akun, save | Awal |

Wallpaper HP bisa diganti dengan foto dari album 💗.

## 4. Menu Lain
Inventory (grid + tas), Lemari, Toko (beli/jual + preview), Crafting, Masak, Kotak Kirim, Penyimpanan, Dekor (overlay grid), Dialog, Ringkasan Hari (saat tidur), Cutscene (letterbox).

## 5. Kotak Dialog
- Potret (96px) di kiri, nama, teks dengan efek mengetik + blip.
- Klik/`E` mempercepat teks; klik lagi lanjut.
- Pilihan maksimal 4, bisa dipilih dengan keyboard.
- **Log dialog** (scroll ke belakang).

## 6. Kontrol
| Aksi | Keyboard | Mouse | Sentuh | Gamepad |
|---|---|---|---|---|
| Gerak | WASD / panah | — | Joystick virtual kiri | Stik kiri |
| Interaksi | E | Klik kanan | Tombol A | A |
| Pakai alat | Spasi | Klik kiri | Tombol B | X |
| Hotbar | 1–0, scroll | Scroll | Ketuk slot | LB/RB |
| HP | Tab | Ikon | Ikon HP | Start |
| Lari | Shift | — | Joystick penuh | Stik ditekan |
| Emote | F | — | Tombol emote | Y |
| Push-to-talk | V (tahan) | — | Tombol mic | RT |
| Dekor | B | — | Ikon | — |

- Semua tombol bisa di-remap (Pengaturan → Kontrol).
- Input diabstraksi menjadi **Action** (`src/input/`), bukan key langsung.

## 7. Responsif
- Desktop: resolusi dasar 640×360 di-scale integer (×2 = 1280×720, ×3 = 1920×1080).
- HP: mode landscape, tombol sentuh ≥ 44px, UI menu memakai layout 1 kolom.
- Kalau HP dalam posisi portrait: tampilkan ajakan "Putar HP kamu 🔄".

## 8. Aksesibilitas
- Ukuran teks (S/M/L), kontras tinggi, mode buta warna (ikon + teks, tidak hanya warna).
- Kurangi gerakan (matikan shake/partikel berat).
- Subtitle untuk suara kenangan & voice note (opsional, ketik manual).
- Kecepatan teks dialog bisa diatur.
- Semua menu bisa dinavigasi dengan keyboard; fokus terlihat jelas.

## 9. Prinsip UX
- **Progres tidak boleh hilang**: autosave + indikator "Tersimpan ✓".
- Aksi destruktif (jual item langka, buang, hapus furnitur) → konfirmasi dengan nama item.
- **Undo** di mode dekor.
- Tutorial bertahap (fitur dijelaskan saat pertama kali dibuka), bukan dump teks di awal.
- Pesan error ramah & lucu, tidak menyalahkan pemain, dan selalu memberi jalan keluar.
- Notifikasi bertumpuk maksimal 3, sisanya masuk riwayat.
