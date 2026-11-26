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
| `public/assets/ui/frame-ornate.svg` (bingkai pixel 9-slice kotak dialog: kayu + ornamen emas & permata stroberi di sudut) | Dibuat sendiri untuk proyek ini (AI agent, digambar lewat kode) | — | Milik proyek | — |
| `public/assets/tilesets/ground.png` (atlas tanah placeholder 16px: rumput, jalan, tanah garapan, pasir, air, batu, lantai kayu, tebing, aspal, paving, keramik, karpet + penanda ketinggian/garapan) | Dibuat sendiri untuk proyek ini (AI agent, digambar lewat kode) | — | Milik proyek | — |
| `public/assets/maps/*.tmj` (`sandbox`, `lembang`, `buahbatu`, `kos_a`, `rumah_michelle`; prototipe) | Dibuat sendiri untuk proyek ini (AI agent, dibangkitkan `scripts/maps/`) | — | Milik proyek | — |

*Tekstur prop 3D (`src/world/props/textures.ts`) digambar lewat kode (milik proyek).*

## Audio
| Aset (path) | Pembuat | Sumber (URL) | Lisensi | Modifikasi |
|---|---|---|---|---|
| `public/assets/audio/sfx/ui-click.*` (klik tombol UI) | Kenney Vleugels (www.kenney.nl), UI SFX Set | https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks | CC0 1.0 (`public/assets/licenses/CC0-Kenney-UISFX.txt`) | Hening awal dipotong, dinormalisasi, mono, OGG + M4A |
| `public/assets/audio/sfx/step-*.*` (langkah kaki: rumput, kerikil, kayu, keras, air) | Kumpulan oleh congusbongus ("Footsteps on different surfaces"); rekaman asli swuing, Ali_6868, ceberation, EminYILDIRIM (Freesound) | https://opengameart.org/content/footsteps-on-different-surfaces | CC BY 3.0 (kerikil: CC0) (`public/assets/licenses/CC-BY-3.0-OGA-Footsteps.txt`) | Hening awal dipotong, dinormalisasi, mono, OGG + M4A |
| `public/assets/audio/ambience/stream.*`, `waterfall.*` (gemericik sungai & curug, loop) | kurt ("Stream Sounds") | https://opengameart.org/content/stream-sounds | CC BY 3.0 (`public/assets/licenses/CC-BY-3.0-OGA-StreamSounds.txt`) | Dipotong 30 dtk, loudness dinormalisasi, ujung di-crossfade ke awal (loop mulus), OGG + M4A |
| `public/assets/audio/ambience/pond.*` (riak air tenang kolam/danau, loop) | RandomMind ("Sea and river wave sounds") | https://opengameart.org/content/sea-and-river-wave-sounds | CC0 1.0 (`public/assets/licenses/CC0-OGA-SeaRiverWaves.txt`) | Potongan 25 dtk, low-pass, dinormalisasi, loop crossfade, OGG + M4A |
| `public/assets/audio/music/title.*` (musik layar judul) | Aureolus_Omicron ("4 Music Box Tracks": cute tune) | https://opengameart.org/content/4-music-box-tracks | CC0 1.0 (`public/assets/licenses/MUSIC-OGA.txt`) | Loudness dinormalisasi, OGG + M4A |
| `public/assets/audio/music/day-fields.*` (musik pagi/siang) | ARoachIFoundOnMyPillow ("Fields of Cabbage") | https://opengameart.org/content/fields-of-cabbage | CC0 1.0 (`public/assets/licenses/MUSIC-OGA.txt`) | Loudness dinormalisasi, OGG + M4A |
| `public/assets/audio/music/day-shepherd.*` (musik pagi/siang) | Zane ("Shepherd Dog - Day 13") | https://opengameart.org/content/shepherd-dog-day-13 | CC0 1.0 (`public/assets/licenses/MUSIC-OGA.txt`) | Loudness dinormalisasi, OGG + M4A |
| `public/assets/audio/music/evening-pastoral.*` (musik sore) | Yubatake ("Pastoral") | https://opengameart.org/content/pastoral | CC BY 4.0 (`public/assets/licenses/MUSIC-OGA.txt`) | 200 dtk pertama + fade-out, dinormalisasi, OGG + M4A |
| `public/assets/audio/music/night-bedtime.*` (musik malam) | Machine ("Bedtime Music Box") | https://opengameart.org/content/bedtime-music-box | CC BY 3.0 (`public/assets/licenses/MUSIC-OGA.txt`) | Loudness dinormalisasi, OGG + M4A |

## Font
| Font | Pembuat | Sumber | Lisensi |
|---|---|---|---|
| Pixelify Sans (`public/assets/fonts/pixelify-sans-400.woff2`, `-700.woff2`) | Copyright 2021 The Pixelify Sans Project Authors | https://github.com/eifetx/Pixelify-Sans · file woff2 subset latin dari https://fontsource.org/fonts/pixelify-sans | SIL OFL 1.1 (`public/assets/licenses/OFL-PixelifySans.txt`) |
| Press Start 2P (`public/assets/fonts/press-start-2p-400.woff2`) | Copyright 2012 The Press Start 2P Project Authors (cody@zone38.net), Reserved Font Name "Press Start 2P" | https://fonts.google.com/specimen/Press+Start+2P · file woff2 subset latin dari https://fontsource.org/fonts/press-start-2p | SIL OFL 1.1 (`public/assets/licenses/OFL-PressStart2P.txt`) |

## Library
Library open source mengikuti lisensi masing-masing (lihat `package.json` dan `node_modules/<paket>/LICENSE`). Yang dibundel ke game: Three.js (MIT), Preact (MIT), zod (MIT), Immer (MIT), idb-keyval (Apache-2.0), EasyStar.js (MIT), supabase-js (MIT).
