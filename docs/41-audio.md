# 41 · Audio

## 1. Kanal Volume
`Master`, `Musik`, `SFX`, `Ambience`, `Suara` (voice chat/voice note/kenangan), `Blip`. Semua bisa diatur di Pengaturan dan disimpan per pemain.

## 2. Musik
| Konteks | Mood | Catatan |
|---|---|---|
| Judul | Hangat, nostalgia | Motif tema utama |
| Per area (`10` §7) | Sesuai karakter area | Variasi siang/malam |
| Per musim | Instrumen berbeda | Semi: flute; Panas: ukulele; Gugur: gitar; Dingin: piano + lonceng |
| Festival | Ceria, khas | Angklung/kendang untuk Seren Taun |
| Momen romantis | Lembut | Untuk cutscene tahap hubungan |
| **Lagu kalian** | Personal | Diputar di cutscene/kenangan tertentu (`43`) |

- Crossfade 1–2 detik saat pindah area/jam.
- Musik berhenti saat hujan deras di luar ruangan (diganti ambience) supaya terasa *cozy*.
- Motif **angklung** dipakai sebagai identitas audio game.

## 3. Ambience
Hujan (luar/dalam rumah beda), angin, kota ramai Braga, jangkrik malam Lembang, sungai Tahura, ayam pagi, sapi, pengamen, azan dari jauh (opsional, bisa dimatikan).

## 4. SFX (daftar minimum)
UI: klik, buka/tutup HP, notifikasi, uang masuk, gagal.
Pertanian: cangkul, siram, tanam, panen, alat diupgrade.
Gerak: langkah (rumput/tanah/kayu/aspal), pintu, motor, klakson angkot.
Sosial: emote, ajakan masuk, pasangan online 💗, peluk.
Lainnya: masak, mancing (lempar, gigitan, tarik), kamera, kembang api, lonceng festival.

## 5. Sumber & Lisensi
- Utamakan **CC0** (Freesound CC0, OpenGameArt CC0, Kenney audio).
- CC-BY boleh, kredit wajib dicatat di `CREDITS.md`.
- **Lagu komersial** (lagu kalian) hanya untuk build privat. Jangan dipublikasikan.

## 6. Teknis
- Format: **OGG** + fallback **M4A** (Safari).
- Musik di-stream, SFX di-preload per area.
- Audio baru diaktifkan setelah interaksi pertama pengguna (kebijakan autoplay browser).
- Sistem `systems/audio/` mendengarkan GameEvent (misal `farm/harvested` → SFX panen), jadi sistem lain tidak memanggil audio langsung.

## 7. Implementasi (P1B-02d)
- **Saluran aktif**: `Master`, `Musik`, `Efek suara` (SFX), `Suasana` (ambience); `Suara` & `Blip` menyusul P11. Pengaturan on/off + volume di tab **Suara** menu ⚙, tersimpan di `localStorage` (`bb.audio`), berlaku langsung (ramp halus).
- **Data**: `src/content/sounds.json` (divalidasi zod `systems/audio/schema.ts`): daftar suara (saluran, varian file, volume, rentang pitch acak, loop), peta jenis tanah → permukaan langkah. Logika murni di `systems/audio/logic.ts`, WebAudio di `engine.ts`, perakitan di `runtime.ts`.
- **Format**: OGG Vorbis, fallback **M4A/AAC** otomatis bila browser tak bisa OGG (dicek `canPlayType`). File dibuat dengan ffmpeg (trim hening, normalisasi, loop di-crossfade).
- **Suara kontinu dari adegan, bukan GameEvent**: langkah kaki (irama jalan/lari, varian tak berulang, permukaan rumput/kerikil/kayu/keras/karpet/air) dan gemericik sungai/curug (volume mengikuti jarak ke petak air & air terjun) dikirim `WorldScene` lewat antarmuka `SoundCues`, karena terjadi tiap frame. Event sesaat gameplay (panen, dll.) tetap lewat GameEvent saat sistemnya dibuat.
- **Autoplay**: AudioContext baru dibuat/dilanjutkan pada interaksi pertama (pointer/tombol/sentuh); dijeda saat tab disembunyikan.
- **Musik (P1B-02e)**: bawaan bebas lisensi bernuansa BTN (rekomendasi AI, disetujui user): judul = kotak musik "cute tune", pagi/siang = "Fields of Cabbage" & "Shepherd Dog" (bergantian, tak berulang), sore (16.30–19.00) = "Pastoral", malam (19.00–06.00) = "Bedtime Music Box". Diputar lewat `<audio>` streaming (tidak dimuat utuh ke memori) → saluran Musik, crossfade 1,6 dtk saat suasana berganti. Daftar lagu & suasana di `sounds.json` (`music`). Lagu pilihan user (BTN) lewat Supabase privat di P5-11.
- **Air diam vs mengalir**: perairan dikelompokkan otomatis (flood-fill); yang menyentuh tepi peta atau tersambung curug = mengalir (gemericik), kolam/danau tertutup = riak tenang pelan berjangkauan pendek.
