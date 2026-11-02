-- 末日之夜：火鍋夜驚魂 全球排行榜（在 Supabase → SQL Editor 執行一次即可）
create table if not exists public.hotpot_scores (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 12),
  level smallint not null check (level between 1 and 11),
  score integer not null check (score between 0 and 20000),
  win boolean not null default false,
  ver text check (char_length(ver) <= 10)
);
create index if not exists hotpot_scores_level_score on public.hotpot_scores (level, score desc);

alter table public.hotpot_scores enable row level security;
-- 任何人都能讀排行榜、登錄分數；不能修改或刪除（要刪除不雅名字請在 Supabase 後台的 Table Editor 刪）
create policy "public read"   on public.hotpot_scores for select to anon using (true);
create policy "public insert" on public.hotpot_scores for insert to anon with check (true);
grant select, insert on public.hotpot_scores to anon;
