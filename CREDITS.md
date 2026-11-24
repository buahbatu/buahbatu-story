# Kredit Aset

Setiap aset pihak ketiga **wajib** dicatat di sini (lihat `docs/42-aset-lisensi.md`). Salinan teks lisensi disimpan di `public/assets/licenses/`. Isi file ini ditampilkan di layar **Kredit** dalam game (P16-07).

> ❌ Dilarang memakai sprite hasil rip dari Harvest Moon, Stardew Valley, The Sims, GTA, atau game komersial lain, serta logo/merek asli (`docs/42` §3).

## Grafis
| Aset (path) | Pembuat | Sumber (URL) | Lisensi | Modifikasi |
|---|---|---|---|---|
| `public/assets/ui/icons/*.png` (ikon aplikasi stroberi 16×16, diperbesar nearest-neighbor) | Dibuat sendiri untuk proyek ini (AI agent, palet `config/palette.ts`) | — | Milik proyek | — |
| `public/assets/models/characters/*.glb` + `Textures/colormap.png` (karakter pemain & NPC) | Kenney (www.kenney.nl), Mini Characters 2.0 | https://www.kenney.nl/assets/mini-characters-1 | CC0 1.0 (`public/assets/licenses/CC0-Kenney-MiniCharacters.txt`) | Diwarnai ulang saat runtime (palet per karakter) |
| `public/assets/models/nature/*.glb` (pohon, pinus, semak, bunga, batu, pagar, pot) | Kenney (www.kenney.nl), Nature Kit 2.1 | https://www.kenney.nl/assets/nature-kit | CC0 1.0 (`public/assets/licenses/CC0-Kenney-NatureKit.txt`) | Material diganti Lambert, warna alami + tekstur pixel proyek (UV diproyeksikan saat runtime), ukuran diseragamkan |
| `public/assets/models/furniture/*.glb` (kasur, lemari, meja, laptop, buku, kursi, sofa, TV, meja tamu, rak buku, dapur, kulkas, meja makan, meja rias, karpet) | Kenney (www.kenney.nl), Furniture Kit 2.0 | https://www.kenney.nl/assets/furniture-kit | CC0 1.0 (`public/assets/licenses/CC0-Kenney-FurnitureKit.txt`) | Material diganti Lambert, kayu bertekstur papan pixel proyek, kain diwarnai per peta, ukuran disesuaikan tapak |
| `public/assets/models/roads/light-curved.glb` + `Textures/colormap.png` (lampu jalan) | Kenney (www.kenney.nl), City Kit (Roads) | https://www.kenney.nl/assets/city-kit-roads | CC0 1.0 (`public/assets/licenses/CC0-Kenney-CityKitRoads.txt`) | Ukuran diseragamkan, filter nearest |
| `public/assets/tilesets/ground.png` (atlas tanah placeholder 16px: rumput, jalan, tanah garapan, pasir, air, batu, lantai kayu, tebing, aspal, paving, keramik, karpet + penanda ketinggian/garapan) | Dibuat sendiri untuk proyek ini (AI agent, digambar lewat kode) | — | Milik proyek | — |
| `public/assets/maps/*.tmj` (`sandbox`, `lembang`, `buahbatu`, `kos_a`, `rumah_michelle`; prototipe) | Dibuat sendiri untuk proyek ini (AI agent, dibangkitkan `scripts/maps/`) | — | Milik proyek | — |

*Tekstur prop 3D (`src/world/props/textures.ts`) digambar lewat kode (milik proyek).*

## Audio
| Aset (path) | Pembuat | Sumber (URL) | Lisensi | Modifikasi |
|---|---|---|---|---|
| — | — | — | — | — |

## Font
| Font | Pembuat | Sumber | Lisensi |
|---|---|---|---|
| Pixelify Sans (`public/assets/fonts/pixelify-sans-400.woff2`, `-700.woff2`) | Copyright 2021 The Pixelify Sans Project Authors | https://github.com/eifetx/Pixelify-Sans · file woff2 subset latin dari https://fontsource.org/fonts/pixelify-sans | SIL OFL 1.1 (`public/assets/licenses/OFL-PixelifySans.txt`) |
| Press Start 2P (`public/assets/fonts/press-start-2p-400.woff2`) | Copyright 2012 The Press Start 2P Project Authors (cody@zone38.net), Reserved Font Name "Press Start 2P" | https://fonts.google.com/specimen/Press+Start+2P · file woff2 subset latin dari https://fontsource.org/fonts/press-start-2p | SIL OFL 1.1 (`public/assets/licenses/OFL-PressStart2P.txt`) |

## Library
Library open source mengikuti lisensi masing-masing (lihat `package.json` dan `node_modules/<paket>/LICENSE`). Yang dibundel ke game: Three.js (MIT), Preact (MIT), zod (MIT), Immer (MIT), idb-keyval (Apache-2.0), EasyStar.js (MIT), supabase-js (MIT).
