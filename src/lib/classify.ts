import { ClothingCategory } from "@/lib/types";

const topKeywords = ["shirt", "tee", "top", "blouse", "sweater", "cardigan", "tank", "camisole"];
const bottomKeywords = ["pants", "jeans", "trouser", "skirt", "shorts", "legging"];
const outerwearKeywords = ["jacket", "coat", "hoodie", "blazer", "parka", "windbreaker"];
const dressKeywords = ["dress", "gown", "jumpsuit", "romper"];
const shoesKeywords = ["shoes", "sneaker", "boot", "loafer", "heel", "sandal"];
const accessoriesKeywords = ["hat", "cap", "scarf", "belt", "bag", "backpack", "accessory", "glove"];

export type CategorySuggestion = {
  suggestedCategory: ClothingCategory;
  confidence: "low" | "medium" | "high";
  reason: string;
};

export function suggestCategory(input: { filename?: string; providedName?: string }): CategorySuggestion {
  const hay = `${input.filename ?? ""} ${input.providedName ?? ""}`.toLowerCase();

  if (shoesKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "shoes", confidence: "high", reason: "Matched a shoes keyword." };
  }

  if (accessoriesKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "accessories", confidence: "high", reason: "Matched an accessories keyword." };
  }

  if (dressKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "dress", confidence: "high", reason: "Matched a dress keyword." };
  }

  if (outerwearKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "outerwear", confidence: "high", reason: "Matched an outerwear keyword." };
  }

  if (topKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "top", confidence: "medium", reason: "Matched a top keyword." };
  }

  if (bottomKeywords.some((k) => hay.includes(k))) {
    return { suggestedCategory: "bottom", confidence: "medium", reason: "Matched a bottom keyword." };
  }

  return { suggestedCategory: "top", confidence: "low", reason: "Fallback suggestion." };
}
