# 51 · Otomasi Akun, Env, Push & Deploy

> Tujuan: **pemilik proyek cukup memberi token**. Sisanya (bikin repo, bikin project Supabase, isi env, push, deploy) dikerjakan AI agent lewat CLI. Satu perangkat dipakai untuk banyak proyek, jadi **akun dibaca dari folder proyek**, bukan dari login global.

## 1. Prinsip
1. **Akun per folder.** Setiap perintah `git`, `gh`, `vercel`, `supabase` di proyek ini memakai identitas & token **milik proyek ini**, tidak bergantung pada akun yang sedang login global di perangkat.
2. **Tiru pola yang sudah ada.** Di perangkat ini sudah ada proyek **kelola, prins, shaflow, kis** yang sudah menerapkan akun per folder. Task **P0-00** wajib memeriksa proyek-proyek itu dan menyalin polanya (lihat §2). Pola di §3 hanya dipakai kalau tidak ditemukan pola yang jelas.
3. **Token sekecil mungkin.** Pakai token dengan izin minimum dan masa berlaku, khusus proyek ini.
4. **Rahasia tidak pernah keluar dari file lokal.** Rahasia tidak ditulis ke chat, log, commit, atau output terminal (selalu disamarkan `****`).
5. **Semua bisa diulang.** Setup dijalankan lewat script (`npm run setup`) yang aman dijalankan berkali-kali (idempotent).

## 2. P0-00 · Deteksi Pola dari Proyek Lain
AI agent memeriksa folder **kelola, prins, shaflow, kis** (cari sebagai folder sejajar `../<nama>`; kalau tidak ketemu, **tanya path-nya ke user**). Yang diperiksa **tanpa menampilkan nilai rahasia**:

| Yang dicek | Untuk mengetahui |
|---|---|
| `git config --local --list` (sembunyikan token di URL) | `user.name`/`user.email` per repo, credential helper |
| `git remote -v` (sembunyikan token) | Remote pakai SSH alias (`git@github-xxx:`) atau HTTPS + token |
| `~/.gitconfig` bagian `includeIf "gitdir:..."` | Identitas otomatis per folder |
| `~/.ssh/config` (nama `Host` saja, **jangan** baca isi kunci) | Alias SSH per akun GitHub |
| `.envrc` (direnv), `.env*`, `.tool-versions` | Token dimuat per folder (hanya **nama variabel**, bukan nilai) |
| `.vercel/project.json` | Cara link project & scope/team Vercel |
| `supabase/config.toml`, `.supabase/` | Cara link project Supabase |
| `package.json` → `scripts` (`deploy`, `ship`, `release`, …) | Alur push/deploy yang biasa dipakai |
| `.github/workflows/*` | Deploy via CI atau langsung |
| `vercel.json`, `Makefile`, `scripts/` | Otomasi tambahan |

Hasilnya:
- Ringkasan pola ke user ("Proyek kelola & kis memakai X, prins memakai Y; usul pakai X") beserta konfirmasi **akun mana** yang dipakai proyek ini.
- **ADR baru** di `04-keputusan.md` ("ADR-0XX · Pola akun per folder").
- Pola diterapkan di proyek ini, dan dokumen ini di-update kalau berbeda dari §3.

## 2a. Pola Terpilih (hasil P0-00, ADR-014)
Mengikuti pola **shaflow**, akun GitHub **`buahbatu`**:
| Alat | Cara |
|---|---|
| `git` | `git config --local` → `user.name=buahbatu`, email akun proyek, `credential.https://github.com.helper` yang mengambil token dinamis dari `gh auth token -u buahbatu` |
| `gh` | `node scripts/platform.mjs gh …` (inject `GH_TOKEN` dari keyring, akun aktif global tidak diganti) |
| `vercel` | `node scripts/platform.mjs vercel …` (`--global-config .vercel-cli`) |
| `supabase` | `node scripts/platform.mjs supabase …` (`SUPABASE_ACCESS_TOKEN` dari `.env.local`) |
| Login browser | Chrome profil **Kelola POS** (`--profile-directory="Profile 2"`), user tinggal klik |

Pola default di §3 tetap berlaku sebagai cadangan (misalnya di mesin lain tanpa keyring `gh`: isi `GH_TOKEN`).

## 3. Pola Default (kalau tidak ada pola di proyek lain)
### Identitas Git per repo
```bash
git config --local user.name  "<nama>"
git config --local user.email "<email akun GitHub proyek ini>"
```

### Token dimuat otomatis per folder
- `.env.local` menyimpan semua token proyek (di-`.gitignore`).
- Kalau **direnv** terpasang: `.envrc` berisi `dotenv .env.local`. Token aktif otomatis saat masuk folder, dan hilang saat keluar folder.
- Kalau tidak: semua script memakai `node --env-file=.env.local …` dan CLI dipanggil dengan token eksplisit (`--token`, `GH_TOKEN=…`).

