-- Cutout Closet + Swipe Outfit Matcher
-- Adds background-removal friendly columns to clothing_items.
-- Keeps existing columns (image_path/original_image_path/processed_image_path) for backward compatibility.

alter table public.clothing_items
  add column if not exists original_image_url text null,
  add column if not exists cutout_image_url text null,
  add column if not exists background_removed boolean not null default false,
  add column if not exists image_width integer null,
  add column if not exists image_height integer null,
  add column if not exists dominant_color text null;

create index if not exists clothing_items_background_removed_idx on public.clothing_items (background_removed);
create index if not exists clothing_items_dominant_color_idx on public.clothing_items (dominant_color);

