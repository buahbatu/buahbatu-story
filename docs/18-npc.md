# 18 · NPC (Warga Bandung)

## 1. Prinsip
- Warga punya **jadwal**, **kesukaan**, **ulang tahun**, dan **cerita pribadi** (heart events).
- **Tidak bisa dipacari** (romansa hanya antar pemain). NPC adalah teman, keluarga, dan komunitas.
- Dialog memakai bahasa Indonesia santai dengan logat Sunda ("Punten", "Mangga", "Euy", "Atuh").
- **Slot teman asli**: beberapa NPC bisa dibuat berdasarkan teman/keluarga asli kalian (`43`).

## 2. Pemeran Awal (placeholder, nama bisa diganti)
| ID | Nama | Peran | Area |
|---|---|---|---|
| `npc_kang_asep` | Kang Asep | Petani senior, mentor, toko bibit | Lembang |
| `npc_bu_euis` | Bu Euis | Ibu kos, warung, babysitter | Dago |
| `npc_teh_rina` | Teh Rina | Manajer kafe Braga (bos karier Kuliner) | Braga |
| `npc_pak_dadang` | Pak Dadang | Bankir | Braga |
| `npc_neng_lilis` | Neng Lilis | Penjahit | Pasar Baru |
| `npc_mang_ujang` | Mang Ujang | Penjual batagor keliling | Alun-alun (berpindah) |
| `npc_mang_oleh` | Mang Oleh | Sopir angkot | Semua halte |
| `npc_abah_karta` | Abah Karta | Penjaga Tangkuban, pendongeng legenda | Tangkuban |
| `npc_bu_dewi` | Bu Dewi | Kurator Museum Geologi | Gedung Sate |
| `npc_kang_dimas` | Kang Dimas | Seniman galeri | Braga |
| `npc_ceu_popon` | Ceu Popon | Penggosip kompleks (sumber info event) | Cihampelas |
| `npc_pak_rt` | Pak RT | Kantor kelurahan, Proyek Revitalisasi | Gedung Sate |
| `npc_mang_engkos` | Mang Engkos | Tukang bangunan | Lembang |
| `npc_dokter_sari` | dr. Sari | Klinik (event kehamilan, cek anak) | Alun-alun |
| `npc_bu_guru_nining` | Bu Nining | Guru TK/SD | Sekolah |
| `npc_ujang_kecil` | Ujang | Anak kecil, teman main anak kalian | Alun-alun |
| `npc_teh_nisa` | Teh Nisa | Pelatih angklung | Saung Udjo |
| `npc_kucing_oren` | Si Oren | Kucing liar yang bisa diadopsi | Berpindah |
| `npc_mamah_michelle` | Mamah Michelle | Ibu Michelle; kasih tugas rumah, resep keluarga, restu | Buahbatu ⭐ |
| `npc_papah_michelle` | Papah Michelle | Ayah Michelle; "ujian" calon menantu yang lucu, restu | Buahbatu ⭐ |
| `npc_eldyi` | Eldyi | Sepupu Michelle (permintaan user, 2026-11-24); peran, sifat & jadwal menyusul | Buahbatu ⭐ |
| `npc_family_*` | (keluarga asli) | Saudara/keluarga Michelle (opsional) | Buahbatu ⭐ |
| `npc_friend_*` | (teman asli) | Teman kalian | Sesuai isi |

> Nama, sifat, dan kebiasaan keluarga Michelle diisi dari kuesioner (`43`). Mintalah persetujuan Michelle sebelum memasukkan keluarganya.
> Orang tua Michelle ditampilkan **sesuai data personal** (boleh tinggal di rumah berbeda, ADR-028); keduanya tetap hangat & hadir, restu datang dari keduanya.
> Orang tua Michelle punya **meter "Restu"** khusus (0–10 hati) untuk Pemain A, naik lewat main ke rumah, bawa oleh-oleh, bantu tugas rumah, dan ngobrol. Restu ≥ 6 hati jadi syarat lamaran (`16`).

