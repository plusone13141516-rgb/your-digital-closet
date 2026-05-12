-- Digital Closet direction update: personal closet + trend inspiration matching
-- NOTE: This migration is written to be additive / compatible with earlier MVP tables.

create extension if not exists "pgcrypto";

-- 1) clothing_items: add fields for trend matching (keep legacy columns for compatibility)
alter table public.clothing_items
  add column if not exists image_url text null,
  add column if not exists occasion_tags text[] not null default '{}',
  add column if not exists season_tags text[] not null default '{}';

-- backfill image_url if missing (prefer cutout / processed / image_path)
update public.clothing_items
set image_url = coalesce(image_url, cutout_image_url, processed_image_path, image_path, original_image_url, original_image_path)
where image_url is null;

-- normalize categories to new direction (Tops/Bottoms)
update public.clothing_items set category = 'Tops' where category in ('top', 'outerwear', 'dress', 'shoes', 'accessories');
update public.clothing_items set category = 'Bottoms' where category = 'bottom';

-- replace category constraint (best effort; constraint name may vary across envs)
alter table public.clothing_items drop constraint if exists clothing_items_category_check;
alter table public.clothing_items drop constraint if exists clothing_items_category_check_v2;
alter table public.clothing_items
  add constraint clothing_items_category_check_v2 check (category in ('Tops', 'Bottoms'));

-- 2) trend_cards: global trend inspiration metadata (seeded in app for MVP)
create table if not exists public.trend_cards (
  id uuid primary key default gen_random_uuid(),
  trend_name text not null,
  source_name text null,
  source_url text null,
  published_date date null,
  summary text null,
  style_tags text[] not null default '{}',
  color_tags text[] not null default '{}',
  top_keywords text[] not null default '{}',
  bottom_keywords text[] not null default '{}',
  occasion_tags text[] not null default '{}',
  season_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists trend_cards_trend_name_idx on public.trend_cards (trend_name);

alter table public.trend_cards enable row level security;
-- readable to everyone (no copyrighted content stored here; only metadata/tags)
drop policy if exists "trend_cards_select_all" on public.trend_cards;
create policy "trend_cards_select_all" on public.trend_cards for select using (true);

-- 3) outfits: move to a member-based outfit table (keep old tables; app will use `outfits`)
alter table public.outfits
  add column if not exists member_id uuid null references public.household_members (id) on delete cascade,
  add column if not exists trend_card_id uuid null references public.trend_cards (id) on delete set null,
  add column if not exists name text not null default 'New Outfit',
  add column if not exists style_tags text[] not null default '{}',
  add column if not exists occasion_tags text[] not null default '{}';

-- Ensure uniqueness at (user, member, top, bottom)
create unique index if not exists outfits_unique_member_combo_idx
  on public.outfits (user_id, member_id, top_item_id, bottom_item_id);

