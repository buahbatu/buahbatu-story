# 15 · Karakter & Outfit

## 1. Character Creator
Dilakukan sekali di awal (bisa diubah lagi di salon/cermin dengan biaya).

| Kategori | Pilihan |
|---|---|
| Badan | Tipe badan LPC (2–3 varian) |
| Warna kulit | 8+ tone |
| Wajah | Mata, alis, hidung (varian LPC) |
| Rambut | 20+ gaya × palet warna |
| Hijab | Opsional, beberapa gaya & warna (masuk slot Kepala) |
| Kumis/jenggot | Opsional |
| Kacamata | Opsional |
| Nama | Nama panggilan |
| Ulang tahun (game) | Pilih hari & musim |
| Trait | 3 trait (lihat `16`) |

**Tujuan: mirip kalian.** Kemiripan di sprite kecil dicapai lewat **ciri khas** (rambut/hijab, kacamata, warna kulit, baju khas). Kemiripan wajah ada di **potret dialog** (§4).

### Status (P1-04): karakter 3D (ADR-025)
Pemain & NPC memakai **Kenney Mini Characters (CC0)**: GLB bertulang dengan animasi (idle, walk, sprint, sit, pick-up, interact, emote, …) di `public/assets/models/characters/`. Tampilan per karakter = `model` + pewarnaan ulang sel palet `colormap.png` (`src/entities/player/appearance.ts`, `character.ts`). Sistem outfit P7 memakai pergantian model/part & palet, bukan layer spritesheet; bagian LPC di bawah usang dan direvisi saat P7.

## 2. Layered Sprite (Paper Doll)
Setiap karakter = tumpukan layer spritesheet dengan **frame layout identik** (standar LPC).

Urutan render (bawah → atas):
```
1 body → 2 eyes → 3 feet(shoes) → 4 legs(bottom) → 5 torso(top)
→ 6 outer(jacket) → 7 hair → 8 head(hat/hijab) → 9 face_acc(glasses) → 10 back_acc(bag)
```
- Semua layer memakai animasi yang sama: `idle`, `walk`, `run`, `use_tool` (hoe/water/swing), `carry`, `sit`, `sleep`, `ride`, `hug`, `emote_*`.
- Implementasi: setiap layer = sprite anak dalam 1 Container; semua di-play dengan key animasi yang sama + frame yang disinkronkan. **Optimasi**: komposit (bake) layer ke 1 RenderTexture saat outfit berubah, lalu animasikan hasil bake-nya.
- **Pewarnaan**: rambut & beberapa baju memakai palet/tint (atau palette swap shader) supaya 1 aset bisa banyak warna.
- Sumber: **Universal LPC Spritesheet Generator** → export per layer. Kredit wajib dicatat (lihat `42`).

## 3. Slot Outfit
| Slot | Contoh |
|---|---|
| Kepala | Topi, hijab, bando, helm |
| Atasan | Kaos, kemeja, blus, kebaya |
| Luaran | Jaket, hoodie, cardigan, jas |
| Bawahan | Jeans, rok, celana bahan |
| Sepatu | Sneakers, sandal, sepatu boots |
| Aksesoris wajah | Kacamata, masker |
| Aksesoris badan | Tas, jam, syal |
| **Set** | Dress/kebaya/jas pengantin, menimpa slot atas+bawah |

Contoh data (`outfits.json`):
```json
{
  "id": "jeans_cihampelas_blue",
  "slot": "bottom",
  "name": "Jeans Cihampelas Biru",
  "layers": { "legs": "lpc/legs/pants_jeans" },
  "tint": "#3b5b8c",
  "price": 85000,
  "shop": ["cihampelas_denim"],
  "tags": ["casual", "denim"],
  "warmth": 1,
  "rarity": "common"
}
```

## 4. Potret Dialog
- Ukuran 96×96 px (tampil 2–3× di kotak dialog).
- Dibuat dari foto kalian: konversi foto ke pixel (misal pakai Pixel It) → rapikan manual di LibreSprite.
- **Ekspresi wajib**: netral, senang, ketawa, malu (blush), kaget, sedih, kesal, ngantuk.
- Potret mengikuti rambut/hijab utama. Variasi outfit tidak wajib di potret.

## 5. Lemari & Preset
- Lemari di rumah: semua baju yang dimiliki, dengan filter per slot/tag/warna.
- **Preset outfit** (5 slot): "Kerja", "Kebun", "Ngedate", "Tidur", "Festival". Ganti preset sekali klik.
- Ganti baju hanya di rumah atau ruang ganti toko (biar realistis).

## 6. Belanja (ala GTA)
| Toko | Gaya | Harga |
|---|---|---|
| Cihampelas Denim | Jeans, jaket denim | Menengah |
| Factory Outlet "FO Dago" | Kasual, hoodie | Murah–menengah |
| Butik Braga | Formal, pesta | Mahal |
| Pasar Baru | Kain, kebaya, batik | Murah |
| Penjahit Neng Lilis | Ubah warna / jahit custom | Biaya jasa |
| Toko Online (HP) | Rotasi mingguan | Bervariasi |

- **Ruang ganti**: preview di karakter (dengan rotasi 4 arah) sebelum membeli.
- **Diskon** saat festival tertentu; **stok rotasi** per musim.
- **Item langka**: hadiah festival, achievement, quest romantis.

## 7. Fitur Berdua 💗
- **Hadiahkan baju**: beli, bungkus, lalu kirim lewat kotak pos atau berikan langsung. Pasangan menerima notifikasi dan bisa memakainya. Poin Romansa naik.
- **Outfit couple**: set yang dibeli sepasang; kalau dipakai bersamaan saat berdua online, dapat moodlet "Kembaran 💞".
- **Replika baju asli kalian** (misal outfit kencan pertama) sebagai item kenangan (`43`).

## 8. Efek Gameplay (ringan)
- `warmth`: musim dingin tanpa baju hangat → moodlet "Kedinginan".
- Baju kerja sesuai → performa karier +.
- Baju festival → bonus di lomba/festival tertentu.
- Tidak ada statistik tempur. Baju utamanya untuk ekspresi diri.
