# 31 · Voice

Empat fitur suara, dari yang paling mudah ke yang paling sulit.

## 1. 🗨️ Blip Suara Karakter (ala Animal Crossing)
- Setiap huruf/suku kata di dialog memainkan bunyi "blip" pendek.
- Dibuat dengan **WebAudio** (oscillator + envelope), atau sampel pendek yang di-pitch.
- Setiap karakter punya profil: `{ pitch, variance, waveform, speed }`.
- Bisa dimatikan di pengaturan.

## 2. 🎁 Suara Kenangan
- Rekaman asli kalian (`personal/audio/*.mp3`), terbuka sebagai hadiah quest/kenangan.
- Diputar lewat pemutar di **Album Kenangan** (play/pause, subtitle opsional).
- Disimpan **privat** (lihat `43`). Format: MP3/AAC 96–128 kbps, mono, maks. 2 menit.

## 3. 💌 Voice Note
- Rekam lewat app Pesan atau dari kotak pos → maksimal **60 detik** → preview → kirim.
- Teknis: `MediaRecorder` (Chrome/Firefox: `audio/webm;codecs=opus`; Safari: `audio/mp4`). Deteksi lewat `MediaRecorder.isTypeSupported`.
- Upload ke bucket privat `media` dengan path `{householdId}/voice/{uuid}.{ext}`.
- Membuat baris di tabel `mailbox` (`kind: 'voice'`), lalu notifikasi realtime ke pasangan.
- Diputar dengan **signed URL** (berlaku 1 jam).
- Bisa **ditempel ke hadiah** ("Hadiah ini ada pesan suaranya 🎙️").
- Voice note tersimpan di **Kotak Kenangan** dan bisa diputar ulang kapan saja.

## 4. 🎙️ Voice Chat Proximity (berdua online)
### Arsitektur
```
A ─── signaling (Supabase broadcast `voice:signal`) ─── B
A ═══════ WebRTC P2P audio (lewat STUN/TURN bila perlu) ═══════ B
```
- **Signaling**: offer/answer/ICE candidate dikirim lewat channel household.
- **STUN**: server STUN publik.
- **TURN**: wajib disiapkan untuk jaringan seluler/NAT ketat. Kredensial TURN **jangan di client**: ambil dari Vercel function `api/turn-credentials.ts` (kredensial sementara dari penyedia TURN gratis berkuota). Pengguna harus login.
- Constraint mic: `echoCancellation`, `noiseSuppression`, `autoGainControl` = true.

### Proximity
Volume pasangan dihitung dari jarak tile antar karakter:
| Kondisi | Volume |
|---|---|
| ≤ 5 tile | 100% |
| 5–20 tile | Menurun linear |
| > 20 tile / beda area | 0% |
| **Telepon** (app HP) | 100% di mana saja |
| Dalam 1 kendaraan | 100% |

- Implementasi: `MediaStreamAudioSourceNode` → `GainNode` (+ opsional `StereoPannerNode` untuk arah kiri/kanan).
- Indikator bicara (ikon 🔊 di atas kepala) dari `AnalyserNode`.

### Mode Bicara
- **Push-to-talk** (default): tahan `V` / tombol mic di layar sentuh.
- **Open mic** dengan ambang suara (opsional).
- Mute kapan saja. **Mic hanya aktif setelah pemain menyalakannya** (privasi).

### 📞 Telepon (fitur ala GTA)
- App Telepon di HP → panggil pasangan → ringtone di sisi pasangan → angkat → suara penuh tanpa proximity.
- Saat pasangan offline: tidak tersambung → otomatis menawarkan rekam voice note.

## 5. Izin & Kompatibilitas
- Butuh **HTTPS** (Vercel otomatis HTTPS) dan izin mikrofon.
- Kalau izin ditolak: tampilkan panduan singkat mengaktifkannya + fitur lain tetap jalan.
- Safari iOS: audio baru bisa diputar setelah ada interaksi pengguna, jadi siapkan tombol "Aktifkan suara".

## 6. Urutan Implementasi
1. Blip → 2. Suara kenangan → 3. Voice note → 4. Voice chat (setelah multiplayer stabil) → 5. Telepon.
