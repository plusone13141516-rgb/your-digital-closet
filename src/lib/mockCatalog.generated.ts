import { ClothingCategory, Pattern, StyleTag } from "@/lib/types";
import { catalogImageUrl } from "@/lib/catalogImage";

export type CatalogItem = {
  id: string;
  title: string;
  category: ClothingCategory;
  color: string;
  pattern: Pattern;
  style_tags: StyleTag[];
  image_url: string;
};

/**
 * 默认：使用本地 data-url SVG 占位图（预览秒开）。
 *
 * 如果你要用“真实图”，请运行脚本：
 *   npm run catalog:build -- --input <你的数据集图片目录>
 * 它会把图片拷贝到 public/catalog/images 并覆盖本文件的 image_url。
 */
const defs: Array<Omit<CatalogItem, "image_url">> = [
  // Tops
  { id: "cat-top-cream-tee", title: "Cream Everyday Tee", category: "top", color: "cream", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-top-white-shirt", title: "White Crisp Shirt", category: "top", color: "white", pattern: "solid", style_tags: ["work", "formal"] },
  { id: "cat-top-yellow-knit", title: "Butter Knit Top", category: "top", color: "yellow", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-top-black-turtleneck", title: "Black Turtleneck", category: "top", color: "black", pattern: "solid", style_tags: ["work"] },
  { id: "cat-top-navy-polo", title: "Navy Polo Top", category: "top", color: "navy", pattern: "solid", style_tags: ["casual", "work"] },
  { id: "cat-top-blue-striped-tee", title: "Blue Striped Tee", category: "top", color: "blue", pattern: "striped", style_tags: ["casual"] },
  { id: "cat-top-green-graphic-tee", title: "Green Graphic Tee", category: "top", color: "green", pattern: "graphic", style_tags: ["streetwear"] },
  { id: "cat-top-red-blouse", title: "Soft Red Blouse", category: "top", color: "red", pattern: "solid", style_tags: ["party", "formal"] },
  { id: "cat-top-pink-cardigan", title: "Pink Cozy Cardigan", category: "top", color: "pink", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-top-beige-linen-shirt", title: "Beige Linen Shirt", category: "top", color: "beige", pattern: "solid", style_tags: ["work"] },
  { id: "cat-top-brown-sweatshirt", title: "Brown Soft Sweatshirt", category: "top", color: "brown", pattern: "solid", style_tags: ["casual", "sporty"] },
  { id: "cat-top-gray-hoodie", title: "Gray Zip Hoodie", category: "top", color: "gray", pattern: "solid", style_tags: ["sporty"] },
  { id: "cat-top-orange-tee", title: "Orange Sunny Tee", category: "top", color: "orange", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-top-white-plaid-shirt", title: "Light Plaid Shirt", category: "top", color: "white", pattern: "plaid", style_tags: ["casual"] },
  { id: "cat-top-cream-floral-blouse", title: "Cream Floral Blouse", category: "top", color: "cream", pattern: "floral", style_tags: ["party"] },

  // Bottoms
  { id: "cat-bottom-blue-jeans", title: "Light Blue Denim Jeans", category: "bottom", color: "blue", pattern: "solid", style_tags: ["casual", "streetwear"] },
  { id: "cat-bottom-navy-short", title: "Navy Play Shorts", category: "bottom", color: "navy", pattern: "solid", style_tags: ["sporty"] },
  { id: "cat-bottom-beige-skirt", title: "Beige Midi Skirt", category: "bottom", color: "beige", pattern: "solid", style_tags: ["work", "formal"] },
  { id: "cat-bottom-black-trousers", title: "Black Tailored Trousers", category: "bottom", color: "black", pattern: "solid", style_tags: ["work", "formal"] },
  { id: "cat-bottom-gray-sweatpants", title: "Gray Sweatpants", category: "bottom", color: "gray", pattern: "solid", style_tags: ["sporty", "casual"] },
  { id: "cat-bottom-brown-chinos", title: "Brown Chinos", category: "bottom", color: "brown", pattern: "solid", style_tags: ["work"] },
  { id: "cat-bottom-cream-wide-leg", title: "Cream Wide-Leg Pants", category: "bottom", color: "cream", pattern: "solid", style_tags: ["work", "casual"] },
  { id: "cat-bottom-blue-plaid-skirt", title: "Blue Plaid Skirt", category: "bottom", color: "blue", pattern: "plaid", style_tags: ["party"] },
  { id: "cat-bottom-green-short", title: "Green Sport Shorts", category: "bottom", color: "green", pattern: "solid", style_tags: ["sporty"] },
  { id: "cat-bottom-red-skirt", title: "Red A-line Skirt", category: "bottom", color: "red", pattern: "solid", style_tags: ["party"] },
  { id: "cat-bottom-pink-pleated-skirt", title: "Pink Pleated Skirt", category: "bottom", color: "pink", pattern: "solid", style_tags: ["party", "formal"] },
  { id: "cat-bottom-yellow-short", title: "Yellow Summer Shorts", category: "bottom", color: "yellow", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-bottom-orange-skirt", title: "Orange Midi Skirt", category: "bottom", color: "orange", pattern: "solid", style_tags: ["party"] },
  { id: "cat-bottom-navy-jeans", title: "Dark Navy Jeans", category: "bottom", color: "navy", pattern: "solid", style_tags: ["casual", "streetwear"] },
  { id: "cat-bottom-white-linen-short", title: "White Linen Shorts", category: "bottom", color: "white", pattern: "solid", style_tags: ["casual"] },

  // Outerwear
  { id: "cat-outerwear-cream-hoodie", title: "Cream Soft Hoodie", category: "outerwear", color: "cream", pattern: "solid", style_tags: ["sporty", "casual"] },
  { id: "cat-outerwear-navy-blazer", title: "Navy Tailored Blazer", category: "outerwear", color: "navy", pattern: "solid", style_tags: ["work", "formal"] },
  { id: "cat-outerwear-black-coat", title: "Black Long Coat", category: "outerwear", color: "black", pattern: "solid", style_tags: ["formal", "work"] },
  { id: "cat-outerwear-beige-trench", title: "Beige Trench Coat", category: "outerwear", color: "beige", pattern: "solid", style_tags: ["work"] },
  { id: "cat-outerwear-gray-cardigan", title: "Gray Knit Cardigan", category: "outerwear", color: "gray", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-outerwear-blue-denim-jacket", title: "Blue Denim Jacket", category: "outerwear", color: "blue", pattern: "solid", style_tags: ["streetwear", "casual"] },
  { id: "cat-outerwear-green-windbreaker", title: "Green Windbreaker", category: "outerwear", color: "green", pattern: "solid", style_tags: ["sporty"] },
  { id: "cat-outerwear-brown-jacket", title: "Brown Utility Jacket", category: "outerwear", color: "brown", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-outerwear-red-bomber", title: "Red Bomber Jacket", category: "outerwear", color: "red", pattern: "solid", style_tags: ["streetwear"] },
  { id: "cat-outerwear-yellow-jacket", title: "Yellow Light Jacket", category: "outerwear", color: "yellow", pattern: "solid", style_tags: ["casual"] },

  // Dresses
  { id: "cat-dress-red", title: "Soft Red Day Dress", category: "dress", color: "red", pattern: "solid", style_tags: ["party", "formal"] },
  { id: "cat-dress-cream", title: "Cream Minimal Dress", category: "dress", color: "cream", pattern: "solid", style_tags: ["formal"] },
  { id: "cat-dress-blue-floral", title: "Blue Floral Dress", category: "dress", color: "blue", pattern: "floral", style_tags: ["party"] },
  { id: "cat-dress-black", title: "Black Evening Dress", category: "dress", color: "black", pattern: "solid", style_tags: ["formal", "party"] },
  { id: "cat-dress-pink", title: "Pink Day Dress", category: "dress", color: "pink", pattern: "solid", style_tags: ["party"] },
  { id: "cat-dress-yellow", title: "Yellow Summer Dress", category: "dress", color: "yellow", pattern: "solid", style_tags: ["casual"] },

  // Shoes
  { id: "cat-shoes-white-sneaker", title: "White Sneakers", category: "shoes", color: "white", pattern: "solid", style_tags: ["sporty", "casual"] },
  { id: "cat-shoes-black-loafer", title: "Black Loafers", category: "shoes", color: "black", pattern: "solid", style_tags: ["work", "formal"] },
  { id: "cat-shoes-brown-boot", title: "Brown Ankle Boots", category: "shoes", color: "brown", pattern: "solid", style_tags: ["work"] },
  { id: "cat-shoes-navy-runner", title: "Navy Running Shoes", category: "shoes", color: "navy", pattern: "solid", style_tags: ["sporty"] },
  { id: "cat-shoes-beige-flat", title: "Beige Flats", category: "shoes", color: "beige", pattern: "solid", style_tags: ["formal"] },
  { id: "cat-shoes-red-heel", title: "Red Heels", category: "shoes", color: "red", pattern: "solid", style_tags: ["party", "formal"] },
  { id: "cat-shoes-gray-sneaker", title: "Gray Sneakers", category: "shoes", color: "gray", pattern: "solid", style_tags: ["casual", "sporty"] },
  { id: "cat-shoes-green-sneaker", title: "Green Sneakers", category: "shoes", color: "green", pattern: "solid", style_tags: ["streetwear"] },

  // Accessories
  { id: "cat-acc-brown-bag", title: "Brown Mini Bag", category: "accessories", color: "brown", pattern: "solid", style_tags: ["work", "casual"] },
  { id: "cat-acc-black-belt", title: "Black Leather Belt", category: "accessories", color: "black", pattern: "solid", style_tags: ["work"] },
  { id: "cat-acc-white-cap", title: "White Baseball Cap", category: "accessories", color: "white", pattern: "solid", style_tags: ["sporty", "casual"] },
  { id: "cat-acc-navy-backpack", title: "Navy Backpack", category: "accessories", color: "navy", pattern: "solid", style_tags: ["casual"] },
  { id: "cat-acc-red-scarf", title: "Red Soft Scarf", category: "accessories", color: "red", pattern: "solid", style_tags: ["party"] },
  { id: "cat-acc-beige-hat", title: "Beige Sun Hat", category: "accessories", color: "beige", pattern: "solid", style_tags: ["casual"] },
];

export const mockCatalog: CatalogItem[] = defs.map((item) => ({
  ...item,
  image_url: catalogImageUrl({ title: item.title, category: item.category, color: item.color, pattern: item.pattern }),
}));

