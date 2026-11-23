# 01 · Tech Stack & Setup

## 1. Stack Utama
| Lapisan | Teknologi | Alasan |
|---|---|---|
| Bahasa | **TypeScript** (strict) | Game besar dan jangka panjang butuh tipe yang aman |
| Engine 2D | **Phaser** (versi stabil terbaru) | Engine 2D web paling matang; tilemap, kamera, input, audio sudah built-in |
| Bundler | **Vite** | Dev server cepat, hot reload |
| UI menu | **Preact** + CSS | Menu kompleks (inventory, toko, lemari, HP) jauh lebih gampang dibuat dengan DOM |
| Validasi data | **zod** | Konten JSON & save divalidasi saat load |
| Peta | **Tiled** (export `.tmj`/JSON) | Standar industri untuk tilemap |
| Pathfinding NPC | **EasyStar.js** | A* grid ringan |
| Storage lokal | **IndexedDB** via `idb-keyval` | Kapasitas lebih besar dari localStorage |
| Backend | **Supabase** | Auth, Postgres, Realtime, Storage dalam satu tempat, gratis |
| Voice | **WebRTC** (bawaan browser) + TURN | Peer-to-peer, gratis |
| Hosting | **Vercel** (Hobby) | Static hosting + serverless functions + cron, tanpa VPS |
| Testing | **Vitest** (unit), **Playwright** (smoke, opsional) | |
| Kualitas | **ESLint** + **Prettier** | |

> ⚠️ Docs ini menulis contoh dengan API Phaser 3. Kalau memakai Phaser 4, sesuaikan dan catat di `04-keputusan.md`.

## 2. Tools (semua gratis)
| Tool | Fungsi |
|---|---|
| **VS Code** | Editor utama |
| **Node.js LTS** | Runtime |
| **Git + GitHub** (repo **public** selama development → **private** saat final, ADR-010) | Versi kode |
| **Tiled** | Desain peta |
| **LibreSprite / Piskel** | Pixel art (Aseprite kalau mau berbayar) |
| **Universal LPC Spritesheet Generator** | Basis karakter & baju berlapis |
| **free-tex-packer** | Bikin texture atlas |
| **Audacity** | Edit audio / suara kenangan |

### Extension VS Code yang Disarankan
- ESLint, Prettier, Error Lens, GitLens, Vitest, Pretty TypeScript Errors

## 3. Setup Awal
```bash
npm create vite@latest buahbatu-story -- --template vanilla-ts
cd buahbatu-story

npm i phaser preact zod idb-keyval easystarjs @supabase/supabase-js
npm i -D typescript vitest @preact/preset-vite \
  eslint @eslint/js typescript-eslint eslint-config-prettier prettier \
  @types/node
```

### Script `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate:content": "tsx scripts/validate-content.ts"
  }
}
```

## 4. Environment Variables
Buat `.env.example` (di-commit) dan `.env.local` (JANGAN di-commit).

| Variabel | Dipakai di | Rahasia? |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Tidak |
| `VITE_SUPABASE_ANON_KEY` | Client (anon/publishable key) | Tidak (dilindungi RLS) |
| `SUPABASE_URL` | Vercel function | Tidak |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel function saja | **YA** |
| `CRON_SECRET` | Vercel Cron | **YA** |
| `TURN_API_KEY` / kredensial TURN | Vercel function saja | **YA** |

> Aturan: variabel `VITE_*` ikut ter-bundle ke browser, jadi jangan pernah taruh secret di sana.

## 5. Batas Free Tier
Selalu cek angka terbaru di situs masing-masing. Untuk 2 pemain, semuanya jauh di bawah batas.
- **Supabase Free**: project di-*pause* kalau tidak aktif ±7 hari, makanya pakai keep-alive cron (`32-backend-save.md` §8).
- **Vercel Hobby**: hanya untuk pemakaian pribadi/non-komersial; cron maksimal 1x per hari.
- **TURN gratis**: ada kuota bandwidth bulanan.
