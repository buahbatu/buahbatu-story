# 💬 PROMPT.md — Prompt Siap Pakai

Prompt untuk AI coding agent di VS Code (**Claude Code**, Cursor, GitHub Copilot Agent, dll.).

## 🧭 Cara Pakai
1. Taruh seluruh folder dokumen ini di **root proyek** (sejajar dengan `package.json` nanti).
2. Buka folder di VS Code, lalu jalankan AI agent di folder itu.
3. **Sesi pertama** → pakai Prompt **#1 Kickoff**.
4. **Sesi berikutnya** → pakai Prompt **#2 Lanjut**.
5. Prompt lain dipakai sesuai situasi.
6. Ganti teks di dalam `<…>` sebelum mengirim.

> 💡 Tips: 1 sesi = 1–3 task. Kalau percakapan sudah panjang, mulai sesi baru dengan Prompt #2, karena konteks yang terlalu panjang bikin AI mudah lupa aturan.

---

## #1 · Kickoff (sesi pertama)
```
Kamu adalah senior game developer (TypeScript + Phaser) sekaligus game designer yang teliti. Kita akan membangun "Bandung Story": life-sim pixel 2D untuk dua pemain (pasangan) berlatar Bandung, campuran Harvest Moon + The Sims + GTA, dimainkan berdua online lewat browser.

Semua desain sudah ada di repo ini. Lakukan ini secara berurutan:

1. Baca AGENTS.md sampai habis. Isinya aturan kerja WAJIB.
2. Baca README.md, lalu docs/00-visi.md, 01-tech-stack.md, 02-arsitektur.md, 03-standar-kode.md, 04-keputusan.md.
3. Baca TODO.md.
4. Ringkas pemahamanmu ke saya dalam maksimal 10 poin: konsep game, pilar desain, arsitektur (Command, host-authoritative, data-driven), dan alur kerja per task.
5. Sebutkan hal yang menurutmu ambigu atau berisiko di dokumen (kalau ada), lengkap dengan usulan solusinya.
6. Setelah itu mulai task pertama di TODO.md (P0-01) mengikuti alur di AGENTS.md §3: tandai [~], jelaskan rencana, kerjakan, verifikasi, update TODO.md + CHANGELOG.md, commit, lalu laporkan dengan format laporan di AGENTS.md.

Aturan penting:
- Kerjakan SATU task dalam satu waktu, berurutan.
- Setiap task selesai WAJIB update TODO.md (status, tanggal, catatan, tabel progres) dan CHANGELOG.md.
- Jangan tandai [x] sebelum lint, typecheck, test, dan build hijau.
- Kalau ada keputusan desain yang belum jelas, tanya saya dulu, beri 2–3 opsi beserta rekomendasimu.
- Ide di luar dokumen masuk ke "Backlog Ide" di TODO.md, jangan langsung dibuat.
- Kode dalam bahasa Inggris, teks UI dan dialog dalam bahasa Indonesia.

Setelah P0-01 selesai dan dilaporkan, tanya saya apakah lanjut ke task berikutnya.
```

---

## #2 · Lanjut (setiap sesi baru)
```
Lanjutkan pengembangan Bandung Story.

1. Baca AGENTS.md (aturan wajib).
2. Baca TODO.md. Cari task [~] (lanjutkan) atau task [ ] pertama berikutnya.
3. Baca dokumen yang dirujuk di kolom Ref task tersebut.
4. Jelaskan singkat task apa yang akan dikerjakan beserta rencananya, lalu kerjakan sesuai alur AGENTS.md §3.
5. Setelah selesai: verifikasi (lint, typecheck, test, build), update TODO.md + CHANGELOG.md, commit, lalu laporkan dengan format laporan.

Kerjakan maksimal <1/2/3> task di sesi ini, lalu berhenti dan laporkan progres total (ambil dari tabel Progres di TODO.md).
```

---

## #3 · Kerjakan Task Tertentu
```
Kerjakan task <P3-06> di TODO.md.
Ikuti AGENTS.md §3 dengan ketat. Baca dokumen Ref-nya dulu.
Kalau ada task sebelumnya yang belum selesai dan menjadi syarat task ini, beri tahu saya dulu sebelum mulai.
```

---

## #4 · Review Kualitas (tiap selesai 1 fase)
```
Fase <P3> sudah selesai. Lakukan review menyeluruh sebelum lanjut ke fase berikutnya:

1. Cek setiap task di fase ini: apakah implementasinya benar-benar sesuai dokumen Ref dan Kriteria Selesai fase?
2. Cek kepatuhan arsitektur: semua mutasi lewat Command? logic.ts murni dan ada test-nya? konten di JSON? angka di balance.ts? teks UI di i18n?
3. Cari bug, edge case, kode duplikat, file yang terlalu besar, dan potensi masalah multiplayer.
4. Pastikan TODO.md, CHANGELOG.md, CREDITS.md, dan docs sudah sinkron dengan kode.
5. Buat daftar temuan dengan prioritas (🔴 wajib, 🟡 sebaiknya, 🟢 opsional).
6. Tambahkan temuan 🔴 sebagai task baru di akhir fase (format P3-R1, P3-R2, ...) lalu kerjakan.

Jangan menambah fitur baru di tahap review ini.
```

