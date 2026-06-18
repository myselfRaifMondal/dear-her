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
