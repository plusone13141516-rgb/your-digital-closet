import type { ClothingCategory, Pattern } from "@/lib/types";

function safeLabel(label: string) {
  return label.replace(/&/g, "and").replace(/</g, "").replace(/>/g, "");
}

function hexByName(name: string) {
  const c = (name || "").toLowerCase();
  if (c.includes("black")) return "#1f1f22";
  if (c.includes("white")) return "#f5f3ee";
  if (c.includes("cream") || c.includes("ivory")) return "#f3eadc";
  if (c.includes("beige")) return "#dfceb2";
  if (c.includes("brown")) return "#7b5a3f";
  if (c.includes("navy")) return "#203356";
  if (c.includes("blue")) return "#4a78ba";
  if (c.includes("green")) return "#4e805c";
  if (c.includes("red")) return "#b24844";
  if (c.includes("pink")) return "#d67d9c";
  if (c.includes("yellow") || c.includes("butter")) return "#e6be5c";
  if (c.includes("orange")) return "#d78c46";
  if (c.includes("gray") || c.includes("grey")) return "#8e8e92";
  return "#c7bfae";
}

function patternHint(pattern: Pattern) {
  if (pattern === "striped") return "STRIPES";
  if (pattern === "plaid") return "PLAID";
  if (pattern === "floral") return "FLORAL";
  if (pattern === "graphic") return "GRAPHIC";
  return "SOLID";
}

function silhouette(category: ClothingCategory) {
  // 简化的“平铺衣服”轮廓（非真实照片，但加载极快、可用于原型/筛选/相似逻辑演示）
  // 使用白色描边以适配奶油色背景。
  switch (category) {
    case "top":
      return `<path d="M210 140l-35-30-40 25-55 0-40-25-35 30 40 55 0 220 260 0 0-220z" opacity="0.96"/>`;
    case "bottom":
      return `<path d="M155 120l-70 0-25 310 70 0 25-180 25 180 70 0-25-310z" opacity="0.96"/>`;
    case "outerwear":
      return `<path d="M210 150l-38-45-40 28-55 0-40-28-38 45 35 70 0 235 70 0 0-235 36 0 0 235 70 0 0-235z" opacity="0.96"/>`;
    case "dress":
      return `<path d="M150 105c50 0 80 35 80 70l-25 65 45 210-200 0 45-210-25-65c0-35 30-70 80-70z" opacity="0.96"/>`;
    case "shoes":
      return `<path d="M70 335c55 0 85-35 130-35 35 0 55 20 55 45 0 25-20 40-55 40l-130 0c-25 0-45-15-45-25 0-15 20-25 45-25z" opacity="0.96"/>
              <path d="M100 275c40 0 55-25 95-25 30 0 45 18 45 35 0 18-15 30-45 30l-95 0c-18 0-32-10-32-18 0-12 15-22 32-22z" opacity="0.72"/>`;
    case "accessories":
    default:
      return `<path d="M95 220c0-45 35-80 80-80s80 35 80 80l0 155-160 0 0-155z" opacity="0.96"/>
              <path d="M115 220c0-35 25-60 60-60s60 25 60 60" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="18" stroke-linecap="round"/>`;
  }
}

export function catalogImageUrl(input: {
  title: string;
  category: ClothingCategory;
  color: string;
  pattern: Pattern;
}): string {
  const fg = hexByName(input.color);
  const label = safeLabel(input.title).slice(0, 22);
  const hint = patternHint(input.pattern);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 360 520">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fffaf2"/>
        <stop offset="1" stop-color="#f3eadc"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(43,42,38,0.18)"/>
      </filter>
      <pattern id="p" width="18" height="18" patternUnits="userSpaceOnUse">
        <path d="M0 18 L18 0" stroke="rgba(255,255,255,0.22)" stroke-width="5"/>
      </pattern>
    </defs>
    <rect width="360" height="520" rx="34" fill="url(#bg)"/>
    <g transform="translate(0,0)" filter="url(#shadow)">
      <rect x="40" y="70" width="280" height="360" rx="34" fill="rgba(255,255,255,0.55)"/>
      <g transform="translate(50,92)">
        <rect x="0" y="0" width="260" height="316" rx="30" fill="rgba(255,255,255,0.72)"/>
        <g transform="translate(0,0)">
          <g transform="translate(0,0)">
            <g transform="translate(0,0)" fill="${fg}" stroke="rgba(255,255,255,0.9)" stroke-width="6" stroke-linejoin="round">
              ${silhouette(input.category)}
            </g>
            <g opacity="0.22">
              <rect x="0" y="0" width="260" height="316" fill="url(#p)"/>
            </g>
          </g>
        </g>
      </g>
    </g>
    <text x="180" y="470" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="16" fill="rgba(43,42,38,0.72)">${hint}</text>
    <text x="180" y="495" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700" fill="rgba(43,42,38,0.88)">${label}</text>
  </svg>`;

  // data URL（无需网络请求，预览非常快）
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