Target rilis (v1.0, ADR-027): **±25 NPC** hidup penuh (jadwal, dialog, heart event, hadiah, ulang tahun). Cadangan bila terpaksa rilis lebih awal: minimal **15 NPC** + peta sudah luas. Usulan tambahan (2026-11-25): **peternak sapi perah** (Lembang) & **pemancing + toko alat pancing** (situ). Potret: pixel art 64×64, 5 ekspresi (biasa, senang, sedih, kaget, marah). Slot teman asli: data dikumpulkan user, diminta sebelum P8.

## 3. Jadwal
Jadwal per hari dalam seminggu, bisa di-override oleh musim, cuaca, dan festival.
```json
{
  "npcId": "npc_teh_rina",
  "default": [
    { "time": "07:00", "area": "braga", "anchor": "rina_home", "anim": "idle" },
    { "time": "08:30", "area": "braga", "anchor": "cafe_counter", "anim": "work" },
    { "time": "17:00", "area": "alun_alun", "anchor": "food_stall_2", "anim": "eat" },
    { "time": "20:00", "area": "braga", "anchor": "rina_home", "anim": "idle" }
  ],
  "overrides": [
    { "when": { "weather": ["rain", "storm"] }, "schedule": "rainy" },
    { "when": { "day": "sun" }, "schedule": "sunday" },
    { "when": { "festival": "*" }, "schedule": "festival" }
  ]
}
```
- Pergerakan memakai **EasyStar** (A*) di grid collision area.
- NPC di area yang tidak aktif hanya diperbarui posisi logisnya (tanpa render).

## 4. Pertemanan NPC
- 0–10 hati (100 poin per hati).
- Naik dari: ngobrol harian (1x/hari), hadiah, quest, festival.
- **Hadiah**: setiap NPC punya daftar `loved`, `liked`, `neutral`, `disliked`, `hated`. Bonus ×3 di hari ulang tahun NPC.
- **Heart events** di 2, 4, 6, 8, 10 hati: cutscene cerita pribadi, kadang memberi resep/item/area rahasia.
- Hadiah dari NPC: di 5 dan 10 hati NPC mengirim hadiah lewat pos.

## 5. Sistem Dialog
- File `src/content/dialogs/<npcId>.json` berisi pool dialog dengan **kondisi**:
```json
{
  "id": "rina_rain_1",
  "conditions": { "weather": "rain", "heartsMin": 2 },
  "lines": [
    { "speaker": "npc_teh_rina", "portrait": "sad", "text": "Hujan terus euy, kafe jadi sepi..." },
    { "choices": [
      { "text": "Aku bantu promosi deh!", "effects": { "friendship": 15 }, "next": "rina_rain_1_a" },
      { "text": "Enak buat ngopi atuh.", "effects": { "friendship": 5 } }
    ]}
  ],
  "once": false,
  "priority": 5
}
```
- **Status (P1-08):** skema zod `src/systems/dialog/schema.ts` (baris `speaker`/`portrait`/`text`, pilihan maks. 4 di baris terakhir dengan `next`/`effects`, id unik, `next` wajib menunjuk dialog yang ada — dites), alur & variabel `{player}` sudah jalan; contoh nyata `dialogs/papan.json` (papan Kebun Warga Lembang, aksi `board:<id>` → dialog `board_<id>`). Kondisi, prioritas, cooldown & efek ke NPC menyusul di P8.
- Kondisi yang didukung: musim, hari, cuaca, jam, hati, tahap hubungan pemain, flag quest, area, item di inventory, siapa yang online.
- Variabel di teks: `{player}`, `{partner}`, `{season}`, `{npc}`.
- Prioritas: dialog event > quest > kondisi spesifik > umum. Dialog yang sudah tampil diberi cooldown.
- Saat berdua online, NPC bisa **menyapa kalian sebagai pasangan** ("Wah, pasangan serasi lewat!") sesuai tahap hubungan.

## 6. Ulang Tahun NPC
Ditampilkan di kalender (app Kalender). Hadiah di hari ultah → poin ×3. Teman dekat (8+ hati) mengundang kalian ke pesta kecil.
