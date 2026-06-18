-- =====================================================================
-- NCCU HUB SUPABASE DATABASE SCHEMA SETUP
-- =====================================================================
-- 請在您的 Supabase 專案中的 「SQL Editor」 新增一個查詢，
-- 貼上以下所有 SQL 指令並執行，即可完成資料庫表格與安全性設定！

-- ---------------------------------------------------------------------
-- 1. 建立公開個人資料表格 (users)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  nickname text not null,
  college text not null,
  department text not null,
  grade text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS 行級安全性政策
alter table public.users enable row level security;

-- 允許任何人讀取公開個人資料 (例如：顯示筆記的作者)
create policy "任何人皆可讀取個人檔案"
  on public.users for select
  using (true);

-- 允許已登入的使用者新增/修改自己的個人檔案
create policy "使用者可新增自己的個人檔案"
  on public.users for insert
  with check (auth.uid() = id);

create policy "使用者可更新自己的個人檔案"
  on public.users for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. 建立密碼安全保護表格 (user_security)
-- ---------------------------------------------------------------------
create table if not exists public.user_security (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  hint_question text not null,
  hint_answer text not null,
  recovery_password text not null
);

-- 啟用 RLS
alter table public.user_security enable row level security;

-- 限制：只有使用者本人可以直接查詢或更新自己的密碼安全資料
create policy "使用者可管理自己的安全資料"
  on public.user_security for all
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 3. 建立密碼提示問題與答案驗證的安全 RPC 函數 (SECURITY DEFINER)
-- ---------------------------------------------------------------------

-- RPC 函數 1: 輸入帳號，取得該帳戶的密碼提示問題
create or replace function public.get_user_hint_question(username_input text)
returns text
language plpgsql
security definer -- 以資料庫管理員權限執行，繞過 RLS 行級限制以供未登入者查詢
as $$
declare
  q text;
begin
  select hint_question into q 
  from public.user_security 
  where lower(username) = lower(username_input);
  
  return q;
end;
$$;

-- RPC 函數 2: 輸入帳號與密碼提示答案，驗證成功後回傳明文密碼
create or replace function public.verify_hint_and_get_password(username_input text, answer_input text)
returns text
language plpgsql
security definer -- 以資料庫管理員權限執行，繞過 RLS
as $$
declare
  p text;
begin
  select recovery_password into p
  from public.user_security
  where lower(username) = lower(username_input)
    and lower(hint_answer) = lower(answer_input);

  return p;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. 建立社群發布筆記表格 (published_notes)
-- ---------------------------------------------------------------------
create table if not exists public.published_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  author_username text not null,
  author_nickname text not null,
  title text not null,
  content text not null default '',
  note_path text not null default '',
  category text not null default 'general',
  category_label text not null default '通用學習',
  category_code text not null default '',
  category_title text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_public boolean not null default true
);

alter table public.published_notes
  add column if not exists category text not null default 'general',
  add column if not exists category_label text not null default '通用學習',
  add column if not exists category_code text not null default '',
  add column if not exists category_title text not null default '',
  add column if not exists description text not null default '',
  add column if not exists tags text[] not null default '{}';

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

-- 已登入使用者可刪除自己發布的筆記
create policy "使用者可刪除自己的發布筆記"
  on public.published_notes for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. 建立筆記澆水/點讚功能表格 (note_waterings)
-- ---------------------------------------------------------------------
create table if not exists public.note_waterings (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.published_notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (note_id, user_id)
);

-- 啟用 RLS
alter table public.note_waterings enable row level security;

-- 任何人可讀取澆水紀錄
create policy "任何人皆可讀取澆水紀錄"
  on public.note_waterings for select
  using (true);

-- 已登入使用者可以澆水
create policy "使用者可以進行澆水"
  on public.note_waterings for insert
  with check (auth.uid() = user_id);

-- 使用者可以取消自己的澆水
create policy "使用者可以取消自己的澆水"
  on public.note_waterings for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 6. 建立筆記留言/足跡功能表格 (note_messages)
-- ---------------------------------------------------------------------
create table if not exists public.note_messages (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.published_notes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  sender_username text not null,
  sender_nickname text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 啟用 RLS
alter table public.note_messages enable row level security;

-- 任何人可讀取留言
create policy "任何人皆可讀取留言"
  on public.note_messages for select
  using (true);

-- 已登入使用者可以留言
create policy "使用者可以留下訊息"
  on public.note_messages for insert
  with check (auth.uid() = user_id);

-- 使用者可以刪除自己的留言
create policy "使用者可以刪除自己的留言"
  on public.note_messages for delete
  using (auth.uid() = user_id);
