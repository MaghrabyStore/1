-- ============================================================
-- MAGHRABY STORE - Supabase setup
-- ============================================================
-- نفّذ الملف ده مرة واحدة من Supabase Dashboard > SQL Editor.
-- لا تضع Service Role Key في الموقع.

create extension if not exists pgcrypto;

create table if not exists public.site_sections (
  section text primary key check (section in ('work','offers','latest')),
  image_url text,
  image_path text,
  updated_at timestamptz not null default now()
);

insert into public.site_sections(section) values ('work'),('offers'),('latest')
on conflict (section) do nothing;

alter table public.site_sections enable row level security;

-- أي زائر يستطيع قراءة صور الأقسام، لكن الكتابة للمطور فقط.
drop policy if exists "public can read sections" on public.site_sections;
create policy "public can read sections"
on public.site_sections for select
to anon, authenticated
using (true);

-- جدول المطورين. أول حساب يتم إنشاؤه في Auth يصبح المطور تلقائياً.
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admins can read themselves" on public.admins;
create policy "admins can read themselves"
on public.admins for select
to authenticated
using (id = auth.uid());

-- أول مستخدم فقط يصبح Admin. نفّذ/أنشئ حسابك قبل فتح التسجيل للناس.
create or replace function public.make_first_user_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins(id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_make_first_admin on auth.users;
create trigger on_auth_user_make_first_admin
after insert on auth.users
for each row execute function public.make_first_user_admin();

-- الكتابة على الأقسام للمطورين فقط.
drop policy if exists "admins can insert sections" on public.site_sections;
create policy "admins can insert sections"
on public.site_sections for insert
to authenticated
with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "admins can update sections" on public.site_sections;
create policy "admins can update sections"
on public.site_sections for update
to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()))
with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "admins can delete sections" on public.site_sections;
create policy "admins can delete sections"
on public.site_sections for delete
to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Storage bucket للصور. اجعله Public لأن الموقع الرئيسي يحتاج قراءة الصور.
insert into storage.buckets (id, name, public)
values ('store-images','store-images',true)
on conflict (id) do update set public = true;

-- أي شخص يستطيع قراءة الصور العامة.
drop policy if exists "public can view site images" on storage.objects;
create policy "public can view site images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'store-images');

-- المطورون فقط يستطيعون الرفع والتعديل والحذف.
drop policy if exists "admins can upload site images" on storage.objects;
create policy "admins can upload site images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'store-images' and exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "admins can update site images" on storage.objects;
create policy "admins can update site images"
on storage.objects for update
to authenticated
using (bucket_id = 'store-images' and exists (select 1 from public.admins a where a.id = auth.uid()))
with check (bucket_id = 'store-images' and exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "admins can delete site images" on storage.objects;
create policy "admins can delete site images"
on storage.objects for delete
to authenticated
using (bucket_id = 'store-images' and exists (select 1 from public.admins a where a.id = auth.uid()));
