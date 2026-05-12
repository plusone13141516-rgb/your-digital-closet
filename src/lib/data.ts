import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ClothingCategory, ClothingItem, Outfit } from "@/lib/types";
import { uuidv4 } from "@/lib/uuid";
import { useDemoClosetStore } from "@/stores/demoClosetStore";

const bucket = "clothing-images";

const isRemoteUrl = (value: string) => value.startsWith("http://") || value.startsWith("https://");
const isDataUrl = (value: string) => value.startsWith("data:");

type SignedUrlCacheEntry = { url: string; expiresAt: number };
const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败，请重试。"));
    reader.readAsDataURL(file);
  });
}

export async function getClothingImageUrl(userId: string, imagePath: string): Promise<string> {
  if (!isSupabaseConfigured() || isRemoteUrl(imagePath) || isDataUrl(imagePath)) return imagePath;

  const cached = signedUrlCache.get(imagePath);
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.url;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(imagePath, 60 * 60);
  if (error) throw new Error(error.message);
  signedUrlCache.set(imagePath, { url: data.signedUrl, expiresAt: Date.now() + 55 * 60 * 1000 });
  return data.signedUrl;
}

export async function listClothingItems(input: { userId: string; memberId: string }): Promise<ClothingItem[]> {
  if (!isSupabaseConfigured()) {
    return useDemoClosetStore
      .getState()
      .items.filter((i) => i.user_id === input.userId && i.member_id === input.memberId);
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", input.userId)
    .eq("member_id", input.memberId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ClothingItem[];
}

export async function getClothingItemById(input: { userId: string; itemId: string }): Promise<ClothingItem | null> {
  if (!isSupabaseConfigured()) {
    return useDemoClosetStore.getState().items.find((i) => i.user_id === input.userId && i.id === input.itemId) ?? null;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", input.userId)
    .eq("id", input.itemId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ClothingItem) ?? null;
}

async function uploadToStorageV2(input: {
  userId: string;
  itemId: string;
  kind: "image" | "thumb_256" | "thumb_512";
  file: File;
}) {
  const supabase = getSupabaseBrowserClient();
  const ext = (input.file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${input.userId}/${input.itemId}/${input.kind}.${ext}`;
  const upload = await supabase.storage.from(bucket).upload(path, input.file, {
    upsert: true,
    contentType: input.file.type || undefined,
  });
  if (upload.error) throw new Error(upload.error.message);
  return path;
}

export async function createClothingItem(input: {
  userId: string;
  memberId: string;
  category: ClothingCategory; // expected: "Tops" | "Bottoms"
  imageFile: File; // already-cutout PNG/WebP (with alpha)
  name?: string | null;
  color?: string | null;
  styleTags?: string[];
  occasionTags?: string[];
  seasonTags?: string[];
  thumb256File?: File | null;
  thumb512File?: File | null;
}): Promise<ClothingItem> {
  if (!isSupabaseConfigured()) {
    const id = `demo-item-${uuidv4()}`;
    const now = new Date().toISOString();
    const imageUrl = await fileToDataUrl(input.imageFile);
    const item: ClothingItem = {
      id,
      user_id: input.userId,
      member_id: input.memberId,
      name: input.name ?? null,
      category: input.category,
      image_url: imageUrl,
      color: input.color ?? null,
      style_tags: input.styleTags ?? [],
      occasion_tags: input.occasionTags ?? [],
      season_tags: input.seasonTags ?? [],
      created_at: now,
      updated_at: now,
      // legacy field for existing card components
      image_path: imageUrl,
    };
    useDemoClosetStore.getState().upsertItem(item);
    return item;
  }

  const supabase = getSupabaseBrowserClient();
  const id = uuidv4();

  const imagePath = await uploadToStorageV2({ userId: input.userId, itemId: id, kind: "image", file: input.imageFile });
  const [thumb256Path, thumb512Path] = await Promise.all([
    input.thumb256File ? uploadToStorageV2({ userId: input.userId, itemId: id, kind: "thumb_256", file: input.thumb256File }) : null,
    input.thumb512File ? uploadToStorageV2({ userId: input.userId, itemId: id, kind: "thumb_512", file: input.thumb512File }) : null,
  ]);

  const payload: Record<string, unknown> = {
    id,
    user_id: input.userId,
    member_id: input.memberId,
    category: input.category,
    name: input.name ?? null,
    image_url: imagePath,
    color: input.color ?? null,
    style_tags: input.styleTags ?? [],
    occasion_tags: input.occasionTags ?? [],
    season_tags: input.seasonTags ?? [],
    // legacy column to keep old UI fast if it still reads image_path
    image_path: thumb512Path ?? imagePath,
  };

  // (Optional) If you later add explicit thumb columns, you can store them here.

  const { data: item, error } = await supabase.from("clothing_items").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return item as ClothingItem;
}

export async function updateClothingItem(input: {
  userId: string;
  itemId: string;
  patch: Partial<
    Pick<
      ClothingItem,
      "name" | "category" | "color" | "style_tags" | "occasion_tags" | "season_tags"
    >
  >;
}): Promise<ClothingItem> {
  if (!isSupabaseConfigured()) {
    const current = useDemoClosetStore.getState().items.find((i) => i.id === input.itemId);
    if (!current) throw new Error("Item not found.");
    const next: ClothingItem = { ...current, ...input.patch, updated_at: new Date().toISOString() } as ClothingItem;
    useDemoClosetStore.getState().upsertItem(next);
    return next;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("clothing_items")
    .update({ ...input.patch, updated_at: new Date().toISOString() })
    .eq("id", input.itemId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ClothingItem;
}

// Deprecated analysis APIs (previous MVP). Kept as safe stubs.
export async function getClothingAnalysis(): Promise<null> {
  return null;
}
export async function upsertClothingAnalysis(): Promise<void> {}

// Deprecated similar-product APIs (previous MVP). Kept as safe stubs.
export async function listSimilarProducts(_input?: any): Promise<any[]> {
  return [];
}

export async function replaceSimilarProducts(): Promise<void> {}
export async function listFavoriteSimilarProducts(): Promise<any[]> {
  return [];
}
export async function toggleSimilarProductFavorite(): Promise<void> {}

export async function deleteClothingItem(input: { userId: string; item: ClothingItem }): Promise<void> {
  if (!isSupabaseConfigured()) {
    useDemoClosetStore.getState().deleteItem(input.item.id);
    return;
  }

  const supabase = getSupabaseBrowserClient();
  const toDelete = [
    input.item.image_url,
    input.item.image_path,
  ]
    .filter(Boolean)
    .filter((p) => typeof p === "string" && !isRemoteUrl(p) && !isDataUrl(p)) as string[];

  // 兜底：即使没有显式保存字段，也尝试清理缩略图
  if (input.item.user_id && input.item.id) {
    toDelete.push(`${input.item.user_id}/${input.item.id}/image.webp`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/image.png`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/image.jpg`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/thumb_256.webp`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/thumb_512.webp`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/thumb_256.jpg`);
    toDelete.push(`${input.item.user_id}/${input.item.id}/thumb_512.jpg`);
  }
  if (toDelete.length) await supabase.storage.from(bucket).remove(toDelete);
  const { error } = await supabase.from("clothing_items").delete().eq("id", input.item.id).eq("user_id", input.userId);
  if (error) throw new Error(error.message);
}

export async function listOutfits(input: { userId: string; memberId: string }): Promise<Outfit[]> {
  if (!isSupabaseConfigured()) {
    return (useDemoClosetStore.getState().outfits as any[]).filter((o) => o.user_id === input.userId && o.member_id === input.memberId) as Outfit[];
  }
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", input.userId)
    .eq("member_id", input.memberId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Outfit[];
}

export async function saveOutfit(input: Omit<Outfit, "id" | "created_at">): Promise<Outfit> {
  if (!isSupabaseConfigured()) {
    const id = `demo-outfit-${uuidv4()}`;
    const created: Outfit = { ...input, id, created_at: new Date().toISOString() };
    (useDemoClosetStore.getState() as any).saveFavorite?.(created);
    return created;
  }
  const supabase = getSupabaseBrowserClient();
  const onConflict =
    input.dress_item_id ? "user_id,member_id,dress_item_id" : "user_id,member_id,top_item_id,bottom_item_id";
  const { data, error } = await supabase
    .from("outfits")
    .upsert(input, { onConflict })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Outfit;
}

export async function removeOutfit(input: { userId: string; outfitId: string }): Promise<void> {
  if (!isSupabaseConfigured()) {
    (useDemoClosetStore.getState() as any).removeFavorite?.(input.outfitId);
    return;
  }
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("outfits").delete().eq("id", input.outfitId).eq("user_id", input.userId);
  if (error) throw new Error(error.message);
}