---

## #5 · Laporkan & Perbaiki Bug
```
Ada bug:
- Yang terjadi: <deskripsi>
- Yang seharusnya: <deskripsi>
- Langkah reproduksi: <1, 2, 3>
- Device/browser: <misal Chrome laptop / Safari iPhone>
- Main solo atau berdua: <solo/berdua>
- Error di console (kalau ada): <tempel>

Langkah yang harus kamu lakukan:
1. Analisis akar masalah (root cause). Jangan langsung tambal gejalanya.
2. Tulis test yang gagal karena bug ini (kalau bug ada di logic).
3. Perbaiki, lalu pastikan test tersebut lolos.
4. Tambahkan entri "Diperbaiki" di CHANGELOG.md. Kalau bug terkait task tertentu, beri catatan di TODO.md.
5. Laporkan penyebab, perbaikan, dan cara tesnya.
```

---

## #6 · Tambah Konten (tanpa fitur baru)
```
Tambahkan konten berikut menggunakan sistem yang sudah ada (JSON di src/content/, jangan ubah kode kecuali benar-benar perlu):

- Jenis: <tanaman / ikan / resep / baju / furnitur / NPC / quest / dialog / festival>
- Detail: <daftar & keterangan>

Aturan:
- Ikuti skema zod yang sudah ada dan pastikan `npm run validate:content` lolos.
- Seimbangkan harga dan angka dengan konten sejenis (lihat docs/13 dan balance.ts).
- Kalau butuh aset baru, gunakan placeholder dan catat kebutuhan asetnya di laporan.
- Catat di CHANGELOG.md.
```

---

## #7 · Isi Konten Personal (Kenangan)
```
Saya ingin memasukkan kenangan pribadi kami. Baca docs/43-konten-personal.md.

Data kami:
<tempel jawaban kuesioner di docs/43 §3>

Tugasmu:
1. Susun src/content/personal/profile.json, memories.json, places.json, friends.json, dan inside-jokes.json sesuai format.
2. Usulkan di mana tiap kenangan sebaiknya terbuka (quest, lokasi, tahap hubungan, tanggal asli, festival), dengan prinsip: tersebar merata, momen paling berkesan ditaruh di titik paling emosional.
3. Tulis dialog/surat yang memakai inside joke kami secara natural (bahasa santai, boleh logat Sunda).
4. Pastikan folder personal/ ada di .gitignore dan game tetap jalan dengan personal.example.
Tampilkan dulu rencana penempatan untuk saya setujui sebelum menulis file.
```

---

## #8 · Ubah / Tambah Desain
```
Saya ingin mengubah/menambah desain: <jelaskan>

1. Analisis dampaknya ke dokumen dan sistem yang sudah ada (sebutkan file docs & kode yang terdampak).
2. Beri 2–3 opsi implementasi beserta plus-minusnya dan rekomendasimu.
3. Setelah saya pilih: update docs terkait, tambahkan ADR di docs/04-keputusan.md (kalau keputusan teknis), lalu tambahkan task baru ke TODO.md di fase yang tepat dan update tabel progres.
Jangan menulis kode sebelum saya setuju.
```

---

## #9 · Cek Progres
```
Baca TODO.md dan CHANGELOG.md, lalu berikan:
1. Progres total & per fase (persentase)
2. Task yang sedang dikerjakan / blocked beserta alasannya
3. 5 task berikutnya
4. Risiko teknis terdekat & saranmu
Jangan ubah file apa pun.
```

---

## #10 · Persiapan Rilis
```
Siapkan rilis <v0.3>. Ikuti checklist rilis di docs/50-testing-deploy.md §7:
- Pastikan semua task fase terkait [x] dan semua cek hijau
- Uji migrasi save dari versi sebelumnya
- Pindahkan isi [Unreleased] di CHANGELOG.md ke versi baru beserta tanggal
- Update versi di package.json & layar judul
- Buat tag git
Laporkan checklist beserta statusnya masing-masing.
```

---

## #11 · Bantu Bikin Tekstur & Acuan Visual (untuk tool gambar AI, opsional)
Game ini 3D low-poly ala Harvest Moon PS1 (ADR-022/024); model dibuat lewat kode. Tool gambar AI hanya membantu **tekstur pixel** yang ditempel ke model, atau **acuan visual** sebuah tempat.
```
Seamless tileable pixel art texture, 32x32 px, PS1-era game texture, warm palette, no anti-aliasing, flat front view (no perspective), no text, no logo.
Subject: <misal "red clay roof tiles", "Sundanese woven bamboo wall (bilik)", "white plaster wall with slight stains">
```
⚠️ Kirim hasilnya ke AI agent untuk dicek ukuran, palet & lisensinya, lalu dicatat di `CREDITS.md` (`docs/42`). Jangan pakai foto/aset game lain sebagai input.
