# 43 · Konten Personal (Kenangan Kalian)

> Bagian yang membuat game ini **milik kalian**. Kodenya bisa generik, tapi isi di folder ini yang bikin salting.

## 1. Lokasi & Privasi
```
src/content/personal/          ← DI-COMMIT (ADR-033)
├─ profile.json                # nama, ultah, anniversary, kesukaan
├─ memories.json               # daftar kenangan + syarat terbuka
├─ places.json                 # tempat asli kalian di peta
├─ friends.json                # NPC dari teman/keluarga asli
├─ inside-jokes.json           # dialog/easter egg
├─ songs.json                  # lagu untuk cutscene tertentu
├─ photos/                     # (atau di Supabase Storage privat)
└─ audio/                      # suara kenangan
src/content/personal.example/  ← DI-COMMIT, berisi contoh placeholder
```
- Repo **public** selama development, **private** saat final (ADR-010). **Keputusan user (ADR-033, 2026-11-26)**: isi `personal/` (nama lengkap, tempat, tanggal, kenangan, foto, audio) **di-commit** supaya tidak repot; risikonya sudah dijelaskan (repo & URL deploy publik). Commit hanya yang dipakai game; detail sensitif yang tidak dibutuhkan cerita tidak ditulis. Rahasia (token/kunci) tetap tidak pernah masuk repo.
- Media personal boleh ikut build; bucket privat Supabase tetap opsi kalau nanti ingin di balik login.
- Game **harus tetap jalan** walau folder `personal/` kosong (fallback ke `personal.example`).

## 2. Format
### `profile.json`
```json
{
  "players": {
    "A": { "nickname": "…", "realBirthday": "MM-DD", "favoriteFood": "…", "favoriteColor": "…" },
    "B": { "nickname": "…", "realBirthday": "MM-DD", "favoriteFood": "…", "favoriteColor": "…" }
  },
  "anniversary": "YYYY-MM-DD",
  "petName": "…",
  "realDateEvents": []
}
```

### `memories.json`
```json
[
  {
    "id": "mem_first_meet",
    "title": "Pertama Ketemu",
    "date": "YYYY-MM-DD",
    "place": "…",
    "text": "Tulisan dari kamu buat dia…",
    "photo": "photos/first_meet.webp",
    "audio": "audio/first_meet.m4a",
    "unlock": { "kind": "quest", "id": "main_ch2_meet" }
  }
]
```
Jenis `unlock`: `quest`, `stage`, `realDate`, `festival`, `location` (datang ke tempat tertentu), `item` (menemukan item rahasia), `achievement`, `photo` (foto di lokasi tertentu).

### `places.json`
Tempat asli (kafe tempat jadian, kampus, rumah makan favorit) → dijadikan bangunan/spot di area yang sesuai dengan nama asli atau plesetan.

### `friends.json`
Teman/keluarga asli → NPC dengan sifat, kesukaan, dan gaya bicara mereka. **Minta izin dulu** ke orangnya kalau memakai nama asli 😄

## 3. Kuesioner (isi sebelum fase konten)
**✅ Sudah diketahui**
- Judul game: **Buahbatu Story**
- Pemain B: **Michelle Melinda**, asal **Buahbatu**, Bandung (area spesial `buahbatu`, lihat `10`)
- Kucing Michelle (dari user, 2026-11-24): **Luna** (putih) & **Ngkok** (putih-abu bercorak). Tinggal di rumah Michelle (`rumah_michelle`); bisa dielus & jadi peliharaan bersama (P3-11).

**Tentang Buahbatu & keluarga Michelle**
- Tempat-tempat Buahbatu yang berarti buat Michelle (rumah, sekolah, jajanan & kafe langganan, taman)
- Foto referensi rumah/jalan sekitar (untuk pixel art)
- Nama panggilan & sifat Mamah/Papah/saudara Michelle (minta izin Michelle dulu 😄)
- Makanan khas rumah (bisa jadi "resep keluarga" di game)

**Tentang kalian**
1. Nama panggilan masing-masing & panggilan sayang
2. Tanggal lahir masing-masing, tanggal jadian
3. Ketemu pertama di mana & gimana ceritanya?
4. Siapa yang nembak, di mana, gimana?
5. 5–10 momen paling berkesan (tanggal, tempat, cerita singkat)
6. Inside joke / kata-kata khas kalian
7. Tempat favorit kalian di Bandung (atau kota kalian)
8. Makanan favorit masing-masing & makanan favorit bareng
9. Lagu kalian
10. Hewan peliharaan (nama, jenis)
11. Hobi masing-masing
12. Mimpi bareng ke depan (rumah impian, liburan, dll.)

**Untuk karakter**
13. Foto wajah jelas masing-masing (depan, cahaya terang)
14. Gaya rambut/hijab, kacamata, warna favorit, outfit khas
15. Outfit saat momen penting (kencan pertama, dll.)

**Untuk NPC**
16. 3–6 teman/keluarga dekat yang mau dimasukkan + sifat singkat

## 4. Ide Penempatan Kenangan
- Surat tersembunyi di bawah pohon Tahura (quest rahasia).
- Foto kencan pertama terbuka saat pertama kali ngopi berdua di kafe Braga dalam game.
- Voice note "selamat pagi" diputar acak saat bangun tidur (langka).
- Spot rahasia di Dago berisi bangku dengan nama kalian.
- NPC teman asli menyapa dengan inside joke.
- Kenangan "masa depan" (mimpi bareng) terbuka setelah menikah di game.
