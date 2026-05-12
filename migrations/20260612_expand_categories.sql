-- Expand allowed clothing categories (still no body photos / no try-on / no auto background removal)
-- This enables users to store shoes/accessories/skirts etc. Matching still uses Tops + Bottoms (and Skirts as bottoms).

alter table public.clothing_items drop constraint if exists clothing_items_category_check_v2;
alter table public.clothing_items drop constraint if exists clothing_items_category_check;

alter table public.clothing_items
  add constraint clothing_items_category_check_v3 check (category in ('Tops', 'Bottoms', 'Skirts', 'Outerwear', 'Dresses', 'Shoes', 'Accessories'));

