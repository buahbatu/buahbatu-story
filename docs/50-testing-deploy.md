# 50 · Testing, Performa & Deploy

> **Semua tes dijalankan oleh AI agent**, bukan manual. Manusia hanya ikut playtest untuk menilai "rasa main" (lihat §8).

## 1. Piramida Test
| Lapisan | Tool | Cakupan | Kapan dijalankan AI |
|---|---|---|---|
| Unit | Vitest | Semua `logic.ts`: waktu, cuaca, tanaman, ekonomi, kredit, quest, hubungan, migrasi save | Setiap task |
| Validasi konten | zod + script | Semua JSON di `src/content/` (ID unik, referensi valid) | Setiap task |
| Integrasi | Vitest | Command → handler → event (tanpa Phaser) | Setiap task |
| **E2E gameplay** | Playwright | Skenario main di browser sungguhan (headless) | Setiap task yang menyentuh gameplay/UI |
| **E2E multiplayer** | Playwright (2 browser context) | Dua pemain A & B di dunia yang sama | Setiap task fase P6 ke atas yang menyentuh sinkronisasi |
| **Visual** | Playwright screenshot | Snapshot layar penting + dicek AI secara visual | Setiap task yang mengubah tampilan |
| **Mobile** | Playwright device emulation | Landscape HP (viewport & sentuh) | Task UI/kontrol |
| **Performa** | Playwright + overlay FPS | FPS & ukuran load sesuai budget §6 | Akhir setiap fase |
| Simulasi balancing | Script headless | Kurva ekonomi (§2) | Task ekonomi & akhir fase |

Perintah:
| Perintah | Isi |
|---|---|
| `npm run test` | Unit + integrasi + validasi konten |
| `npm run e2e` | Semua E2E (butuh `npm run build` + preview server otomatis) |
| `npm run e2e:mp` | E2E multiplayer saja |
| `npm run e2e:update` | Perbarui snapshot visual (hanya kalau perubahan tampilan memang disengaja) |
| `npm run verify` | lint + typecheck + test + build + e2e (dipakai sebelum task ditandai selesai) |

## 2. Test Hook (supaya AI bisa "main" game)
Saat build mode `test` (atau `?test=1` di non-production), game mengekspos API kecil di `window.__BB__`:
```ts
interface TestApi {
  ready(): Promise<void>;                       // tunggu scene & konten siap
  getState(): GameState;                        // snapshot state (read-only)
  dispatch(cmd: Command): CommandResult;        // jalankan Command langsung
  press(action: Action, ms?: number): Promise<void>;  // simulasi input
  walkTo(tile: TilePos): Promise<void>;         // jalan dengan pathfinding
  setTime(t: Partial<Clock>): void;             // atur jam/hari/musim
  setWeather(w: WeatherId): void;
  setSeed(seed: number): void;                  // RNG deterministik
  freeze(on: boolean): void;                    // bekukan animasi (snapshot stabil)
  teleport(area: AreaId, spawn: string): Promise<void>;
}
```
- **Tidak ikut** di build production (dibuang lewat `import.meta.env`).
- Dengan seed + waktu beku, screenshot selalu identik, jadi snapshot visual stabil.

### Contoh skenario E2E
```ts
// e2e/farming.spec.ts
test('tanam → siram → tumbuh → panen → jual', async ({ page }) => {
  await page.goto('/?test=1');
  await page.evaluate(() => window.__BB__.ready());
  await page.evaluate(() => window.__BB__.setSeed(42));
  // ... cangkul, tanam stroberi, siram 8 hari, panen, masukkan Kotak Kirim, tidur
  const money = await page.evaluate(() => window.__BB__.getState().players.A.wallet);
  expect(money).toBeGreaterThan(0);
  await expect(page).toHaveScreenshot('farm-day8.png');
});
```
Skenario minimal per fase dicantumkan di kriteria selesai fase di `TODO.md`, dan ditulis sebagai bagian dari task (`e2e/*.spec.ts`).

## 3. Simulasi Balancing
`scripts/simulate-economy.ts`: menjalankan 1–3 tahun game secara headless dengan strategi pemain sederhana (bertani saja / kerja saja / campuran), lalu mencetak kurva uang per minggu. Bandingkan dengan target di `13` §7. Dijalankan AI setiap ada perubahan harga besar.

## 4. E2E Multiplayer (otomatis)
- Playwright membuka **2 browser context** (A & B) dan login memakai akun tes `TEST_A_*` & `TEST_B_*` (dibuat otomatis, `51` §4) di **household tes** terpisah.
- Skenario wajib (mengotomasi checklist `30` §12):
  - Saling melihat gerak (posisi B di layar A mendekati posisi asli, toleransi < 1 tile)
  - Cangkul/tanam/panen sinkron + konflik panen bersamaan
  - Host keluar → handover → progres utuh
  - Putus koneksi 30 detik (`context.setOffline(true)`) → antrean terkirim
  - Putus 2 menit → overlay pause → pulih
  - Ganti hari hanya saat keduanya tidur
  - Ajak → terima/tolak (peluk, bonceng)
