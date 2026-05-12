import { ClothingItem } from "@/lib/types";
import { suggestOutfitCompatibility } from "@/lib/compatibility";

export type OutfitScene = "all" | "work" | "casual" | "party" | "sporty" | "streetwear" | "formal";

export type OutfitRecommendation = {
  top: ClothingItem;
  bottom: ClothingItem;
  score: number; // 0..1
  explanation: string;
};

function normalize(v: string | null) {
  return (v ?? "").trim().toLowerCase();
}

function hasTag(item: ClothingItem, tag: OutfitScene) {
  if (tag === "all") return true;
  return item.style_tags?.some((t) => normalize(t) === tag) ?? false;
}

function sceneBoost(scene: OutfitScene, top: ClothingItem, bottom: ClothingItem) {
  if (scene === "all") return { boost: 0, reason: "" };
  const topHas = hasTag(top, scene);
  const bottomHas = hasTag(bottom, scene);
  if (topHas && bottomHas) return { boost: 0.12, reason: `Both pieces fit ${scene}.` };
  if (topHas || bottomHas) return { boost: 0.07, reason: `One piece fits ${scene}.` };
  return { boost: -0.03, reason: "" };
}

function clamp01(v: number) {
  return Math.max(0.05, Math.min(0.98, v));
}

export function scoreOutfit(input: { scene: OutfitScene; top: ClothingItem; bottom: ClothingItem }): {
  score: number;
  explanation: string;
} {
  const base = suggestOutfitCompatibility({ top: input.top, bottom: input.bottom });
  const sb = sceneBoost(input.scene, input.top, input.bottom);
  const score = clamp01(base.score + sb.boost);
  const explanation = [base.explanation, sb.reason].filter(Boolean).join(" ");
  return { score: Number(score.toFixed(2)), explanation: explanation || "A simple everyday pairing." };
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 推荐一组“看起来就能穿”的搭配：
 * - 先打分
 * - 再做轻量去重：同一条下装不要出现太多次，避免结果全是牛仔裤
 */
export function recommendOutfits(input: { items: ClothingItem[]; scene: OutfitScene; limit?: number }): OutfitRecommendation[] {
  const limit = input.limit ?? 12;
  const tops = input.items.filter((i) => i.category === "top" || i.category === "outerwear");
  const bottoms = input.items.filter((i) => i.category === "bottom");
  if (!tops.length || !bottoms.length) return [];

  const candidates: OutfitRecommendation[] = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      const scored = scoreOutfit({ scene: input.scene, top, bottom });
      candidates.push({ top, bottom, score: scored.score, explanation: scored.explanation });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const picked: OutfitRecommendation[] = [];
  const bottomCounts = new Map<string, number>();

  // 先取高分，再做一点随机扰动，避免每次都完全相同
  const pool = shuffle(candidates.slice(0, Math.min(60, candidates.length)));
  pool.sort((a, b) => b.score - a.score);

  for (const c of pool) {
    const used = bottomCounts.get(c.bottom.id) ?? 0;
    if (used >= 2) continue;
    picked.push(c);
    bottomCounts.set(c.bottom.id, used + 1);
    if (picked.length >= limit) break;
  }

  return picked;
}

export function recommendForItem(input: {
  item: ClothingItem;
  memberItems: ClothingItem[];
  scene: OutfitScene;
  limit?: number;
}): OutfitRecommendation[] {
  const limit = input.limit ?? 6;

  const tops = input.memberItems.filter((i) => i.category === "top" || i.category === "outerwear");
  const bottoms = input.memberItems.filter((i) => i.category === "bottom");

  const candidates: OutfitRecommendation[] = [];
  if (input.item.category === "top" || input.item.category === "outerwear") {
    for (const bottom of bottoms) {
      const scored = scoreOutfit({ scene: input.scene, top: input.item, bottom });
      candidates.push({ top: input.item, bottom, score: scored.score, explanation: scored.explanation });
    }
  } else if (input.item.category === "bottom") {
    for (const top of tops) {
      const scored = scoreOutfit({ scene: input.scene, top, bottom: input.item });
      candidates.push({ top, bottom: input.item, score: scored.score, explanation: scored.explanation });
    }
  } else {
    return [];
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}

