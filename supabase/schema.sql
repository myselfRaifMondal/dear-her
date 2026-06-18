-- Dear Her v1.6 Supabase schema
-- Run this in Supabase SQL Editor.

create table if not exists public.care_packages (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.care_packages enable row level security;

drop policy if exists "Users can read their own care package" on public.care_packages;
create policy "Users can read their own care package"
on public.care_packages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own care package" on public.care_packages;
create policy "Users can insert their own care package"
on public.care_packages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own care package" on public.care_packages;
create policy "Users can update their own care package"
on public.care_packages
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own care package" on public.care_packages;
create policy "Users can delete their own care package"
on public.care_packages
for delete
to authenticated
using (auth.uid() = user_id);

-- Dear Her private memory photo storage
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'memory-photos',
  'memory-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own memory photos" on storage.objects;
create policy "Users can read their own memory photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their own memory photos" on storage.objects;
create policy "Users can upload their own memory photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own memory photos" on storage.objects;
create policy "Users can update their own memory photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own memory photos" on storage.objects;
create policy "Users can delete their own memory photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'memory-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
