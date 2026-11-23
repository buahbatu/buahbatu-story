# 🌾💗 Buahbatu Story

> Life-sim pixel 2D untuk **dua orang**, campuran **Harvest Moon** (bertani, musim, festival), **The Sims** (hidup dari lajang → pacaran → nikah → punya anak) dan **GTA** (dunia luas, kendaraan, belanja, HP). Berlatar **Bandung** dan dimainkan berdua secara online lewat browser.

---

## 📌 Cara Pakai Dokumen Ini

| Kamu siapa | Baca ini dulu |
|---|---|
| **Pemilik proyek (manusia)** | `README.md` → `docs/00-visi.md` → `TODO.md` → `PROMPT.md` |
| **AI coding agent** (Claude Code, Cursor, Copilot, dll.) | `AGENTS.md` (WAJIB) → `TODO.md` → dokumen yang dirujuk di task |

Alur kerja singkat:
1. Buka folder proyek di **VS Code**.
2. Salin `.env.example` → `.env.local`, isi **token** bagian "DIISI USER" (`docs/51` §4).
3. Jalankan AI agent, lalu tempel **Prompt #1 Kickoff** dari `PROMPT.md`.
4. Agent mengerjakan task di `TODO.md` **satu per satu**: nulis kode, nulis & menjalankan tes, push, dan deploy **sendiri** memakai akun proyek ini.
5. **Setiap task selesai → `TODO.md` dan `CHANGELOG.md` wajib di-update.**
6. Kamu cukup baca laporan, sesekali playtest berdua, lalu kasih feedback.

### 👤 Yang dikerjakan manusia (cuma ini)
| Kapan | Tugas |
|---|---|
| Sekali | Install VS Code, Node.js LTS, Git, AI agent; bikin akun GitHub/Vercel/Supabase |
| Sekali | Bikin token & isi `.env.local` (daftar di `docs/51` §4) |
| P0-00 | Konfirmasi akun yang dipakai (AI mendeteksi pola dari proyek lain) |
| P8 | Isi kuesioner kenangan (`docs/43`) + foto |
| P11 | Bikin akun TURN & isi token-nya |
| Kapan saja | Playtest berdua, kasih feedback |

---

## 🗂️ Peta Dokumen

### Root
| File | Isi |
|---|---|
| `AGENTS.md` | Aturan kerja wajib untuk AI agent |
| `CLAUDE.md` | Pointer ke `AGENTS.md` (dibaca otomatis oleh Claude Code) |
| `TODO.md` | Roadmap + daftar task + status progres |
| `CHANGELOG.md` | Catatan perubahan per task / versi |
| `PROMPT.md` | Kumpulan prompt siap pakai |
| `CREDITS.md` | Kredit aset & lisensi (wajib diisi saat menambah aset) |

### `docs/` — Fondasi
| File | Isi |
|---|---|
| [`00-visi.md`](docs/00-visi.md) | Konsep, pilar desain, gameplay loop, non-goals |
| [`01-tech-stack.md`](docs/01-tech-stack.md) | Teknologi, alasan, setup VS Code |
| [`02-arsitektur.md`](docs/02-arsitektur.md) | Struktur folder, state, command, scene, sistem |
| [`03-standar-kode.md`](docs/03-standar-kode.md) | Konvensi kode, testing, Git, Definition of Done |
| [`04-keputusan.md`](docs/04-keputusan.md) | Catatan keputusan arsitektur (ADR) |

### `docs/` — Dunia & Gameplay
| File | Isi |
|---|---|
| [`10-dunia-bandung.md`](docs/10-dunia-bandung.md) | Area peta Bandung, landmark, konvensi Tiled |
| [`11-waktu-musim-cuaca.md`](docs/11-waktu-musim-cuaca.md) | Jam, kalender, musim, cuaca, siang/malam |
| [`12-pertanian-peternakan.md`](docs/12-pertanian-peternakan.md) | Alat, tanah, tanaman, ternak, mesin olahan |
| [`13-ekonomi-karier.md`](docs/13-ekonomi-karier.md) | Uang, toko, jual-beli, pekerjaan, karier, bank |
| [`14-properti-kendaraan.md`](docs/14-properti-kendaraan.md) | Rumah, tanah, kredit, dekor ala Sims, kendaraan |
| [`15-karakter-outfit.md`](docs/15-karakter-outfit.md) | Character creator, layered sprite, baju & toko |
| [`16-hubungan-tahap-hidup.md`](docs/16-hubungan-tahap-hidup.md) | Kebutuhan, mood, trait, interaksi, lajang → nikah |
| [`17-keluarga-anak.md`](docs/17-keluarga-anak.md) | Anak, tumbuh kembang, sekolah |
| [`18-npc.md`](docs/18-npc.md) | Warga Bandung, jadwal, pertemanan, dialog |
| [`19-quest-event-festival.md`](docs/19-quest-event-festival.md) | Quest, cerita utama, cutscene, festival, event |
| [`20-aktivitas.md`](docs/20-aktivitas.md) | Mancing, masak, crafting, eksplorasi, foto, minigame |
| [`21-progresi-endgame.md`](docs/21-progresi-endgame.md) | Skill, koleksi, achievement, konten jangka panjang |

### `docs/` — Online & Teknis
| File | Isi |
|---|---|
| [`30-multiplayer.md`](docs/30-multiplayer.md) | Main berdua realtime, host, sinkronisasi |
| [`31-voice.md`](docs/31-voice.md) | Voice chat proximity, voice note, suara kenangan, blip |
| [`32-backend-save.md`](docs/32-backend-save.md) | Supabase, skema DB, RLS, save, keep-alive |
| [`40-ui-ux.md`](docs/40-ui-ux.md) | HUD, HP (ponsel), menu, kontrol, aksesibilitas |
| [`41-audio.md`](docs/41-audio.md) | Musik, SFX, ambience |
| [`42-aset-lisensi.md`](docs/42-aset-lisensi.md) | Art direction, sumber aset, lisensi, pipeline |
| [`43-konten-personal.md`](docs/43-konten-personal.md) | Kenangan asli kalian, kuesioner, privasi |
| [`50-testing-deploy.md`](docs/50-testing-deploy.md) | Tes otomatis oleh AI (unit, E2E, multiplayer, visual), performa, rilis |
| [`51-otomasi-akun-env.md`](docs/51-otomasi-akun-env.md) | Akun per folder, daftar env/token, setup & deploy otomatis |

---

## ⚙️ Ringkasan Teknis

| Bagian | Pilihan |
|---|---|
| Engine | **Phaser** + **TypeScript** + **Vite** |
| Peta | **Tiled** (export JSON) |
| UI menu | **Preact** overlay (DOM) + CSS pixel |
| Backend | **Supabase** (Auth, Postgres, Realtime, Storage) |
| Voice | **WebRTC** + TURN |
| Hosting | **Vercel** (gratis, tanpa VPS) + Vercel Cron |
| Aset | LPC 32px (gratis, open license) + pixel art custom |

Total biaya: **Rp0** (semua free tier). Opsional: domain custom & aset premium.

---

## 📈 Status

Lihat **`TODO.md`** → tabel *Progres per Fase*.
