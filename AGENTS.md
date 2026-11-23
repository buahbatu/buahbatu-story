# 🤖 AGENTS.md — Aturan Wajib untuk AI Coding Agent

Dokumen ini **mengikat**. Baca seluruhnya sebelum menulis kode apa pun.

---

## 1. Konteks Proyek
- Game life-sim pixel 2D untuk **2 pemain** (pasangan), berlatar **Bandung**.
- Campuran Harvest Moon + The Sims + GTA. Visi lengkap: `docs/00-visi.md`.
- Stack: Phaser + TypeScript + Vite + Preact (UI) + Supabase + Vercel. Detail: `docs/01-tech-stack.md`.
- Arsitektur **wajib** diikuti: `docs/02-arsitektur.md`.

## 2. Urutan Baca di Awal Setiap Sesi
1. `AGENTS.md` (file ini)
2. `TODO.md` → cari task `[~]` (sedang dikerjakan) atau task `[ ]` pertama
3. Dokumen yang dirujuk di kolom **Ref** task tersebut
4. `docs/03-standar-kode.md` dan `docs/04-keputusan.md` jika belum dibaca di sesi ini

## 3. Alur Kerja per Task (WAJIB)

```
PILIH → TANDAI [~] → RENCANA → KERJAKAN + TULIS TES → VERIFIKASI → UPDATE TODO + CHANGELOG → COMMIT + PUSH → CEK CI/DEPLOY → LAPOR
```

1. **Pilih** task `[ ]` paling atas di fase aktif. Jangan lompat kecuali task itu `[!]` (blocked).
2. **Tandai** task jadi `[~]` + tanggal mulai di `TODO.md` **sebelum** mulai ngoding.
3. **Rencana**: tulis rencana singkat (3–7 poin) ke user, termasuk file yang akan dibuat/diubah.
4. **Kerjakan** dalam perubahan kecil. Ikuti `docs/03-standar-kode.md`. **Tulis tesnya sendiri**: unit test untuk logic + skenario E2E (`e2e/*.spec.ts`) untuk gameplay/UI (`docs/50`).
5. **Verifikasi**: AI sendiri yang menjalankan semua tes, user tidak disuruh ngetes. Semua harus hijau:
   - `npm run verify` = lint + typecheck + test + build + E2E
   - E2E multiplayer (`npm run e2e:mp`) kalau task menyentuh sinkronisasi (fase P6 ke atas)
   - Perubahan tampilan → **buka screenshot hasil E2E dan nilai sendiri secara visual** (`docs/50` §5)
   - Kriteria Selesai fase dibuktikan dengan E2E, bukan dengan meminta user mengecek
6. **Update dokumen**:
   - `TODO.md`: ubah `[~]` → `[x]`, isi tanggal selesai + catatan singkat (≤1 baris), update tabel progres fase.
   - `CHANGELOG.md`: tambah entri di `## [Unreleased]` dengan ID task.
   - Jika implementasi menyimpang dari docs → **update docs terkait** + tambah ADR di `docs/04-keputusan.md`.
7. **Commit + push** memakai **akun proyek ini** (`docs/51`): `feat(P3-05): tanaman tumbuh per hari`. Lalu pantau CI (`gh run watch`) sampai hijau dan pastikan deploy Preview/Production berhasil. CI merah → perbaiki dulu, task belum selesai.
8. **Lapor** ke user dengan format:
   ```
   ✅ Selesai: P3-05 — <judul>
   📁 File: <daftar file utama>
   🧪 Tes yang dijalankan: <unit X lolos, E2E Y lolos, screenshot terlampir>
   🌐 Deploy: <URL preview/production>
   🎮 Coba sendiri (opsional): <1–2 langkah kalau mau ngerasain>
   ⚠️ Catatan: <kalau ada>
   ⏭️ Berikutnya: P3-06 — <judul>
   ```