### Push ke GitHub tanpa akun global
Pilih salah satu (ikuti pola proyek lain):
- **A. SSH alias** (kalau proyek lain begini): remote `git@github-<akun>:<owner>/buahbatu-story.git` dengan `Host github-<akun>` di `~/.ssh/config`.
- **B. Token per folder**: `GH_TOKEN` dari `.env.local` + `git config --local credential.helper '!gh auth git-credential'`. `gh` otomatis memakai `GH_TOKEN` dari environment, jadi push memakai akun proyek ini.

### Vercel tanpa akun global
- Semua perintah memakai `--token $VERCEL_TOKEN` (+ `--scope $VERCEL_SCOPE` kalau pakai team).
- `.vercel/project.json` (hasil `vercel link`) mengikat folder ke project yang benar.

### Supabase tanpa akun global
- CLI membaca `SUPABASE_ACCESS_TOKEN` dari environment.
- `supabase link --project-ref $SUPABASE_PROJECT_REF` mengikat folder ke project.

## 4. Env: Apa yang Diberikan User vs Dibuat AI
### 🔑 Diberikan user (cuma ini)
| Variabel | Dari mana | Izin minimum |
|---|---|---|
| `GH_TOKEN` *(lewati kalau pakai SSH alias)* | GitHub → Settings → Developer settings → Personal access tokens | Fine-grained: Administration, Contents, Actions, Secrets, Workflows = Read & write. Atau classic: `repo`, `workflow` |
| `GIT_USER_NAME`, `GIT_USER_EMAIL` | Akun GitHub proyek ini | — |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens | Scope ke akun/team yang dipakai |
| `VERCEL_SCOPE` *(opsional)* | Slug team Vercel | — |
| `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens | — |
| `SUPABASE_ORG_ID` *(opsional)* | AI bisa mencarinya sendiri lewat `supabase orgs list` | — |
| `METERED_APP_NAME`, `METERED_API_KEY` | Dashboard penyedia TURN (dibutuhkan mulai P11) | — |

> Cara memberikan: user **mengisi sendiri** `.env.local` (template: `.env.example`) di VS Code. **Jangan tempel token di chat.** AI membaca dari file dan tidak pernah menampilkannya.

### 🤖 Dibuat/diambil AI otomatis
| Variabel | Cara AI mendapatkan |
|---|---|
| `SUPABASE_PROJECT_REF` | `supabase projects create buahbatu-story --org-id … --db-password … --region ap-southeast-1` |
| `SUPABASE_DB_PASSWORD` | Di-generate acak (32 karakter) |
| `SUPABASE_URL`, `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `supabase projects api-keys --project-ref <ref>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Sama seperti di atas |
| `CRON_SECRET` | Di-generate acak |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Dari `.vercel/project.json` setelah `vercel link` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Di-generate acak (32 alfanumerik) lalu didaftarkan via `PATCH /v1/projects/{id}/protection-bypass`, supaya smoke test CI bisa membuka URL Preview yang dilindungi login Vercel |
| `TEST_A_EMAIL/PASSWORD`, `TEST_B_EMAIL/PASSWORD` | Di-generate + dibuat via Supabase Admin API (akun khusus tes) |
| Env di Vercel (Production & Preview) | `vercel env add <NAMA> production|preview` (nilai lewat stdin) |
| Secret di GitHub Actions | `gh secret set <NAMA>` |

## 5. `npm run setup` (alur script)
`scripts/setup.ts`, aman diulang (melewati langkah yang sudah beres):
```
1. doctor   → cek tools (node, git, gh, vercel, supabase CLI; install via npx kalau perlu)
             → cek .env.local: variabel wajib ada? (tampilkan daftar yang KURANG saja)
2. git      → set identitas lokal, credential/remote sesuai pola P0-00
3. github   → buat repo PUBLIC kalau belum ada (private saat final, ADR-010) → push main
4. supabase → buat project kalau belum ada → tunggu siap → ambil keys → tulis ke .env.local
             → supabase link → supabase db push (migrasi) → setting auth (matikan signup publik)
             → buat bucket `media` → buat akun tes A & B
