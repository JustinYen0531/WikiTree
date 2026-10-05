-- =====================================================================
-- NCCU HUB SUPABASE BASELINE SCHEMA (LEGACY BOOTSTRAP)
-- =====================================================================
-- Existing projects should receive later schema changes through the
-- versioned files in supabase/migrations, not by rerunning this whole file.
-- The legacy user_security/password-hint recovery system is intentionally
-- removed; see the migration that drops its table and RPC functions.

-- ---------------------------------------------------------------------
-- 1. 建立公開個人資料表格 (profiles)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  nickname text not null,
  college text not null,
  department text not null,
  grade text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS 行級安全性政策
alter table public.profiles enable row level security;

-- 允許任何人讀取公開個人資料 (例如：顯示筆記的作者)
create policy "任何人皆可讀取個人檔案"
  on public.profiles for select
  using (true);

-- 允許已登入的使用者新增/修改自己的個人檔案
create policy "使用者可新增自己的個人檔案"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "使用者可更新自己的個人檔案"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. 建立社群發布筆記表格 (published_notes)
-- ---------------------------------------------------------------------
create table if not exists public.published_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  author_username text not null,
  author_nickname text not null,
  title text not null,
  content text not null default '',
  note_path text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_public boolean not null default true
);

-- 啟用 RLS
alter table public.published_notes enable row level security;

-- 任何人可讀取公開筆記
create policy "任何人皆可讀取公開筆記"
  on public.published_notes for select
  using (is_public = true);

-- 已登入使用者可發布自己的筆記
create policy "使用者可發布筆記"
  on public.published_notes for insert
  with check (auth.uid() = user_id);

-- 使用者可刪除自己發布的筆記
create policy "使用者可刪除自己的發布筆記"
  on public.published_notes for delete
  using (auth.uid() = user_id);