- Lag disimulasikan dengan routing/throttle Playwright.
- **Voice**: Chromium dijalankan dengan `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` untuk menguji koneksi WebRTC dan indikator bicara.
- Household tes dibersihkan setelah tes (`afterAll`).
- Kalau kuota Supabase gratis memungkinkan, pakai project **dev** terpisah. Kalau tidak, pakai project yang sama dengan household tes yang terisolasi oleh RLS.

## 5. Uji Visual oleh AI
- Snapshot disimpan di `e2e/__screenshots__/` dan dibandingkan otomatis.
- Untuk perubahan tampilan, AI **membuka sendiri gambar screenshot** dan menilai: teks terpotong, elemen bertumpuk, pixel blur (scaling non-integer), kontras, dan tampilan HP landscape.
- Screenshot penting dilampirkan di laporan task supaya user bisa lihat tanpa menjalankan game.

## 6. Budget Performa
| Metrik | Target |
|---|---|
| FPS desktop | 60 |
| FPS HP menengah | ≥ 30 |
| Load awal (sampai title) | < 5 MB, < 4 detik di 4G |
| Load per area | < 1,5 MB |
| Memori | < 400 MB |

Diukur otomatis oleh `e2e/perf.spec.ts` (CPU throttling ×4 untuk meniru HP), lalu dilaporkan di akhir fase.

## 7. Mode Debug
URL `?debug=1` mengaktifkan: overlay FPS, collision, grid, tombol cheat (tambah uang, majukan hari, ganti musim/cuaca, unlock tahap). **Dinonaktifkan** di build produksi kecuali untuk akun A (dev).

## 8. CI & Deploy
Otomatis penuh, lihat **`51-otomasi-akun-env.md` §6**. Ringkasnya:
- Push → GitHub Actions menjalankan `verify`.
- Branch fitur → deploy **Preview** + E2E ke URL preview.
- `main` → deploy **Production** hanya kalau semua hijau, lalu smoke test production (gagal → rollback otomatis).
- Cron keep-alive di `vercel.json` (`32` §8).

## 9. Versi & Rilis
- Semver: `0.x` selama pengembangan, `1.0.0` saat semua fase inti selesai.
- Versi tampil di layar judul & Pengaturan.
- **Milestone**:
| Versi | Isi |
|---|---|
| v0.1 | Fondasi: jalan-jalan di peta, waktu, save lokal |
| v0.2 | Bertani + ekonomi dasar (solo playable) |
| v0.3 | **Bisa main berdua** (backend + multiplayer) |
| v0.4 | Karakter & outfit |
| v0.5 | NPC, quest, cerita bab 1–3 |
| v0.6 | Hubungan & kebutuhan (sampai pacaran) |
| v0.7 | Aktivitas (mancing, masak, gua, foto) |
| v0.8 | Voice lengkap |
| v0.9 | Kendaraan + peta Bandung lengkap |
| v0.10 | Properti, kredit, nikah |
| v0.11 | Keluarga & anak |
| v0.12 | Festival, endgame, proyek kota |
| v1.0 | Polish & rilis |

### Checklist Rilis
- [ ] Semua task fase `[x]`
- [ ] Test, lint, build hijau
- [ ] Migrasi save dari versi sebelumnya diuji dengan save asli
- [ ] Backup DB (export snapshot) sebelum deploy
- [ ] Main 30 menit berdua tanpa bug blocker
- [ ] `CHANGELOG.md`: pindahkan `[Unreleased]` → versi baru + tanggal
- [ ] Tag git `vX.Y.Z`
- [ ] Rilis final (v1.0): ubah repo GitHub ke **private** (ADR-010)

## 10. Yang Tidak Bisa Dinilai Penuh oleh AI
AI menjalankan semua tes di atas, tapi beberapa hal tetap butuh manusia (cukup **playtest santai**, bukan ngetes satu-satu):
- **Rasa main**: seru atau tidak, terlalu lambat atau terlalu cepat, lucu atau garing
- **HP asli**: performa & kenyamanan sentuh di HP kalian (emulator tidak 100% sama)
- **Jaringan seluler asli**: voice chat lewat TURN di jaringan operator
- **Konten personal**: apakah kenangan & dialog terasa pas buat Michelle

Feedback dari playtest diberikan ke AI pakai prompt #5 (bug) atau #8 (ubah desain).

