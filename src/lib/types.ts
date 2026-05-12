// Product direction update: personal closet only stores Tops + Bottoms.
// We keep legacy values for backwards compatibility with older pages/components.
export type ClothingCategory =
  | "Tops"
  | "Bottoms"
  | "Skirts"
  | "Outerwear"
  | "Dresses"
  | "Shoes"
  | "Accessories"
  | "top"
  | "bottom"
  | "outerwear"
  | "dress"
  | "shoes"
  | "accessories";

export type AgeGroup = "kid" | "teen" | "adult";

export type Pattern = "solid" | "striped" | "plaid" | "floral" | "graphic" | "other";

export type StyleTag =
  | "casual"
  | "formal"
  | "sporty"
  | "streetwear"
  | "work"
  | "party";

export type OccasionTag = "work" | "weekend" | "date" | "party" | "travel" | "sport";
export type SeasonTag = "spring" | "summer" | "fall" | "winter" | "all-season";

export type Household = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type HouseholdMember = {
  id: string;
  household_id: string;
  name: string;
  age_group: AgeGroup | null;
  created_at: string;
  updated_at: string;
};

export type ClothingItem = {
  id: string;
  user_id: string;
  member_id: string;
  // optional display name
  name: string | null;
  category: ClothingCategory;
  color: string | null;
  style_tags: string[];
  occasion_tags: string[];
  season_tags: string[];
  // Storage path or remote URL for the already-cutout image (PNG/WebP with alpha)
  image_url: string;
  // Legacy/compat fields kept to avoid breaking existing UI; new direction can ignore them.
  household_id?: string | null;
  image_path?: string;
  original_image_path?: string | null;
  processed_image_path?: string | null;
  cutout_image_url?: string | null;
  original_image_url?: string | null;
  background_removed?: boolean;
  dominant_color?: string | null;
  season?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  notes?: string | null;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
};

export type TrendCard = {
  id: string;
  trend_name: string;
  source_name: string | null;
  source_url: string | null;
  published_date: string | null; // YYYY-MM-DD
  summary: string;
  style_tags: string[];
  color_tags: string[];
  top_keywords: string[];
  bottom_keywords: string[];
  occasion_tags: string[];
  season_tags: string[];
  created_at: string;
};

export type Outfit = {
  id: string;
  user_id: string;
  member_id: string;
  top_item_id: string | null;
  bottom_item_id: string | null;
  dress_item_id: string | null;
  shoe_item_id: string | null;
  trend_card_id: string | null;
  name: string;
  style_tags: string[];
  occasion_tags: string[];
  is_favorite: boolean;
  created_at: string;
};

// Legacy types (kept for compatibility with older demo components; not used in new direction)
export type ClothingAnalysis = any;
export type SimilarProduct = any;
export type SavedOutfit = any;
