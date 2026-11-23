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

> ⚠️ Proyek memakai **Phaser 4** (ADR-016). Contoh kode di docs masih bergaya Phaser 3, jadi cek ulang API-nya saat dipakai.

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
Proyek dibuat langsung di root repo (sudah dikerjakan di P0-01, tidak perlu `npm create vite`). Versi saat init: Phaser 4.2, Vite 8, TypeScript ~6.0 (dipin, lihat ADR-016), Preact 11, zod 4, Vitest 5, ESLint 10.
```bash
npm i phaser preact zod idb-keyval easystarjs @supabase/supabase-js
npm i -D typescript@~6.0 vite vitest @preact/preset-vite @babel/core \
  eslint @eslint/js typescript-eslint eslint-config-prettier prettier \
  @types/node
```
Node.js ≥ 24 (`.nvmrc`).

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
    "validate:content": "vitest run src/content/content.test.ts"
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
