import { ClothingItem } from "@/lib/types";

function normalize(v: string | null) {
  return (v ?? "").trim().toLowerCase();
}

function colorFamily(color: string | null) {
  const c = normalize(color);
  if (!c) return "unknown";
  if (["black", "white", "cream", "beige", "gray", "brown"].some((x) => c.includes(x))) return "neutral";
  if (["red", "pink", "orange", "yellow"].some((x) => c.includes(x))) return "warm";
  if (["blue", "navy", "green"].some((x) => c.includes(x))) return "cool";
  return "other";
}

export function suggestOutfitCompatibility(input: { top: ClothingItem; bottom: ClothingItem }): {
  score: number;
  explanation: string;
} {
  const topFamily = colorFamily(input.top.color);
  const bottomFamily = colorFamily(input.bottom.color);
  const overlap = input.top.style_tags.filter((t) => input.bottom.style_tags.includes(t));

  let score = 0.55;
  const reasons: string[] = [];

  if (topFamily === "neutral" || bottomFamily === "neutral") {
    score += 0.18;
    reasons.push("Neutrals keep the outfit easy to balance.");
  } else if (topFamily === bottomFamily && topFamily !== "unknown") {
    score += 0.12;
    reasons.push("Similar color temperature feels cohesive.");
  } else if (topFamily !== "unknown" && bottomFamily !== "unknown") {
    score += 0.06;
    reasons.push("Warm + cool contrast can look intentional when kept simple.");
  }

  if (overlap.length) {
    score += 0.1;
    reasons.push(`Both pieces share ${overlap.slice(0, 2).join(", ")} style.`);
  }

  if (normalize(input.top.color) === normalize(input.bottom.color) && normalize(input.top.color)) {
    score += 0.08;
    reasons.push("Monochrome outfits look clean and put-together.");
  }

  score = Math.max(0.05, Math.min(0.98, score));

  return { score: Number(score.toFixed(2)), explanation: reasons.join(" ") || "A simple everyday pairing." };
}