5. vercel   → vercel link → isi env Production & Preview → hubungkan repo Git
6. ci       → gh secret set (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, env tes)
7. verify   → deploy preview → smoke test E2E ke URL preview → laporan
```
Output akhir berupa tabel ✅/❌ per langkah. Kalau ada yang kurang, script menyebut **persis** variabel apa yang harus diisi user.

**Status implementasi (P0-10b):** langkah 1–3 dan 5 sudah jalan (`scripts/setup.mjs`):
- `.env.local` dibuat dari template kalau belum ada; `GIT_USER_*`, `GH_OWNER`, `VERCEL_ORG_ID/PROJECT_ID` diisi otomatis **tanpa menimpa** nilai yang sudah diisi user.
- Login yang butuh klik (GitHub device login, Vercel login) dibuka di Chrome profil `LOGIN_CHROME_PROFILE`; akun aktif global `gh` dikembalikan seperti semula setelahnya.
- Vercel: `project add` (kalau belum ada) → `link --yes --project buahbatu-story`. Env disinkron ke Production & Preview hanya untuk variabel yang sudah punya nilai (nilai lewat stdin). Repo Git **tidak** dihubungkan ke Vercel karena deploy hanya lewat CI.
- Langkah 4 (Supabase) menyusul di P5-01, langkah 6–7 (CI secrets, deploy) di P0-12/P0-13.

Perintah lain:
| Perintah | Fungsi |
|---|---|
| `npm run doctor` | Cek kesehatan tools, akun & env (tanpa mengubah apa pun). Kebutuhan mengikuti fase di `TODO.md`: yang belum waktunya ⏳, yang wajib sekarang ❌ + cara memperbaikinya |
| `npm run tools` | Pasang tool biner proyek ke `.tools/` (gitleaks, versi dipin, checksum SHA-256 diverifikasi) + aktifkan hook |
| `npm run env:sync` | Sinkron `.env.local` → Vercel env & GitHub secrets |
| `npm run ship` | lint → typecheck → test → e2e → build → commit/push → deploy (lihat §6) |

## 6. Alur Push & Deploy Otomatis
```
AI selesai task
  → npm run verify   (lint, typecheck, unit, e2e lokal)
  → git commit + push (pakai akun proyek)
  → GitHub Actions: CI (lint, typecheck, unit, build, e2e)
       ├─ branch fitur → deploy PREVIEW (vercel deploy) → e2e ke URL preview
       └─ main         → deploy PRODUCTION (vercel deploy --prod) HANYA kalau CI hijau
  → AI cek status CI via `gh run watch` → laporan + URL
```
- Deploy production **hanya** jika semua tes lolos.
- Auto-deploy bawaan Vercel dari Git dimatikan (`vercel.json`: `"git": { "deploymentEnabled": false }`) supaya deploy hanya lewat CI yang sudah dites. *(Alternatif: tetap pakai Git integration bawaan Vercel kalau proyek lain begitu; ikuti P0-00.)*

**Implementasi (P0-12)** `.github/workflows/ci.yml`:
- Job `verify`: gitleaks (seluruh riwayat) → lint → typecheck → unit → build → E2E. Job `deploy` jalan hanya kalau `verify` hijau dan bukan PR: `vercel pull/build/deploy --prebuilt` (production untuk `main`, preview untuk branch lain).
- Smoke test `playwright.deploy.config.ts` + `e2e-deploy/` ke URL hasil deploy, dengan header `x-vercel-protection-bypass` (secret `VERCEL_AUTOMATION_BYPASS_SECRET`) supaya bisa membuka Preview yang dilindungi login Vercel.
- Rollback: sebelum deploy production, ID production aktif dicatat; kalau smoke gagal → `vercel rollback <id>`.
- Action pihak ketiga dipin ke **commit SHA** (repo public). Versi saat P0-12: `actions/checkout` v7.0.1, `actions/setup-node` v7.1.0, `actions/upload-artifact` v7.0.2. Vercel CLI dipin `59.5.0`.
- Baseline snapshot Linux: kalau belum ada, CI membuatnya dan mengunggah artifact `snapshots-linux`. AI mengunduh, menilai gambarnya, lalu meng-commit-nya. Workflow manual `snapshots.yml` melakukan hal yang sama untuk pembaruan tampilan berikutnya. Bot CI tidak pernah push ke repo.
- GitHub Secrets (diset oleh `npm run setup`, nilai lewat stdin): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_AUTOMATION_BYPASS_SECRET`.
- Kalau deploy production gagal smoke test → AI melakukan rollback (`vercel rollback`) lalu lapor.

## 7. Keamanan
- `.env.local`, `.envrc` (kalau berisi nilai), `.vercel/`, `supabase/.temp/` masuk `.gitignore`.
- Pasang **secret scanning** sebelum commit (`gitleaks` via pre-commit hook). Commit diblok kalau ada token.
  - Implementasi (P0-10a): hook native `.githooks/pre-commit` (tanpa husky) diaktifkan lewat `core.hooksPath` lokal oleh `npm install` (script `prepare`) dan `npm run tools`. Biner gitleaks di `.tools/` (gitignore). Kalau gitleaks tidak ada, commit **ditolak** (gagal tertutup, bukan dilewati).
  - Fixture tes yang butuh pola token dirakit saat runtime (`'gh' + 'p_' + …`), jangan ditulis sebagai literal.
- Saat menampilkan konfigurasi, AI **wajib** menyamarkan nilai (`ghp_****abcd`).
- Token kedaluwarsa → `npm run doctor` memberi tahu token mana yang perlu diperbarui.
- `SUPABASE_SERVICE_ROLE_KEY` **tidak pernah** dipakai di kode client (dicek oleh lint rule/grep di CI).

## 8. Yang Tetap Harus Dilakukan Manusia
Hal-hal yang memang tidak bisa diwakilkan (kebijakan penyedia layanan):
1. Membuat akun GitHub, Vercel, Supabase, dan penyedia TURN (sekali).
2. Membuat token (§4) dan mengisinya di `.env.local`.
3. Mengonfirmasi akun mana yang dipakai proyek ini (pertanyaan dari P0-00).
4. Verifikasi email/2FA kalau diminta penyedia.
