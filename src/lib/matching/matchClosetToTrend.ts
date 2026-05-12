import { ClothingItem, TrendCard } from "@/lib/types";
import { labelColorTag, labelOccasionTag, labelSeasonTag, labelStyleTag, labelKeyword } from "@/lib/labels";

function norm(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase();
}

function setOf(arr: string[] | null | undefined) {
  return new Set((arr ?? []).map((x) => norm(x)).filter(Boolean));
}

function scoreItemAgainstTrend(input: {
  item: ClothingItem;
  trend: TrendCard;
  kind: "top" | "bottom";
}): { score: number; reasons: string[] } {
  const itemStyle = setOf(input.item.style_tags);
  const itemOccasion = setOf(input.item.occasion_tags);
  const itemSeason = setOf(input.item.season_tags);
  const itemColor = norm(input.item.color);

  const trendStyle = setOf(input.trend.style_tags);
  const trendOccasion = setOf(input.trend.occasion_tags);
  const trendSeason = setOf(input.trend.season_tags);
  const trendColors = setOf(input.trend.color_tags);
  const kw = input.kind === "top" ? input.trend.top_keywords : input.trend.bottom_keywords;
  const trendKw = setOf(kw);

  let score = 0;
  const reasons: string[] = [];

  const styleOverlap = [...itemStyle].filter((t) => trendStyle.has(t));
  if (styleOverlap.length) {
    score += Math.min(0.35, 0.12 + 0.06 * styleOverlap.length);
    reasons.push(`风格匹配：${styleOverlap.slice(0, 2).map(labelStyleTag).join("、")}`);
  }

  if (itemColor && trendColors.has(itemColor)) {
    score += 0.25;
    reasons.push(`颜色匹配：${labelColorTag(itemColor)}`);
  }

  const occOverlap = [...itemOccasion].filter((t) => trendOccasion.has(t));
  if (occOverlap.length) {
    score += Math.min(0.2, 0.08 + 0.06 * occOverlap.length);
    reasons.push(`场景：${occOverlap.slice(0, 2).map(labelOccasionTag).join("、")}`);
  }

  const seasonOverlap = [...itemSeason].filter((t) => trendSeason.has(t));
  if (seasonOverlap.length) {
    score += Math.min(0.15, 0.05 + 0.05 * seasonOverlap.length);
    reasons.push(`季节：${seasonOverlap.slice(0, 2).map(labelSeasonTag).join("、")}`);
  }

  // keywords: lightweight fallback when user has no tags
  // We interpret item.name as a weak signal for matching keywords.
  const name = norm(input.item.name ?? "");
  const kwHit = [...trendKw].filter((k) => k && (name.includes(k) || (itemColor && k.includes(itemColor))));
  if (kwHit.length) {
    score += Math.min(0.12, 0.06 + 0.03 * kwHit.length);
    reasons.push(`关键词：${kwHit.slice(0, 2).map(labelKeyword).join("、")}`);
  }

  // baseline so we can still rank even with little metadata
  score += 0.08;
  score = Math.max(0.05, Math.min(0.98, score));

  return { score: Number(score.toFixed(2)), reasons };
}

export function matchClosetToTrend(input: {
  tops: ClothingItem[];
  bottoms: ClothingItem[];
  trendCard: TrendCard;
  limit?: number;
}): Array<{
  top: ClothingItem;
  bottom: ClothingItem;
  score: number;
  explanation: string;
}> {
  const limit = input.limit ?? 8;
  if (!input.tops.length || !input.bottoms.length) return [];

  const topScores = input.tops.map((t) => ({ item: t, ...scoreItemAgainstTrend({ item: t, trend: input.trendCard, kind: "top" }) }));
  const bottomScores = input.bottoms.map((b) => ({
    item: b,
    ...scoreItemAgainstTrend({ item: b, trend: input.trendCard, kind: "bottom" }),
  }));

  // take top-k for each side to keep combinations small
  topScores.sort((a, b) => b.score - a.score);
  bottomScores.sort((a, b) => b.score - a.score);
  const topK = topScores.slice(0, Math.min(10, topScores.length));
  const bottomK = bottomScores.slice(0, Math.min(10, bottomScores.length));

  const combos: Array<{ top: ClothingItem; bottom: ClothingItem; score: number; explanation: string }> = [];
  for (const t of topK) {
    for (const b of bottomK) {
      const s = Math.max(0.05, Math.min(0.98, Number(((t.score + b.score) / 2).toFixed(2))));
      const explanation = `趋势「${input.trendCard.trend_name}」：上装(${t.score}) ${t.reasons.join(" / ") || "基础匹配"}；下装(${b.score}) ${
        b.reasons.join(" / ") || "基础匹配"
      }。`;
      combos.push({ top: t.item, bottom: b.item, score: s, explanation });
    }
  }

  combos.sort((a, b) => b.score - a.score);
  return combos.slice(0, limit);
}

export function matchDressesToTrend(input: {
  dresses: ClothingItem[];
  trendCard: TrendCard;
  limit?: number;
}): Array<{ dress: ClothingItem; score: number; explanation: string }> {
  const limit = input.limit ?? 8;
  if (!input.dresses.length) return [];

  const scored = input.dresses.map((d) => ({
    dress: d,
    ...scoreItemAgainstTrend({ item: d, trend: input.trendCard, kind: "top" }),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => ({
    dress: s.dress,
    score: s.score,
    explanation: `趋势「${input.trendCard.trend_name}」：连体衣(${s.score}) ${s.reasons.join(" / ") || "基础匹配"}。`,
  }));
}
