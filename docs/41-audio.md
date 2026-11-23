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
