# 19 · Quest, Cerita, Event & Festival

## 1. Jenis Quest
| Jenis | Sumber | Contoh | Hadiah utama |
|---|---|---|---|
| 📖 **Utama** | Cerita (bab) | "Pendatang Baru": sewa plot di Kebun Warga | Membuka sistem/area |
| 📋 **Umum** | Papan warga (Alun-alun), NPC | "Antar 5 telur ke Bu Euis" | Uang, item, hati NPC |
| 💗 **Romantis** | Tahap hubungan, app Chat | "Kasih bunga ke {partner} 3 hari berturut-turut" | Romansa, **kenangan** |
| 🎂 **Ultah** | Tanggal ultah (game & asli) | "Siapkan pesta kejutan untuk {partner}" | Kenangan spesial |
| 🗓️ **Harian** | App Quest (3/hari) | "Panen 10 sayur", "Ngobrol dengan 3 warga" | Uang kecil, XP |
| 🍂 **Musiman** | Awal musim | "Kumpulkan 4 jenis bunga semi" | Item langka |
| 🏛️ **Proyek Kota** | Pak RT | Bundle Revitalisasi (`21`) | Area/fitur baru |
| 🤫 **Rahasia** | Tersembunyi di dunia | "Temukan surat di bawah pohon Tahura" | Kenangan, easter egg |
| 🤝 **Co-op** | Hanya berdua online | "Angkat lemari berdua", "Dansa di festival" | Bonus besar |

## 2. Quest Engine
### Struktur data (`src/content/quests/*.json`)
```json
{
  "id": "rom_flowers_3days",
  "type": "romance",
  "title": "Bunga Tiap Pagi",
  "description": "Kasih bunga ke {partner} tiga hari berturut-turut.",
  "giver": "phone",
  "prerequisites": { "stageMin": 3, "questsDone": ["main_ch3_start"] },
  "objectives": [
    { "id": "o1", "kind": "give_item_to_partner", "itemTag": "flower", "count": 3, "consecutiveDays": true }
  ],
  "rewards": [
    { "kind": "romance", "amount": 10 },
    { "kind": "unlock_memory", "memoryId": "mem_first_flower" }
  ],
  "coop": false,
  "repeatable": false,
  "expiresInDays": null
}
```

### Jenis objective
`collect_item`, `deliver_item`, `talk_to`, `reach_location`, `harvest`, `catch_fish`, `cook`, `craft`, `buy`, `earn_money`, `wear_outfit`, `take_photo_at`, `interact_partner`, `spend_time_with_partner` (menit bersama), `both_online_at`, `reach_stage`, `reach_hearts`, `donate`, `minigame_score`, `custom_flag`.

### State machine
```
locked → available → active → (objectives progress) → completed → reward_claimed
                         └──→ failed/expired (hanya quest harian/berbatas waktu)
```
- Progres objective di-update lewat **GameEvent** (bukan polling).
- Quest co-op: progres dihitung dari aksi kedua pemain.
- Quest log tampil di **app Quest** di HP, dengan maksimal 1 quest yang "dilacak" di HUD.

## 3. Cerita Utama (Bab)
| Bab | Judul | Inti | Membuka |
|---|---|---|---|
| 1 | Pendatang Baru | Tiba di Bandung, sewa plot Lembang, kenal warga | Farming, toko |
| 2 | Kebetulan yang Disengaja | Bertemu pasangan di Kebun Warga | App Chat, Pasar Baru |
| 3 | Ngopi di Braga | Jadi teman, kerja di Braga | Karier, kencan |
| 4 | Sore di Dago | PDKT | Romansa, quest romantis |
| 5 | Nyatain Perasaan | Jadian 💗 | Interaksi romantis |
| 6 | Bandung Butuh Kita | Proyek Revitalisasi dimulai | Area lanjutan |
| 7 | Cincin dari Braga | Minta restu di Buahbatu → lamaran | Pertunangan |
| 8 | Hari Bahagia | Pernikahan & bulan madu | Rumah bersama, dompet bersama |
| 9 | Rumah Kita | Rumah sendiri, KPR, dekor | Tanah, rumah impian |
| 10 | Keluarga Kecil | Anak pertama | Keluarga, sekolah |
| ∞ | Buahbatu Story | Sandbox, legacy | — |

Setiap bab berisi 3–8 quest + 1–2 cutscene, dan **diselipi kenangan asli** dari `personal/memories.json`.

