# 32 · Backend (Supabase) & Save

## 1. Setup Supabase
1. Buat project di supabase.com (region terdekat, misal Singapore).
2. Simpan `Project URL` dan `anon/publishable key` ke `.env.local`.
3. Semua perubahan skema ditulis sebagai file SQL di `supabase/migrations/NNN_nama.sql` (jangan klik-klik manual tanpa dicatat).
4. Aktifkan Auth **Email + Password**. Nonaktifkan sign up publik setelah dua akun dibuat (atau pakai kode undangan).

## 2. Auth & Household
- 2 akun (A & B).
- Pemain A membuat **household** → mendapat **kode undangan** (6 karakter).
- Pemain B memasukkan kode → bergabung sebagai role `B`.
- Maksimal 2 anggota per household (dicek di fungsi SQL `join_household`).

## 3. Skema Tabel
```sql
-- 001_init.sql
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Rumah Kita',
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('A','B')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id),
  unique (household_id, role)
);

create table public.world_saves (
  household_id uuid primary key references public.households(id) on delete cascade,
  schema_version int not null,
  version bigint not null default 0,
  data jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  schema_version int not null,
  version bigint not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.mailbox (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  from_user uuid references auth.users(id),
  to_user uuid references auth.users(id),
  kind text not null check (kind in ('letter','voice','gift','system')),
  body text,
  storage_path text,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  from_user uuid not null references auth.users(id),
  text text not null check (char_length(text) <= 500),
  created_at timestamptz not null default now()
);

create table public.save_snapshots (            -- backup harian (simpan 14 terakhir)
  id bigint generated always as identity primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  kind text not null check (kind in ('world','player')),
  owner uuid,
  data jsonb not null,
  created_at timestamptz not null default now()
);
```

## 4. Row Level Security
```sql
-- 002_rls.sql
create or replace function public.is_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.world_saves       enable row level security;
alter table public.player_saves      enable row level security;
alter table public.mailbox           enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.save_snapshots    enable row level security;

create policy "member read household" on public.households
  for select using (public.is_member(id));
create policy "member read members" on public.household_members
  for select using (public.is_member(household_id));

create policy "member rw world" on public.world_saves
  for all using (public.is_member(household_id)) with check (public.is_member(household_id));

create policy "member read player saves" on public.player_saves
  for select using (public.is_member(household_id));
create policy "own write player save" on public.player_saves
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "member rw mailbox" on public.mailbox
  for all using (public.is_member(household_id)) with check (public.is_member(household_id));
create policy "member rw chat" on public.chat_messages
  for all using (public.is_member(household_id))
  with check (public.is_member(household_id) and from_user = auth.uid());
create policy "member rw snapshots" on public.save_snapshots
  for all using (public.is_member(household_id)) with check (public.is_member(household_id));
```
Pembuatan household & join dilakukan lewat fungsi `security definer` (`create_household()`, `join_household(code)`) yang memvalidasi batas 2 anggota.

## 5. Realtime Authorization (channel privat)
```sql
-- 003_realtime.sql  (cek docs "Realtime Authorization" Supabase terbaru)
create policy "household members receive" on realtime.messages
  for select to authenticated
  using (exists (
    select 1 from public.household_members m
    where m.user_id = auth.uid()
      and realtime.topic() = 'household:' || m.household_id::text
  ));

create policy "household members send" on realtime.messages
  for insert to authenticated
  with check (exists (
    select 1 from public.household_members m
    where m.user_id = auth.uid()
      and realtime.topic() = 'household:' || m.household_id::text
  ));
```
Client: `supabase.channel('household:<id>', { config: { private: true } })`.

## 6. Storage
- Bucket **privat** `media`: `{householdId}/voice/…`, `{householdId}/photos/…`, `{householdId}/personal/…`.
- Policy: akses hanya jika folder pertama = household milik user:
```sql
create policy "household media" on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
```
- Akses file via **signed URL**.

## 7. Save Game
### Skema & Versi
- Save divalidasi dengan **zod** (`src/save/schema.ts`), memiliki `schemaVersion`.
- Setiap perubahan struktur save → naikkan `schemaVersion` + tambah migrasi `src/save/migrations/vN_to_vN+1.ts` + test.

### Strategi Penyimpanan
| Lapisan | Kapan | Isi |
|---|---|---|
| **IndexedDB lokal** | Setiap perubahan penting (debounce 2 detik) | World (cache) + player |
| **Cloud** (Supabase) | Host: tiap jam game, Day Tick, keluar. Player: tiap 2 menit & keluar | World + player |
| **Snapshot** | Setiap Day Tick (host), simpan 14 terakhir | Backup |
| **Export manual** | Dari menu Pengaturan | File `.json` |

### Optimistic Concurrency
```sql
create or replace function public.save_world(p_household uuid, p_expected bigint, p_schema int, p_data jsonb)
returns bigint language plpgsql security invoker as $$
declare v bigint;
begin
  update public.world_saves
     set data = p_data, schema_version = p_schema, version = version + 1,
         updated_by = auth.uid(), updated_at = now()
   where household_id = p_household and version = p_expected
  returning version into v;
  if v is null then raise exception 'VERSION_CONFLICT'; end if;
  return v;
end $$;
```
- `VERSION_CONFLICT` → ambil versi terbaru, lalu bandingkan. Host yang sedang aktif adalah sumber kebenaran; kalau ragu, tampilkan pilihan ke pemain dengan ringkasan (hari/uang) kedua versi.

### Load Saat Login
1. Ambil cloud save & local save.
2. Pakai yang `version` lebih tinggi. Kalau sama, pakai `updated_at` terbaru.
3. Jalankan migrasi bila `schemaVersion` lebih lama.
4. Validasi zod. Kalau gagal → pakai snapshot terakhir yang valid + log error.

## 8. Keep-Alive (cegah Supabase pause)
`api/keepalive.ts` (Vercel Function):
```ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await sb.from('households').select('id').limit(1);
  return Response.json({ ok: !error, at: new Date().toISOString() });
}
```
`vercel.json`:
```json
{ "crons": [{ "path": "/api/keepalive", "schedule": "0 1 * * *" }] }
```
Set `CRON_SECRET` di Vercel env. Vercel otomatis mengirim header `Authorization: Bearer <CRON_SECRET>`.

## 9. Free Tier
Jauh dari batas untuk 2 pemain. Pantau dashboard Supabase (DB size, storage, egress) sebulan sekali, terutama ukuran voice note & foto (kompres foto ke WebP).
