create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('top', 'bottom')),
  color text null,
  season text null,
  style_tags text[] not null default '{}',
  image_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clothing_items_user_id_idx on public.clothing_items (user_id);
create index if not exists clothing_items_category_idx on public.clothing_items (category);
create index if not exists clothing_items_color_idx on public.clothing_items (color);
create index if not exists clothing_items_season_idx on public.clothing_items (season);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  top_item_id uuid not null references public.clothing_items (id) on delete cascade,
  bottom_item_id uuid not null references public.clothing_items (id) on delete cascade,
  is_favorite boolean not null default true,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, top_item_id, bottom_item_id)
);

create index if not exists outfits_user_id_idx on public.outfits (user_id);
create index if not exists outfits_favorite_idx on public.outfits (is_favorite);

alter table public.profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = user_id);

create policy "clothing_select_own" on public.clothing_items
for select using (auth.uid() = user_id);
create policy "clothing_insert_own" on public.clothing_items
for insert with check (auth.uid() = user_id);
create policy "clothing_update_own" on public.clothing_items
for update using (auth.uid() = user_id);
create policy "clothing_delete_own" on public.clothing_items
for delete using (auth.uid() = user_id);

create policy "outfits_select_own" on public.outfits
for select using (auth.uid() = user_id);
create policy "outfits_insert_own" on public.outfits
for insert with check (auth.uid() = user_id);
create policy "outfits_delete_own" on public.outfits
for delete using (auth.uid() = user_id);

