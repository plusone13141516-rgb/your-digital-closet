import { ClothingAnalysis, SimilarProduct } from "@/lib/types";
import { mockCatalog } from "@/lib/mockCatalog";

function normalizeColor(value: string | null) {
  return (value ?? "").trim().toLowerCase();
}

export function findSimilarProducts(input: {
  analysis: Pick<ClothingAnalysis, "category" | "dominant_color" | "pattern" | "style_tags">;
  limit?: number;
}): Omit<SimilarProduct, "id" | "clothing_item_id" | "created_at" | "updated_at">[] {
  const limit = input.limit ?? 6;
  const color = normalizeColor(input.analysis.dominant_color);
  const tags = new Set((input.analysis.style_tags ?? []).map((t: string) => t.toLowerCase()));
  const pattern = (input.analysis.pattern ?? "").toString().toLowerCase();

  const scored = mockCatalog.map((p) => {
    const categoryScore = p.category === input.analysis.category ? 1 : 0;
    const colorScore = color && p.color.toLowerCase() === color ? 1 : color ? 0 : 0.4;
    const patternScore = pattern && p.pattern.toLowerCase() === pattern ? 1 : pattern ? 0 : 0.4;
    const overlap = p.style_tags.reduce((acc, t) => acc + (tags.has(t.toLowerCase()) ? 1 : 0), 0);
    const tagScore = p.style_tags.length ? overlap / p.style_tags.length : 0;
    const score = 0.45 * categoryScore + 0.3 * colorScore + 0.15 * tagScore + 0.1 * patternScore;
    return { p, score: Number(score.toFixed(3)) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p, score }) => ({
      product_title: p.title,
      product_image_url: p.image_url,
      category: p.category,
      similarity_score: score,
      is_favorite: false,
      source: "mock",
      metadata: { catalog_id: p.id, color: p.color, pattern: p.pattern, style_tags: p.style_tags },
    }));
}
