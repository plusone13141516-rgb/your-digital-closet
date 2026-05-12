create extension if not exists "pgcrypto";

do $$ begin
  if not exists (select 1 from pg_type where typname = 'age_group') then
    create type public.age_group as enum ('kid', 'teen', 'adult');
  end if;
end $$;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My Household',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists households_owner_id_idx on public.households (owner_id);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  age_group public.age_group null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists household_members_household_id_idx on public.household_members (household_id);

alter table public.clothing_items
  add column if not exists household_id uuid null references public.households (id) on delete cascade;

alter table public.clothing_items
  add column if not exists member_id uuid null references public.household_members (id) on delete set null;

alter table public.clothing_items
  add column if not exists original_image_path text null;

alter table public.clothing_items
  add column if not exists processed_image_path text null;

alter table public.clothing_items
  add column if not exists notes text null;

alter table public.clothing_items
  add column if not exists is_favorite boolean not null default false;

alter table public.clothing_items drop constraint if exists clothing_items_category_check;
alter table public.clothing_items
  add constraint clothing_items_category_check check (category in ('top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessories'));

create index if not exists clothing_items_household_id_idx on public.clothing_items (household_id);
create index if not exists clothing_items_member_id_idx on public.clothing_items (member_id);
create index if not exists clothing_items_is_favorite_idx on public.clothing_items (is_favorite);

create table if not exists public.clothing_analysis (
  id uuid primary key default gen_random_uuid(),
  clothing_item_id uuid not null references public.clothing_items (id) on delete cascade,
  category text not null check (category in ('top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessories')),
  dominant_color text null,
  pattern text null,
  style_tags text[] not null default '{}',
  ai_description text null,
  confidence_score real not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clothing_item_id)
);

create index if not exists clothing_analysis_category_idx on public.clothing_analysis (category);
create index if not exists clothing_analysis_dominant_color_idx on public.clothing_analysis (dominant_color);
create index if not exists clothing_analysis_pattern_idx on public.clothing_analysis (pattern);

create table if not exists public.similar_products (
  id uuid primary key default gen_random_uuid(),
  clothing_item_id uuid not null references public.clothing_items (id) on delete cascade,
  product_title text not null,
  product_image_url text not null,
  category text null,
  similarity_score real not null default 0.0,
  is_favorite boolean not null default false,
  source text not null default 'mock',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists similar_products_clothing_item_id_idx on public.similar_products (clothing_item_id);
create index if not exists similar_products_is_favorite_idx on public.similar_products (is_favorite);

create table if not exists public.saved_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  member_id uuid not null references public.household_members (id) on delete cascade,
  top_item_id uuid not null references public.clothing_items (id) on delete cascade,
  bottom_item_id uuid not null references public.clothing_items (id) on delete cascade,
  compatibility_score real not null default 0.5,
  explanation text null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, member_id, top_item_id, bottom_item_id)
);

create index if not exists saved_outfits_user_id_idx on public.saved_outfits (user_id);
create index if not exists saved_outfits_member_id_idx on public.saved_outfits (member_id);
create index if not exists saved_outfits_is_favorite_idx on public.saved_outfits (is_favorite);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.clothing_analysis enable row level security;
alter table public.similar_products enable row level security;
alter table public.saved_outfits enable row level security;

create policy "households_select_own" on public.households
for select using (auth.uid() = owner_id);
create policy "households_insert_own" on public.households
for insert with check (auth.uid() = owner_id);
create policy "households_update_own" on public.households
for update using (auth.uid() = owner_id);
create policy "households_delete_own" on public.households
for delete using (auth.uid() = owner_id);

create policy "members_select_own_household" on public.household_members
for select using (
  exists (select 1 from public.households h where h.id = household_id and h.owner_id = auth.uid())
);
create policy "members_insert_own_household" on public.household_members
for insert with check (
  exists (select 1 from public.households h where h.id = household_id and h.owner_id = auth.uid())
);
create policy "members_update_own_household" on public.household_members
for update using (
  exists (select 1 from public.households h where h.id = household_id and h.owner_id = auth.uid())
);
create policy "members_delete_own_household" on public.household_members
for delete using (
  exists (select 1 from public.households h where h.id = household_id and h.owner_id = auth.uid())
);

create policy "analysis_select_own" on public.clothing_analysis
for select using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "analysis_insert_own" on public.clothing_analysis
for insert with check (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "analysis_update_own" on public.clothing_analysis
for update using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "analysis_delete_own" on public.clothing_analysis
for delete using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);

create policy "similar_select_own" on public.similar_products
for select using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "similar_insert_own" on public.similar_products
for insert with check (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "similar_update_own" on public.similar_products
for update using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);
create policy "similar_delete_own" on public.similar_products
for delete using (
  exists (
    select 1
    from public.clothing_items i
    where i.id = clothing_item_id
      and i.user_id = auth.uid()
  )
);

create policy "saved_outfits_select_own" on public.saved_outfits
for select using (auth.uid() = user_id);
create policy "saved_outfits_insert_own" on public.saved_outfits
for insert with check (auth.uid() = user_id);
create policy "saved_outfits_update_own" on public.saved_outfits
for update using (auth.uid() = user_id);
create policy "saved_outfits_delete_own" on public.saved_outfits
for delete using (auth.uid() = user_id);

