# Digital Closet (Household MVP)

Mobile-first, privacy-first household wardrobe:
- One account → multiple household members (e.g., Mother + Son)
- Each member has their own closet, uploads, classification, similar-item matches, and outfit suggestions
- Upload clothing items only (no face/body uploads)
- Simple on-device crop + lightweight analysis (category, dominant color, pattern, tags, short description, confidence)
- Similar item search against a mock catalog (future-ready for embedding/vector search)
- Lightweight top + bottom outfit compatibility (rule-based)

## 1) Local Setup

### Prerequisites
- Node.js 20+
- npm (or pnpm/yarn if you prefer)

### Install & run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## 2) Demo Mode (No Backend)

If Supabase env vars are not set, the app runs in demo mode:
- Uses a seeded household with two members (Mother + Son)
- Uses seeded mock clothing items + mock similar products
- Stores new uploads and favorites in localStorage

## Docs
- MVP spec (中文): `docs/mvp.zh.md`

## Vendor research repos (Git submodules)
This project vendors the following GitHub repositories as **git submodules** for future online capabilities (embedding search / preprocessing).
They are **NOT used at runtime** in this MVP Next.js app (to keep the web app lightweight).

Submodules live in `vendor/`:
- `vendor/deepfashion2` (DeepFashion2)
- `vendor/polyvore-dataset` (Polyvore Dataset)
- `vendor/AiDLab-fAshIon-Data` (AiDLab-fAshIon-Data)
- `vendor/opentryon` (OpenTryOn)

If you cloned without submodules:
```bash
git submodule update --init --recursive
```

## 3) Supabase Setup (Auth + DB + Storage)

### 3.1 Create a Supabase project
1. Create a new Supabase project
2. Enable Email auth (Authentication → Providers → Email)
3. For the smoothest MVP flow, disable “Confirm email” (optional)

### 3.2 Apply SQL schema + RLS
Run the SQL in:
- `migrations/20260421_init.sql`
- `migrations/20260511_household.sql`

### 3.3 Create Storage bucket
Create a private bucket named:
- `clothing-images`

### 3.4 Storage policies (recommended)
In Supabase SQL editor, run:
```sql
create policy "clothing_images_read_own" on storage.objects
for select using (
  bucket_id = 'clothing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "clothing_images_insert_own" on storage.objects
for insert with check (
  bucket_id = 'clothing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "clothing_images_update_own" on storage.objects
for update using (
  bucket_id = 'clothing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "clothing_images_delete_own" on storage.objects
for delete using (
  bucket_id = 'clothing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3.5 Environment variables
Create `./.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Restart `npm run dev`.

## 4) App Pages
- `/` Landing
- `/auth` Log in / Sign up
- `/household` Household dashboard (create/edit/delete members, switch closets)
- `/closet` Member closet (uses the selected household member)
- `/upload` Upload clothing
- `/similar` Similar item search (re-run matches per uploaded item, browse mock catalog)
- `/outfits` Outfit Suggestions (top + bottom compatibility)
- `/favorites` Favorites (items, matches, outfits)
- `/profile` Profile (username + email, sign out)
