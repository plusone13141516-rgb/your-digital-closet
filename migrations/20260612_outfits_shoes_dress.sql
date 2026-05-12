-- Add optional shoes and single-piece dresses to outfits
-- Supports:
-- 1) top_item_id + bottom_item_id (+ shoe_item_id)
-- 2) dress_item_id (+ shoe_item_id)

alter table public.outfits
  add column if not exists shoe_item_id uuid null references public.clothing_items (id) on delete set null,
  add column if not exists dress_item_id uuid null references public.clothing_items (id) on delete set null;

-- allow dress-only outfits
alter table public.outfits alter column top_item_id drop not null;
alter table public.outfits alter column bottom_item_id drop not null;

-- ensure at least one valid shape exists
alter table public.outfits drop constraint if exists outfits_shape_check;
alter table public.outfits
  add constraint outfits_shape_check check (
    (dress_item_id is not null and top_item_id is null and bottom_item_id is null)
    or
    (dress_item_id is null and top_item_id is not null and bottom_item_id is not null)
  );

-- unique constraints for upsert
alter table public.outfits drop constraint if exists outfits_unique_member_combo_idx;
alter table public.outfits drop constraint if exists outfits_unique_member_combo;
alter table public.outfits
  add constraint outfits_unique_member_combo unique (user_id, member_id, top_item_id, bottom_item_id);

alter table public.outfits drop constraint if exists outfits_unique_member_dress;
alter table public.outfits
  add constraint outfits_unique_member_dress unique (user_id, member_id, dress_item_id);

