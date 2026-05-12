import { ClothingCategory, Pattern, StyleTag } from "@/lib/types";

type RGB = { r: number; g: number; b: number };

const palette: Array<{ name: string; rgb: RGB }> = [
  { name: "black", rgb: { r: 25, g: 25, b: 28 } },
  { name: "white", rgb: { r: 244, g: 244, b: 242 } },
  { name: "cream", rgb: { r: 245, g: 236, b: 220 } },
  { name: "beige", rgb: { r: 223, g: 206, b: 178 } },
  { name: "brown", rgb: { r: 123, g: 90, b: 63 } },
  { name: "navy", rgb: { r: 32, g: 51, b: 86 } },
  { name: "blue", rgb: { r: 74, g: 120, b: 186 } },
  { name: "green", rgb: { r: 78, g: 128, b: 92 } },
  { name: "red", rgb: { r: 178, g: 72, b: 68 } },
  { name: "pink", rgb: { r: 214, g: 125, b: 156 } },
  { name: "yellow", rgb: { r: 230, g: 190, b: 92 } },
  { name: "orange", rgb: { r: 215, g: 140, b: 70 } },
  { name: "gray", rgb: { r: 142, g: 142, b: 146 } },
];

function dist(a: RGB, b: RGB) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function luminance(p: RGB) {
  return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
}

function inferPattern(stats: { stdev: number }): Pattern {
  if (stats.stdev < 18) return "solid";
  if (stats.stdev > 70) return "graphic";
  return "other";
}

function inferStyleTags(input: { category: ClothingCategory; pattern: Pattern; colorName: string }): StyleTag[] {
  const tags = new Set<StyleTag>();
  if (input.category === "shoes") tags.add("sporty");
  if (input.category === "outerwear") tags.add("work");
  if (input.pattern === "graphic") tags.add("streetwear");
  if (["black", "navy", "white", "cream"].includes(input.colorName)) tags.add("work");
  if (tags.size === 0) tags.add("casual");
  return Array.from(tags);
}

export async function analyzeGarment(input: {
  file: Blob;
  filenameHint?: string;
  categoryHint: ClothingCategory;
}): Promise<{
  category: ClothingCategory;
  dominantColor: string;
  pattern: Pattern;
  styleTags: StyleTag[];
  description: string;
  confidenceScore: number;
}> {
  const bitmap = await createImageBitmap(input.file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  const max = 160;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
  canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const lum: number[] = [];

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 240) continue;
    const pr = pixels[i];
    const pg = pixels[i + 1];
    const pb = pixels[i + 2];
    r += pr;
    g += pg;
    b += pb;
    count += 1;
    lum.push(luminance({ r: pr, g: pg, b: pb }));
  }

  if (count === 0) {
    return {
      category: input.categoryHint,
      dominantColor: "unknown",
      pattern: "other",
      styleTags: inferStyleTags({ category: input.categoryHint, pattern: "other", colorName: "unknown" }),
      description: "A clothing item with a clean look, ready to be organized.",
      confidenceScore: 0.35,
    };
  }

  const avg: RGB = { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };

  let best = palette[0];
  let bestD = dist(avg, palette[0].rgb);
  for (const candidate of palette.slice(1)) {
    const d = dist(avg, candidate.rgb);
    if (d < bestD) {
      bestD = d;
      best = candidate;
    }
  }

  const meanLum = lum.reduce((acc, v) => acc + v, 0) / lum.length;
  const variance = lum.reduce((acc, v) => acc + (v - meanLum) * (v - meanLum), 0) / lum.length;
  const stdev = Math.sqrt(variance);

  const pattern = inferPattern({ stdev });
  const styleTags = inferStyleTags({ category: input.categoryHint, pattern, colorName: best.name });

  const confidenceScore = Math.max(0.35, Math.min(0.92, 0.55 + (pattern === "solid" ? 0.1 : 0) + Math.min(0.2, count / 8000)));

  const description = `${best.name} ${input.categoryHint}, ${pattern === "solid" ? "solid" : "patterned"}, ${styleTags.join(
    ", ",
  )} vibe.`;

  return {
    category: input.categoryHint,
    dominantColor: best.name,
    pattern,
    styleTags,
    description,
    confidenceScore: Number(confidenceScore.toFixed(2)),
  };
}

function inferCategoryFromFilename(filenameHint?: string): "Tops" | "Bottoms" | "Dresses" {
  const name = (filenameHint ?? "").toLowerCase();
  const dressKw = ["dress", "jumpsuit", "romper", "连体", "裙", "连衣"];
  const bottomKw = ["pants", "pant", "jeans", "jean", "trouser", "trousers", "skirt", "short", "shorts", "bottom"];
  const topKw = ["shirt", "tee", "t-shirt", "tank", "top", "hoodie", "sweater", "knit", "jacket", "blazer", "cardigan"];
  if (dressKw.some((k) => name.includes(k))) return "Dresses";
  if (bottomKw.some((k) => name.includes(k))) return "Bottoms";
  if (topKw.some((k) => name.includes(k))) return "Tops";
  // default: Tops (safer for most users)
  return "Tops";
}

function inferOccasionTags(styleTags: StyleTag[]): string[] {
  const tags = new Set<string>();
  if (styleTags.includes("work") || styleTags.includes("formal")) tags.add("work");
  if (styleTags.includes("party")) tags.add("party");
  if (styleTags.includes("sporty")) tags.add("sport");
  if (tags.size === 0) tags.add("weekend");
  return Array.from(tags);
}

function inferSeasonTags(input: { filenameHint?: string; styleTags: StyleTag[] }): string[] {
  const name = (input.filenameHint ?? "").toLowerCase();
  const tags = new Set<string>();
  if (["linen", "shorts", "tank"].some((k) => name.includes(k))) tags.add("summer");
  if (["hoodie", "sweater", "coat", "down"].some((k) => name.includes(k))) tags.add("winter");
  if (["blazer", "shirt", "jeans", "pants"].some((k) => name.includes(k))) tags.add("all-season");
  if (tags.size === 0) {
    // lightweight default
    tags.add(input.styleTags.includes("sporty") ? "all-season" : "spring");
  }
  return Array.from(tags);
}

/**
 * 上传辅助识别（MVP，纯规则）：
 * - category: Tops / Bottoms
 * - color: dominantColor
 * - style_tags: from analyzeGarment heuristic
 * - occasion_tags / season_tags: basic heuristic
 *
 * 不会使用人体照片，不会生成模特，不会做自动抠图。
 */
export async function analyzeUploadMetadata(input: { file: Blob; filenameHint?: string }): Promise<{
  category: "Tops" | "Bottoms" | "Dresses";
  color: string;
  style_tags: string[];
  occasion_tags: string[];
  season_tags: string[];
}> {
  const cat = inferCategoryFromFilename(input.filenameHint);
  // heuristic analysis uses legacy hints, map Dresses -> top for now
  const hint = (cat === "Bottoms" ? "bottom" : "top") as ClothingCategory;
  const analyzed = await analyzeGarment({ file: input.file, filenameHint: input.filenameHint, categoryHint: hint });
  const style = (analyzed.styleTags ?? []) as StyleTag[];
  return {
    category: cat,
    color: analyzed.dominantColor,
    style_tags: style,
    occasion_tags: inferOccasionTags(style),
    season_tags: inferSeasonTags({ filenameHint: input.filenameHint, styleTags: style }),
  };
}
