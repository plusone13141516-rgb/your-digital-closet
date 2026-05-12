import { create } from "zustand";
import { ClothingAnalysis, ClothingItem, Household, HouseholdMember, SavedOutfit, SimilarProduct } from "@/lib/types";
import { uuidv4 } from "@/lib/uuid";
import { catalogImageUrl } from "@/lib/catalogImage";

const now = () => new Date().toISOString();

const seedUserId = "demo-user";
const seedHouseholdId = "demo-household";
const seedMemberId = "demo-member-me";

const seedHousehold: Household = {
  id: seedHouseholdId,
  owner_id: seedUserId,
  name: "My Closet",
  created_at: now(),
  updated_at: now(),
};

const seedMembers: HouseholdMember[] = [
  {
    id: seedMemberId,
    household_id: seedHouseholdId,
    name: "Me",
    age_group: null,
    created_at: now(),
    updated_at: now(),
  },
];

// Demo seed: keep only Tops + Bottoms for the new direction
const seedItems: ClothingItem[] = [
  {
    id: "demo-mom-top-1",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "奶油黄针织上衣",
    category: "Tops",
    color: "butter yellow",
    dominant_color: "yellow",
    season: "spring",
    style_tags: ["casual"],
    occasion_tags: ["weekend"],
    season_tags: ["spring"],
    image_url: catalogImageUrl({ title: "奶油黄针织上衣", category: "top", color: "butter yellow", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "奶油黄针织上衣", category: "top", color: "butter yellow", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: false,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-mom-top-2",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "白色挺括衬衫",
    category: "Tops",
    color: "white",
    dominant_color: "white",
    season: "all-season",
    style_tags: ["work", "formal"],
    occasion_tags: ["work"],
    season_tags: ["all-season"],
    image_url: catalogImageUrl({ title: "白色挺括衬衫", category: "top", color: "white", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "白色挺括衬衫", category: "top", color: "white", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: false,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-mom-outerwear-1",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "藏青修身西装外套",
    category: "Tops",
    color: "navy",
    dominant_color: "navy",
    season: "fall",
    style_tags: ["work", "formal"],
    occasion_tags: ["work"],
    season_tags: ["fall"],
    image_url: catalogImageUrl({ title: "藏青修身西装外套", category: "outerwear", color: "navy", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "藏青修身西装外套", category: "outerwear", color: "navy", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: true,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-mom-bottom-1",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "浅蓝牛仔裤",
    category: "Bottoms",
    color: "light blue",
    dominant_color: "blue",
    season: "all-season",
    style_tags: ["casual", "streetwear"],
    occasion_tags: ["weekend"],
    season_tags: ["all-season"],
    image_url: catalogImageUrl({ title: "浅蓝牛仔裤", category: "bottom", color: "light blue", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "浅蓝牛仔裤", category: "bottom", color: "light blue", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: true,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-mom-bottom-2",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "米色中长裙",
    category: "Bottoms",
    color: "beige",
    dominant_color: "beige",
    season: "spring",
    style_tags: ["work", "formal"],
    occasion_tags: ["work"],
    season_tags: ["spring"],
    image_url: catalogImageUrl({ title: "米色中长裙", category: "bottom", color: "beige", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "米色中长裙", category: "bottom", color: "beige", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: false,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-me-top-3",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "奶油色卫衣",
    category: "Tops",
    color: "cream",
    dominant_color: "cream",
    season: "fall",
    style_tags: ["sporty", "casual"],
    occasion_tags: ["weekend"],
    season_tags: ["fall"],
    image_url: catalogImageUrl({ title: "奶油色卫衣", category: "outerwear", color: "cream", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "奶油色卫衣", category: "outerwear", color: "cream", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: false,
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "demo-me-bottom-3",
    user_id: seedUserId,
    household_id: seedHouseholdId,
    member_id: seedMemberId,
    name: "灰色运动裤",
    category: "Bottoms",
    color: "gray",
    dominant_color: "gray",
    season: "winter",
    style_tags: ["sporty", "casual"],
    occasion_tags: ["sport", "weekend"],
    season_tags: ["winter"],
    image_url: catalogImageUrl({ title: "灰色运动裤", category: "bottom", color: "gray", pattern: "solid" }),
    image_path: catalogImageUrl({ title: "灰色运动裤", category: "bottom", color: "gray", pattern: "solid" }),
    original_image_path: null,
    processed_image_path: null,
    original_image_url: null,
    cutout_image_url: null,
    background_removed: false,
    image_width: null,
    image_height: null,
    notes: null,
    is_favorite: false,
    created_at: now(),
    updated_at: now(),
  },
];

const seedAnalyses: ClothingAnalysis[] = seedItems.map((item) => ({
  id: `demo-analysis-${item.id}`,
  clothing_item_id: item.id,
  category: item.category,
  dominant_color: item.color,
  pattern: "solid",
  style_tags: item.style_tags,
  ai_description: `${item.color ?? "neutral"} ${item.category} with a ${item.style_tags?.[0] ?? "clean"} feel.`,
  confidence_score: 0.68,
  created_at: item.created_at,
  updated_at: item.updated_at,
}));

const seedSimilarProducts: SimilarProduct[] = seedItems.flatMap((item) => {
  const base = `demo-similar-${item.id}`;
  const label =
    item.category === "bottom"
      ? "Bottom"
      : item.category === "top"
        ? "Top"
        : item.category === "outerwear"
          ? "Outerwear"
          : item.category === "dress"
            ? "Dress"
            : item.category === "shoes"
              ? "Shoes"
              : "Accessory";
  return [
    {
      id: `${base}-1`,
      clothing_item_id: item.id,
      product_title: `${item.color ?? "Neutral"} ${label} (Mock)`,
      product_image_url: catalogImageUrl({
        title: `${item.color ?? "Neutral"} ${label} (Mock)`,
        category: (item.category as any) ?? "top",
        color: item.color ?? "cream",
        pattern: "solid",
      }),
      category: item.category,
      similarity_score: 0.86,
      is_favorite: false,
      source: "mock",
      metadata: {},
      created_at: now(),
      updated_at: now(),
    },
    {
      id: `${base}-2`,
      clothing_item_id: item.id,
      product_title: `Alternative ${label} (Mock)`,
      product_image_url: catalogImageUrl({
        title: `Alternative ${label} (Mock)`,
        category: (item.category as any) ?? "top",
        color: "cream",
        pattern: "solid",
      }),
      category: item.category,
      similarity_score: 0.74,
      is_favorite: false,
      source: "mock",
      metadata: {},
      created_at: now(),
      updated_at: now(),
    },
  ];
});

type DemoClosetState = {
  household: Household;
  members: HouseholdMember[];
  selectedMemberId: string;
  items: ClothingItem[];
  analyses: ClothingAnalysis[];
  similarProducts: SimilarProduct[];
  outfits: SavedOutfit[];
  hydrate: () => void;
  selectMember: (memberId: string) => void;
  upsertMember: (member: HouseholdMember) => void;
  deleteMember: (memberId: string) => void;
  upsertItem: (item: ClothingItem) => void;
  upsertAnalysis: (analysis: ClothingAnalysis) => void;
  replaceSimilarProducts: (clothingItemId: string, products: SimilarProduct[]) => void;
  deleteItem: (id: string) => void;
  toggleItemFavorite: (itemId: string) => void;
  toggleSimilarFavorite: (productId: string) => void;
  saveFavorite: (input: Omit<SavedOutfit, "id" | "created_at" | "updated_at">) => SavedOutfit;
  removeFavorite: (outfitId: string) => void;
};

const storageKey = "digital-closet-demo";

export const useDemoClosetStore = create<DemoClosetState>((set, get) => ({
  household: seedHousehold,
  members: seedMembers,
  selectedMemberId: seedMemberId,
  items: seedItems,
  analyses: seedAnalyses,
  similarProducts: seedSimilarProducts,
  outfits: [],
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<DemoClosetState>;
      const isBlobUrl = (v: unknown) => typeof v === "string" && v.startsWith("blob:");
      const safeItems =
        parsed.items && parsed.items.length
          ? parsed.items.filter(
              (i) =>
                !isBlobUrl((i as any).image_path) &&
                !isBlobUrl((i as any).processed_image_path) &&
                !isBlobUrl((i as any).original_image_url) &&
                !isBlobUrl((i as any).cutout_image_url),
            )
          : null;
      set({
        household: parsed.household ?? seedHousehold,
        members: parsed.members && parsed.members.length ? parsed.members : seedMembers,
        selectedMemberId: parsed.selectedMemberId ?? seedMemberId,
        // 旧版本曾把 blob: URL 存进 localStorage（刷新会失效）。这里自动清理，避免页面图片报错。
        items: safeItems && safeItems.length ? safeItems : seedItems,
        analyses: parsed.analyses && parsed.analyses.length ? parsed.analyses : seedAnalyses,
        similarProducts: parsed.similarProducts && parsed.similarProducts.length ? parsed.similarProducts : seedSimilarProducts,
        outfits: parsed.outfits ?? [],
      });
    } catch {}
  },
  selectMember: (memberId) => {
    set({ selectedMemberId: memberId });
    if (typeof window !== "undefined") {
      const state = get();
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  },
  upsertMember: (member) => {
    const next = [...get().members];
    const idx = next.findIndex((m) => m.id === member.id);
    if (idx >= 0) next[idx] = member;
    else next.push(member);
    set({ members: next });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  deleteMember: (memberId) => {
    const members = get().members.filter((m) => m.id !== memberId);
    const items = get().items.filter((i) => i.member_id !== memberId);
    const analyses = get().analyses.filter((a) => items.some((i) => i.id === a.clothing_item_id));
    const similarProducts = get().similarProducts.filter((p) => items.some((i) => i.id === p.clothing_item_id));
    const outfits = get().outfits.filter((o) => o.member_id !== memberId);
    const selectedMemberId = get().selectedMemberId === memberId ? (members[0]?.id ?? "") : get().selectedMemberId;
    set({ members, items, analyses, similarProducts, outfits, selectedMemberId });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  upsertItem: (item) => {
    const next = [...get().items];
    const idx = next.findIndex((i) => i.id === item.id);
    if (idx >= 0) next[idx] = item;
    else next.unshift(item);
    set({ items: next });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  upsertAnalysis: (analysis) => {
    const next = [...get().analyses];
    const idx = next.findIndex((a) => a.clothing_item_id === analysis.clothing_item_id);
    if (idx >= 0) next[idx] = analysis;
    else next.unshift(analysis);
    set({ analyses: next });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  replaceSimilarProducts: (clothingItemId, products) => {
    const remaining = get().similarProducts.filter((p) => p.clothing_item_id !== clothingItemId);
    set({ similarProducts: [...products, ...remaining] });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  deleteItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    const analyses = get().analyses.filter((a) => a.clothing_item_id !== id);
    const similarProducts = get().similarProducts.filter((p) => p.clothing_item_id !== id);
    const outfits = get().outfits.filter((o) => o.top_item_id !== id && o.bottom_item_id !== id);
    set({ items, analyses, similarProducts, outfits });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  toggleItemFavorite: (itemId) => {
    const items = get().items.map((i) => (i.id === itemId ? { ...i, is_favorite: !i.is_favorite } : i));
    set({ items });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  toggleSimilarFavorite: (productId) => {
    const similarProducts = get().similarProducts.map((p) =>
      p.id === productId ? { ...p, is_favorite: !p.is_favorite } : p,
    );
    set({ similarProducts });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
  saveFavorite: (input) => {
    const existing = get().outfits.find(
      (o) => o.member_id === input.member_id && o.top_item_id === input.top_item_id && o.bottom_item_id === input.bottom_item_id,
    );
    if (existing) return existing;
    const outfit: SavedOutfit = {
      ...input,
      id: `demo-outfit-${uuidv4()}`,
      created_at: now(),
      updated_at: now(),
    };
    const outfits = [outfit, ...get().outfits];
    set({ outfits });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
    return outfit;
  },
  removeFavorite: (outfitId) => {
    const outfits = get().outfits.filter((o) => o.id !== outfitId);
    set({ outfits });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(get()));
    }
  },
}));
