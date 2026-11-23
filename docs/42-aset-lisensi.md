# 42 · Aset, Art Direction & Lisensi

## 1. Art Direction
- **Gaya**: **2.5D ala Harvest Moon: Back to Nature** (ADR-022): dunia **3D low-poly** bertekstur pixel kecil (filter nearest), karakter & NPC **sprite chibi** (billboard, 8 arah), kamera miring dari atas, render resolusi rendah ala PS1, palet hangat. Semua orisinal.
- **Konsistensi > kemewahan**: semua aset harus terlihat dari "dunia yang sama". Jangan campur aset 16px dan 32px.
- **Palet utama**: hijau daun Lembang, krem kolonial Braga, merah stroberi, biru langit Bandung, oranye senja.
- Landmark & bangunan Bandung dibentuk **custom** (model low-poly modular + tekstur), setiap bangunan berbeda (`10` §5).

## 2. Sumber Aset Gratis
| Kebutuhan | Sumber | Lisensi umum |
|---|---|---|
| Karakter berlapis + baju | Universal LPC Spritesheet Generator, OpenGameArt (LPC) | CC-BY-SA 3.0 / GPL 3 / OGA-BY (berbeda per bagian) |
| Tileset alam/kota | OpenGameArt koleksi LPC (terrain, city, interior, farming) | CC-BY-SA / GPL / CC0 |
| Ikon item | OpenGameArt, aset LPC item | Beragam |
| UI pixel | Kenney (pixel UI), OpenGameArt | CC0 |
| Audio | Freesound (filter CC0), OpenGameArt, Kenney | CC0 / CC-BY |
| Font | Google Fonts (pixel) | OFL |

## 3. Kewajiban Lisensi
| Lisensi | Kewajiban |
|---|---|
| **CC0** | Tidak ada (kredit tetap disarankan) |
| **CC-BY** | Cantumkan nama pembuat + link + lisensi |
| **CC-BY-SA** | Kredit + **turunan aset** harus dibagikan dengan lisensi sama |
| **GPL** | Kredit + aset turunan ikut GPL |
| **OGA-BY** | Kredit (mirip CC-BY tanpa larangan DRM) |
| **OFL** (font) | Boleh dipakai, jangan menjual font-nya |

**Aturan proyek:**
- Setiap aset baru → **wajib** dicatat di `CREDITS.md` (nama file, pembuat, sumber URL, lisensi, modifikasi).
- Simpan lisensi asli di `public/assets/licenses/`.
- Layar **Kredit** di game menampilkan isi `CREDITS.md`.
- ❌ **Dilarang**: sprite hasil rip dari Harvest Moon, Stardew Valley, The Sims, GTA, atau game komersial lain.
- ❌ Hindari logo/merek asli (Persib, merek toko asli). Pakai nama plesetan atau generik.
- ⚠️ Aset buatan AI: hanya untuk konsep/placeholder kecuali hasilnya dirapikan manual dan konsisten gaya. Periksa ketentuan tool yang dipakai.

## 4. Tools Pixel Art
LibreSprite (gratis), Piskel (browser), Aseprite (berbayar / compile sendiri). Untuk potret dari foto: konversi otomatis (Pixel It), lalu **wajib** dirapikan manual.

## 5. Pipeline
```
Sumber (.ase/.png per frame)
  → export spritesheet PNG
  → free-tex-packer → atlas (.png + .json) per kategori
  → public/assets/<kategori>/
  → daftarkan key di src/config/assets.ts
  → catat di CREDITS.md
```
- Penamaan: `kategori_nama_varian` (contoh `crop_strawberry_stage3`, `npc_teh_rina_walk`).
- Ukuran atlas maksimal 2048×2048.
- Gambar besar (potret, foto) → WebP.

## 6. Daftar Aset Custom Prioritas
1. Potret pemain A & B (8 ekspresi)
2. Landmark: Gedung Sate, fasad Braga, Gedung Merdeka, kebun teh, Kawah Putih
3. Angkot (hijau-oranye khas Bandung) + halte
4. Tanaman lokal: stroberi, ubi cilembu, teh, kopi
5. Makanan Sunda (ikon resep)
6. Motor bebek/matic/vespa top-down
7. NPC khas (Mang Ujang + gerobak batagor)

## 7. CREDITS.md (template)
```
| Aset | Pembuat | Sumber | Lisensi | Modifikasi |
|---|---|---|---|---|
| characters/body_* | (lihat daftar LPC) | <url> | CC-BY-SA 3.0 / GPL 3 | Recolor |
```
