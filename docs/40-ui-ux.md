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
| Pakai alat | C (keputusan user) | Klik kiri | Tombol B | X |
| Hotbar | 1–0, `[` `]` | — | Ketuk slot | LB/RB |
| HP | Tab | Ikon | Ikon HP | Start |
| Lari | Shift | — | Joystick penuh | Stik ditekan |
| Emote | F | — | Tombol emote | Y |
| Push-to-talk | V (tahan) | — | Tombol mic | RT |
| Lompat | Spasi (keputusan user) | — | Tombol lompat | B |
| Dekor | G | — | Ikon | — |
| Zoom kamera | `+` / `-` | Scroll | Cubit dua jari | — |
| Putar kamera | Q / R | — | Putar dua jari | Stik kanan |
| Geser pandangan | — | Tahan klik kanan + seret | Geser dua jari | — |

- Semua tombol bisa di-remap (Pengaturan → Kontrol).
- **Kamera (P1-06, keputusan user):** scroll = zoom (hotbar tidak memakai scroll), Q/R memutar kamera (E tetap Interaksi), tahan klik kanan + seret menggeser pandangan; pandangan kembali mengikuti pemain begitu pemain berjalan. WASD selalu relatif terhadap kamera (W = menjauh dari layar). Di dalam ruangan kamera tidak bisa diputar/digeser, hanya zoom. Angka di `WORLD_CAMERA` / `INTERIOR` (`config/world.ts`), logika murni `src/world/camera/logic.ts`, input mouse/sentuh `src/input/pointer.ts`.
- Input diabstraksi menjadi **Action** (`src/input/`), bukan key langsung. **Status (P1-03):** keyboard. Daftar Action di `src/input/actions.ts`, tombol bawaan di `src/config/controls.ts` (`KeyboardEvent.code`, jadi aman untuk layout keyboard apa pun; maks. 2 tombol per Action; `Enter` cadangan Interaksi; hotbar maju/mundur `]`/`[` sampai scroll mouse ditambahkan). `InputState` (`src/input/logic.ts`): ditahan / baru ditekan / baru dilepas per frame, vektor gerak dinormalisasi, `rebind` tanpa bentrok + skema zod (dipakai menu remap P16-03). Tombol milik game tidak menjalankan aksi browser (Tab tidak memindah fokus, Spasi/panah tidak menggulir); kombinasi Ctrl/Alt/Meta & mengetik di kolom teks diabaikan; semua tombol dilepas saat jendela kehilangan fokus.

## 7. Responsif (ADR-020)
- **Area pandang fleksibel, zoom selalu integer.** Zoom `k` = piksel fisik per piksel game, dipilih supaya tinggi **resolusi render internal** ±240 ala PS1 (batas 180–300, lebar maks. 640; ADR-022). Ukuran dunia = layar ÷ k → **game selalu penuh layar dan selalu tajam**. Layar lebih lebar = melihat sedikit lebih banyak dunia. Logika: `src/utils/scale.ts`, batas: `VIEW_LIMITS` di `src/config/game.ts`.
  - Contoh: laptop 1366×768 di Chrome (1366×657) → ×3, render 455×219; 720p → ×3, 426×240; 1080p → ×5 (atau ×4), ±384×216. Ukuran UI (HTML) tidak ikut zoom ini: satuan `--px` = tinggi canvas ÷ 360.
  - Dihitung per **piksel fisik**: display scaling 125%/150% tetap tajam.
  - Dihitung ulang saat resize, rotasi, pindah monitor, atau zoom browser. Scene menata ulang isinya dari `this.scale.width/height` (jangan hardcode 640×360). HUD/UI menempel ke tepi layar.
- **Game wajib landscape.** Di perangkat sentuh yang dipegang tegak (`(orientation: portrait) and (pointer: coarse)`), game disembunyikan total dan di-pause; yang tampil hanya animasi HP berputar + "Putar HP kamu". Jendela desktop yang sempit tidak diblokir.
- **Layar penuh di HP**: Android Chrome masuk layar penuh (address & navigation bar tersembunyi) pada sentuhan pertama, lalu orientasi dikunci landscape. Game juga bisa di-install (PWA, `public/manifest.webmanifest`: `display: fullscreen`, `orientation: landscape`): dibuka dari ikon home screen langsung penuh layar. iPhone: hanya lewat "Tambah ke Layar Utama" (Safari iPhone tidak mendukung layar penuh untuk halaman web).
- HP: tombol sentuh ≥ 44px, UI menu memakai layout 1 kolom.

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
