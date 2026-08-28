-- MAGHRABY STORE - Multi-image migration
-- نفّذ هذا الملف مرة واحدة فقط بعد تحديث الموقع إلى v10.

create extension if not exists pgcrypto;

create table if not exists public.site_sections (
  section text primary key check (section in ('work','offers','latest')),
  image_url text,
  image_path text,
  updated_at timestamptz not null default now()
);
alter table public.site_sections enable row level security;

drop policy if exists "public can read sections" on public.site_sections;
create policy "public can read sections" on public.site_sections for select to anon, authenticated using (true);

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins can read themselves" on public.admins;
create policy "admins can read themselves" on public.admins for select to authenticated using (id = auth.uid());

create or replace function public.make_first_user_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins(id) values (new.id) on conflict do nothing;
  end if;
  return new;
end; $$;

drop trigger if exists on_auth_user_make_first_admin on auth.users;
create trigger on_auth_user_make_first_admin after insert on auth.users
for each row execute function public.make_first_user_admin();

-- جدول الصور الجديد: عدد غير محدود عملياً من الصور لكل قسم.
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('work','offers','latest')),
  image_url text not null,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists media_items_section_sort_idx on public.media_items(section, sort_order, created_at);
alter table public.media_items enable row level security;

drop policy if exists "public can read media" on public.media_items;
create policy "public can read media" on public.media_items for select to anon, authenticated using (true);
drop policy if exists "admins can insert media" on public.media_items;
create policy "admins can insert media" on public.media_items for insert to authenticated
with check (exists (select 1 from public.admins a where a.id = auth.uid()));
drop policy if exists "admins can update media" on public.media_items;
create policy "admins can update media" on public.media_items for update to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()))
with check (exists (select 1 from public.admins a where a.id = auth.uid()));
drop policy if exists "admins can delete media" on public.media_items;
create policy "admins can delete media" on public.media_items for delete to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()));

-- نقل الصور القديمة الموجودة في site_sections إلى الجدول الجديد مرة واحدة.
insert into public.media_items(section,image_url,image_path,sort_order)
select s.section,s.image_url,s.image_path,0
from public.site_sections s
where s.image_url is not null and s.image_path is not null
and not exists (select 1 from public.media_items m where m.section=s.section);

insert into storage.buckets (id,name,public) values ('store-images','store-images',true)
on conflict (id) do update set public=true;

drop policy if exists "public can view site images" on storage.objects;
create policy "public can view site images" on storage.objects for select to anon, authenticated using (bucket_id='store-images');
drop policy if exists "admins can upload site images" on storage.objects;
create policy "admins can upload site images" on storage.objects for insert to authenticated
with check (bucket_id='store-images' and exists (select 1 from public.admins a where a.id=auth.uid()));
drop policy if exists "admins can update site images" on storage.objects;
create policy "admins can update site images" on storage.objects for update to authenticated
using (bucket_id='store-images' and exists (select 1 from public.admins a where a.id=auth.uid()))
with check (bucket_id='store-images' and exists (select 1 from public.admins a where a.id=auth.uid()));
drop policy if exists "admins can delete site images" on storage.objects;
create policy "admins can delete site images" on storage.objects for delete to authenticated
using (bucket_id='store-images' and exists (select 1 from public.admins a where a.id=auth.uid()));
