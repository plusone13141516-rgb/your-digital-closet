import { SimilarProduct, StyleTag } from "@/lib/types";

const styleLabel: Record<StyleTag, string> = {
  casual: "休闲",
  work: "通勤",
  formal: "正式",
  party: "约会/聚会",
  sporty: "运动",
  streetwear: "街头",
};

export function inferStyleFromSimilar(similar: Array<Pick<SimilarProduct, "metadata">>): {
  mainStyle: string;
  keywords: string[];
} {
  const counts = new Map<string, number>();

  for (const s of similar) {
    const tags = (s.metadata as any)?.style_tags as string[] | undefined;
    if (!tags?.length) continue;
    for (const t of tags) {
      const key = t.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k) as StyleTag[];

  const main = ranked[0] ?? "casual";
  const keywords = ranked.slice(0, 3).map((t) => styleLabel[t] ?? t);

  while (keywords.length < 3) {
    const fallback = ["简约", "好搭", "日常"];
    for (const f of fallback) {
      if (!keywords.includes(f)) keywords.push(f);
      if (keywords.length >= 3) break;
    }
  }

  return { mainStyle: styleLabel[main] ?? "休闲", keywords: keywords.slice(0, 3) };
}

