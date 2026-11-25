# 17 · Keluarga & Anak

## 1. Memulai Keluarga
- Syarat: tahap **Menikah** + tinggal serumah + ada ranjang bayi.
- **Keputusan bersama**: salah satu memilih "Ngobrol rencana anak" → pasangan harus menyetujui (berdua online).
- Opsi: **punya anak** atau **adopsi** (via kantor kelurahan).
- **Sepenuhnya opsional (ADR-028)**: hanya terbuka bila kedua pemain memilih. Tidak ada NPC, quest, atau notifikasi yang mendesak punya anak. Jalur **tanpa anak** adalah akhir yang sama lengkap & bahagia (rumah penuh kucing, kebun, perjalanan berdua, proyek kota), bukan akhir kelas dua.
- Ditampilkan dengan sopan: event *"Kabar Bahagia"* → masa penantian **14 hari game** dengan quest persiapan (beli perlengkapan, dekor kamar bayi, kelas calon orang tua) → cutscene kelahiran (tidak eksplisit).
- Jumlah anak maksimum: **3** (bisa diatur di `balance.ts`).

## 2. Tahap Tumbuh Kembang
| Tahap | Durasi (default) | Kebutuhan | Interaksi |
|---|---|---|---|
| 👶 Bayi | 14 hari | Susu, popok, tidur, perhatian | Gendong, nina bobo, main cilukba |
| 🧒 Balita | 1 musim | Makan, main, tidur | Ajari jalan/bicara/potty (skill balita) |
| 👧 Anak | 1 tahun | + PR, teman | Antar sekolah, bantu PR, main bareng, ajak mancing |
| 🧑 Remaja | 1 tahun | + hobi, uang saku | Ngobrol, kursus, bantu kebun/kafe |
| 🎓 Dewasa muda | Endgame | — | Lulus, pilih jalan hidup (lihat §6) |

- Durasi tiap tahap diatur di `balance.ts`.
- **Kebutuhan anak turun pelan** dan bisa diurus salah satu orang tua. **Babysitter NPC** (Bu Euis) bisa disewa saat dua-duanya sibuk/offline.
- Anak tidak pernah sakit parah atau hilang. Kalau terabaikan, efeknya hanya mood anak turun + dialog sedih (memotivasi tanpa menghukum).

## 3. Penampilan & Sifat Anak
- **Penampilan**: gabungan acak dari kedua orang tua (warna kulit, warna/gaya rambut) + sedikit variasi.
- **Trait anak**: 1 trait dari tiap orang tua + 1 acak; terungkap bertahap saat tumbuh.
- **Nama**: diberi oleh orang tua (salah satu mengusulkan, pasangan menyetujui).
- Sprite anak memakai base LPC child.

## 4. Sekolah
| Jenjang | Saat | Biaya |
|---|---|---|
| TK | Akhir balita | Pendaftaran + bulanan (per musim) |
| SD | Tahap anak | Per musim + seragam + buku |
| SMP/SMA | Tahap remaja | Per musim |

Mekanik:
- **Antar-jemput** (opsional, memberi bonus mood anak & ortu).
- **PR**: minigame singkat bersama anak (berhitung, membaca, menggambar). Bisa dikerjakan berdua untuk bonus.
- **Nilai/rapor** tiap akhir musim, ditentukan oleh PR, mood, dan perhatian. Rapor bagus → hadiah & moodlet bangga.
- **Acara sekolah**: pentas seni (angklung!), lomba 17-an anak, study tour ke Museum Geologi.
- **Beasiswa** kalau rapor konsisten bagus (diskon biaya).

## 5. Aktivitas Keluarga
- Piknik di Tahura, liburan ke Ciwidey, Festival keluarga.
- Anak (≥ tahap Anak) bisa **membantu**: siram tanaman, kasih makan ayam, bantu jualan di kafe.
- **Foto keluarga** tahunan, otomatis masuk album & bingkai di rumah.
- **Pohon keluarga** di app Keluarga.

## 6. Legacy (Endgame)
- Kelulusan anak → cutscene + pilihan jalan hidup anak (meneruskan kebun, kafe, merantau, kuliah).
- Anak dewasa muncul sebagai NPC yang sesekali datang membawa cerita/hadiah.
- Achievement keluarga & aspirasi "Keluarga Bahagia".
