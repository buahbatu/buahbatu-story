# 30 · Multiplayer Berdua

## 1. Model
- **1 household = 2 pemain** (A & B) dalam **satu dunia bersama**.
- Tanpa server sendiri: **Supabase Realtime** (Presence + Broadcast) untuk komunikasi live, **Postgres** untuk penyimpanan.
- **Host-authoritative** (ADR-006): pemain yang online duluan menjadi host.

## 2. Channel
- Satu channel **privat** per household: `household:{householdId}`.
- Hanya anggota household yang boleh join (Realtime Authorization + RLS, lihat `32` §5).

## 3. Presence
Payload presence tiap pemain:
```ts
{ playerId: 'A' | 'B', onlineAt: number, area: AreaId, status: 'playing' | 'menu' | 'sleeping' | 'afk' }
```
- Pasangan join → toast + SFX "💗 {partner} baru online!" + titik hijau di app Chat/Peta.
- Status `afk` setelah 3 menit tanpa input.

## 4. Pemilihan Host
- Host = pemain dengan `onlineAt` paling kecil di daftar presence (deterministik, kedua klien menghitung hasil yang sama).
- **Handover**: host keluar → presence `leave` → klien yang tersisa menjadi host, memuat snapshot terakhir dari DB + state lokalnya yang lebih baru (dibandingkan dengan `version`), lalu melanjutkan jam.
- Host bertugas: jam & cuaca, Day Tick, simulasi NPC, validasi Command, RNG, dan menyimpan ke DB.

## 5. Jenis Pesan (Broadcast)
| Event | Arah | Frekuensi | Payload |
|---|---|---|---|
| `player:pos` | semua → semua | 10 Hz saat bergerak | `{id, area, x, y, dir, anim, vehicle?, t}` |
| `cmd` | klien → host | Saat aksi | `{cmdId, command}` |
| `cmd:ack` | host → pengirim | Balasan | `{cmdId, ok, reason?}` |
| `state:patch` | host → klien | Saat berubah | `{version, patches[]}` (JSON Patch / delta per sistem) |
| `world:tick` | host → klien | Tiap menit game | `{minute, day, season, year, weather}` |
| `npc:pos` | host → klien | 4 Hz, hanya area yang sama | `[{id, x, y, dir, anim}]` |
| `social:request` | A ↔ B | Saat ajak | `{reqId, kind, from}` |
| `social:response` | A ↔ B | Balasan | `{reqId, accepted}` |
| `emote` | semua | Saat aksi | `{id, emote}` |
| `outfit` | semua | Saat ganti | `{id, outfit}` |
| `chat` | semua | Saat kirim | `{id, text, t}` (juga disimpan ke DB) |
| `cutscene:step` | host → klien | Saat cutscene | `{csId, step}` |
| `voice:signal` | A ↔ B | Saat setup voice | SDP/ICE (lihat `31`) |
| `sync:request` | klien → host | Saat join/reconnect | — → host membalas `state:full` |

## 6. Alur Aksi Dunia
```
Klien B: tekan cangkul di tile (10,5)
  → prediksi lokal (animasi + tile gembur sementara)
  → kirim `cmd` {farm/till}
Host A: validasi (energi, tile farmable, tidak bentrok)
  → applyCommand → state:patch ke semua → cmd:ack ok
Klien B: terima ack → konfirmasi prediksi
           (kalau ditolak → rollback + toast alasan)
```
- **Konflik**: dua Command untuk tile yang sama diproses berurutan oleh host. Command kedua ditolak dengan alasan ramah ("Udah dipanen {partner} 😄").
- Command memiliki `cmdId` unik supaya tidak dieksekusi dua kali saat retry.

## 7. Gerak yang Mulus
- Pengirim melakukan throttle 10 Hz dan mengirim hanya kalau posisi berubah.
- Penerima menyimpan buffer snapshot dan merender **100 ms di belakang** (interpolasi linear). Kalau jeda > 500 ms, karakter di-*snap*.
- Pemain di area berbeda tidak dirender (hanya tampil di app Peta).

## 8. Fitur Sosial Realtime
- Bubble chat di atas kepala + riwayat di app Chat.
- Emote cepat (tombol `F` / roda emote).
- **Ajak** (follow, bonceng, peluk, kencan, cutscene) memakai `social:request` dengan konfirmasi (`16` §5).
- **Indikator arah**: kalau pasangan di area yang sama tapi di luar layar, muncul panah kecil di pinggir layar.

## 9. Persistensi
- Host menyimpan **world save** ke DB: setiap jam game, saat Day Tick, saat cutscene penting selesai, dan saat keluar (`beforeunload` + `visibilitychange`).
- Setiap pemain menyimpan **player save** miliknya sendiri (posisi, inventory, dompet, needs, outfit).
- Detail tabel & versi: `32-backend-save.md`.

## 10. Koneksi Putus
- **< 60 detik**: Command diantrekan lokal, UI menampilkan ikon "📶 Menyambung…", gerak tetap bisa.
- **> 60 detik**: game di-pause dengan overlay "Koneksi putus. Progres aman, menyambung ulang…".
- Saat tersambung kembali: `sync:request` → terima `state:full` → kirim ulang antrean yang belum di-ack.
- Kalau host yang putus: pemain lain mengambil alih (§4). Saat host lama kembali, ia menjadi klien.

## 11. Batas & Keamanan
- Ukuran pesan kecil (< 2 KB, kecuali `state:full`).
- Rate limit sisi klien: maksimal 20 pesan/detik total.
- Validasi semua payload masuk dengan zod. Abaikan payload yang tidak valid.
- Hanya 2 pemain. Kalau ada pemain ke-3 mencoba join, ditolak di level RLS.

## 12. Checklist Uji
- [ ] Dua browser (satu normal, satu incognito) login sebagai A & B
- [ ] Saling lihat gerak mulus
- [ ] Cangkul/tanam/panen sinkron, konflik ditangani
- [ ] Host keluar → handover tanpa kehilangan progres
- [ ] Putus WiFi 30 detik → antrean terkirim
- [ ] Putus 2 menit → pause → pulih
- [ ] Ganti hari hanya saat dua-duanya tidur