## 4. Cutscene Engine
Script JSON berurutan, dijalankan host lalu disinkronkan ke klien:
```json
{
  "id": "cs_first_meet",
  "requiresBothOnline": true,
  "steps": [
    { "op": "fade", "to": "black", "ms": 500 },
    { "op": "teleport", "who": "A", "area": "lembang", "spawn": "garden_left" },
    { "op": "teleport", "who": "B", "area": "lembang", "spawn": "garden_right" },
    { "op": "fade", "to": "clear", "ms": 500 },
    { "op": "music", "key": "theme_meet" },
    { "op": "walk", "who": "A", "to": [12, 8] },
    { "op": "emote", "who": "B", "emote": "surprise" },
    { "op": "say", "who": "B", "portrait": "blush", "text": "Eh... maaf, ini plot kamu ya?" },
    { "op": "choice", "who": "A", "options": [
      { "text": "Bukan, plot kita sebelahan kok 😄", "set": { "flag.meet_friendly": true } },
      { "text": "Iya, tapi boleh kok dipinjem.", "set": { "flag.meet_sweet": true } }
    ]},
    { "op": "wait", "ms": 800 },
    { "op": "end" }
  ]
}
```
Operasi: `fade`, `teleport`, `walk`, `face`, `emote`, `say`, `choice`, `camera`, `music`, `sfx`, `wait`, `photo` (simpan ke album), `play_memory`, `set`, `give`, `end`.
- Cutscene `requiresBothOnline` hanya bisa dimulai saat keduanya online dan berada di area yang sama.
- **Skip**: cutscene bisa di-skip hanya jika **keduanya** setuju (atau saat ditonton ulang dari album).

## 5. Festival (2 per musim)
| Musim | Hari | Festival | Aktivitas |
|---|---|---|---|
| Semi | 13 | 🌸 Festival Bunga | Pameran bunga, kontes, dansa bunga (co-op) |
| Semi | 24 | 🍵 Pesta Teh Ciwidey | Petik teh cepat, cicip teh |
| Panas | 11 | 🇮🇩 Lomba 17-an | Balap karung, makan kerupuk, panjat pinang (co-op) |
| Panas | 28 | 🎆 Malam Kembang Api | Nonton berdua di Dago, momen romantis besar |
| Gugur | 16 | 🌾 Seren Taun | Festival panen Sunda, kontes hasil panen & ternak |
| Gugur | 22 | 🍢 Festival Kuliner Braga | Lomba masak, cicip makanan |
| Dingin | 8 | 🏮 Festival Lampion | Terbangkan lampion dengan harapan (tulisan pemain) |
| Dingin | 28 | 🎇 Malam Tahun Baru | Hitung mundur di Alun-alun, ringkasan tahun |

- Hari festival: toko tutup, NPC berkumpul, cuaca dipaksa cerah.
- Festival menawarkan item & baju eksklusif.

## 6. Event Tanggal Asli (Real-World)
Dibaca dari `personal/profile.json`:
```json
{
  "realDateEvents": [
    { "id": "bday_B", "date": "MM-DD", "type": "birthday", "who": "B" },
    { "id": "bday_A", "date": "MM-DD", "type": "birthday", "who": "A" },
    { "id": "anniv", "date": "MM-DD", "type": "anniversary", "since": "YYYY-MM-DD" },
    { "id": "valentine", "date": "02-14", "type": "custom" }
  ]
}
```
- Saat pemain login di tanggal tersebut: dekorasi spesial di dunia, quest ultah/anniversary aktif, surat + kenangan terkunci terbuka, kue di rumah.
- **Ultah**: pemain yang **berulang tahun tidak bisa melihat** quest persiapannya. Quest hanya muncul di HP pasangan, supaya bisa bikin kejutan.
- Event yang terlewat masih bisa diklaim maksimal 3 hari setelahnya.

## 7. Event Acak Harian
Maksimal 1 event per hari (`random-events.json`), dengan bobot sesuai kondisi:
| Event | Kondisi |
|---|---|
| Pasar kaget di Alun-alun | Sabtu |
| Si Oren datang ke rumah | Acak |
| NPC minta tolong (quest kilat) | Acak |
| Pelangi setelah hujan (foto langka) | Setelah hujan |
| Meteor (bintang jatuh, buat harapan berdua) | Malam cerah, langka |
| Tamu dari kampung (dapat hadiah) | Setelah nikah |
| Kebun didatangi burung (usir!) | Panas |
| Pemadaman listrik, candle light dinner 💗 | Badai, setelah nikah |