> ❗ **Task TIDAK BOLEH ditandai `[x]` jika `verify` atau CI gagal.** Kalau mentok, tandai `[!]` + alasan, lalu laporkan.

## 3a. Akun, Env & Otomasi (WAJIB)
- Proyek ini berbagi perangkat dengan proyek lain. **Semua perintah `git`, `gh`, `vercel`, `supabase` wajib memakai akun proyek ini** sesuai pola hasil task P0-00 (`docs/51` §2–3). Jangan memakai atau mengubah login global.
- **Jangan menyuruh user melakukan langkah yang bisa dikerjakan lewat CLI/script** (bikin repo, bikin project Supabase, isi env Vercel, set GitHub secrets, push, deploy).
- Butuh kredensial? Jalankan `npm run doctor`, lalu sebutkan **persis** nama variabel yang kurang + link tempat membuatnya (`docs/51` §4). User mengisinya sendiri di `.env.local`.
- **Jangan pernah** menampilkan, menyalin ke chat, mencatat di log, atau meng-commit nilai rahasia. Selalu samarkan (`ghp_****abcd`).
- Jangan menyentuh/mengubah file di proyek lain (kelola, prins, shaflow, kis). Proyek-proyek itu **hanya dibaca** saat P0-00, dan nilai rahasianya tidak dibaca.

## 4. Aturan Status di TODO.md

| Simbol | Arti |
|---|---|
| `[ ]` | Belum dikerjakan |
| `[~]` | Sedang dikerjakan (maks. **1 task** sekaligus) |
| `[x]` | Selesai & terverifikasi |
| `[!]` | Blocked (wajib tulis alasan) |
| `[-]` | Dibatalkan (wajib tulis alasan) |

Format baris task:
```
- [x] **P3-05** Tanaman tumbuh per hari · Ref: 12 · ✅ 2026-12-01 · catatan singkat
```

## 5. Aturan Desain & Kode
- **Data-driven**: konten (item, tanaman, NPC, quest, dialog, outfit, harga) di `src/content/*.json`, divalidasi **zod**. Jangan hardcode konten di kode.
- **Logika murni terpisah dari Phaser** (`src/systems/*/logic.ts`), wajib ada unit test.
- **Semua perubahan state lewat Command** (`docs/02-arsitektur.md` §4). Ini wajib supaya multiplayer bisa jalan.
- **Angka balancing** hanya di `src/config/balance.ts`.
- **Teks UI & dialog** pakai Bahasa Indonesia (boleh logat Sunda). **Identifier kode** pakai Bahasa Inggris.
- **Tanpa kekerasan, tanpa hukuman berat** (lihat pilar di `docs/00-visi.md`).
- **Jangan** pakai aset hasil rip dari Harvest Moon/Stardew/Sims. Setiap aset baru wajib dicatat di `CREDITS.md`.
- **Jangan** commit secret. Semua kunci rahasia lewat env (`.env.local`, Vercel env).
- **Jangan** commit konten personal (foto, audio, nama asli) ke repo publik. Lihat `docs/43-konten-personal.md`.

## 6. Saat Ragu
- Desain belum jelas atau bertentangan → **tanya user**, beri 2–3 opsi + rekomendasi.
- Punya ide fitur baru → **jangan langsung dibuat**. Tambahkan ke bagian `## 💡 Backlog Ide` di `TODO.md`.
- Task terlalu besar (>~400 baris perubahan) → pecah jadi sub-task (`P3-05a`, `P3-05b`) di `TODO.md` dulu.

## 7. Yang Dilarang
- ❌ Menandai task selesai tanpa verifikasi
- ❌ Mengerjakan banyak task sekaligus
- ❌ Refactor besar di luar scope task tanpa izin
- ❌ Menghapus/mengubah docs tanpa mencatat alasannya
- ❌ Menambah dependency baru tanpa menyebut alasannya di laporan & ADR (kalau signifikan)
- ❌ Menurunkan strictness TypeScript / mematikan rule lint untuk "lolos"
