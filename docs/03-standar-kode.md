# 03 · Standar Kode, Git & Definition of Done

## 1. TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- Dilarang `any`. Kalau terpaksa, pakai `unknown` lalu validasi (zod).
- Pakai `type`/`interface` dari `types.ts` sistem masing-masing.
- ID konten bertipe *branded string*: `type ItemId = string & { __brand: 'ItemId' }`.

## 2. Penamaan
| Hal | Gaya | Contoh |
|---|---|---|
| File class/komponen | PascalCase | `Player.ts`, `ShopMenu.tsx` |
| File lain | kebab/camel | `logic.ts`, `balance.ts` |
| Variabel/fungsi | camelCase | `growCrop()` |
| Konstanta | UPPER_SNAKE | `TILE_SIZE` |
| ID konten | snake_case | `strawberry_seed`, `npc_bu_euis` |
| Command/Event type | `sistem/aksi` | `farm/plant`, `time/dayStarted` |

Identifier kode **Bahasa Inggris**. Teks yang tampil ke pemain **Bahasa Indonesia**, disimpan di `src/content/i18n/id.json` (jangan hardcode string UI).

## 3. Struktur & Ukuran
- File idealnya < 300 baris. Fungsi idealnya < 40 baris.
- Satu sistem = satu folder (`types`, `logic`, `handlers`, `view`, `test`).
- Tidak ada import silang antar `logic.ts` sistem berbeda; komunikasi via event atau selector.
- Angka *magic* dilarang → masuk `config/balance.ts` atau konten JSON.

## 4. Komentar
- Komentar menjelaskan **kenapa**, bukan **apa**.
- Setiap `logic.ts` diawali komentar singkat yang merujuk ke dokumen desain: `// Desain: docs/12-pertanian-peternakan.md §4`.

## 5. Testing
- **Wajib** unit test untuk setiap `logic.ts` (Vitest), dan E2E Playwright untuk gameplay/UI. Semua ditulis & dijalankan oleh AI.
- Minimal: kasus normal, edge case (batas musim, uang kurang, inventory penuh), dan determinisme RNG.
- Konten JSON divalidasi lewat `npm run validate:content` (juga dijalankan di test).
- Lihat `50-testing-deploy.md` untuk strategi lengkap.

## 6. Error Handling
- Command gagal → `CommandResult { ok: false, reason }`, lalu UI menampilkan toast ramah. Jangan pakai `throw` untuk aturan game.
- Error jaringan/IO → tangkap, log, retry dengan backoff, tampilkan status koneksi. **Progres tidak boleh hilang**.

## 7. Git
- Repo **public** selama development, diubah ke **private** saat final (ADR-010). Isi `src/content/personal/` tidak pernah di-commit.
- Branch: `main` (selalu bisa di-deploy) + `feat/P3-05-tanaman-tumbuh`.
- Commit pakai **Conventional Commits** + ID task:
  ```
  feat(P3-05): tanaman tumbuh per hari
  fix(P3-05): tanaman layu tidak hilang saat ganti musim
  docs(P3): update desain kualitas panen
  chore: update dependency
  ```
- Satu task = satu atau beberapa commit kecil, jangan satu commit raksasa.

## 8. Definition of Done (DoD)
Sebuah task **baru boleh** ditandai `[x]` jika:
- [ ] Fungsionalitas sesuai deskripsi task & dokumen ref
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅
- [ ] `npm run test` ✅ (termasuk test baru untuk logic baru)
- [ ] `npm run build` ✅
- [ ] E2E (`npm run e2e`, + `e2e:mp` bila menyentuh sinkronisasi) ✅, ditulis & dijalankan oleh AI
- [ ] Screenshot perubahan tampilan sudah dinilai AI
- [ ] Push dengan akun proyek ini + CI hijau + deploy berhasil (`51`)
- [ ] Teks UI ada di file i18n
- [ ] Angka balancing ada di `balance.ts` / JSON
- [ ] Aset baru tercatat di `CREDITS.md`
- [ ] Docs di-update jika ada perubahan desain (+ ADR jika keputusan teknis)
- [ ] **`TODO.md` di-update** (status, tanggal, catatan, tabel progres)
- [ ] **`CHANGELOG.md` di-update**
- [ ] Laporan ke user berisi tes yang dijalankan + URL deploy (user tidak disuruh ngetes manual)
- [ ] Tidak ada rahasia di kode, log, atau commit (gitleaks lolos)
