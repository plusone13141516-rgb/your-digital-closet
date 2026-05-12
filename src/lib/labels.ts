export function labelCategory(cat: string) {
  if (cat === "Tops") return "上装";
  if (cat === "Bottoms") return "下装";
  if (cat === "Dresses") return "连体衣";
  return cat;
}

export function labelStyleTag(tag: string) {
  const t = tag.toLowerCase();
  if (t === "casual") return "休闲";
  if (t === "work") return "通勤";
  if (t === "formal") return "正式";
  if (t === "streetwear") return "街头";
  if (t === "sporty") return "运动";
  if (t === "party") return "聚会";
  return tag;
}

export function parseStyleTagInput(input: string) {
  const s = input.trim();
  const low = s.toLowerCase();
  const map: Record<string, string> = {
    休闲: "casual",
    通勤: "work",
    正式: "formal",
    街头: "streetwear",
    运动: "sporty",
    聚会: "party",
    约会: "party",
    派对: "party",
  };
  return map[s] ?? map[low] ?? low;
}

export function labelOccasionTag(tag: string) {
  const t = tag.toLowerCase();
  if (t === "work") return "上班";
  if (t === "weekend") return "周末";
  if (t === "date") return "约会";
  if (t === "party") return "聚会";
  if (t === "travel") return "旅行";
  if (t === "sport") return "运动";
  return tag;
}

export function parseOccasionTagInput(input: string) {
  const s = input.trim();
  const low = s.toLowerCase();
  const map: Record<string, string> = {
    上班: "work",
    通勤: "work",
    周末: "weekend",
    约会: "date",
    聚会: "party",
    派对: "party",
    旅行: "travel",
    运动: "sport",
  };
  return map[s] ?? map[low] ?? low;
}

export function labelSeasonTag(tag: string) {
  const t = tag.toLowerCase();
  if (t === "spring") return "春";
  if (t === "summer") return "夏";
  if (t === "fall") return "秋";
  if (t === "winter") return "冬";
  if (t === "all-season" || t === "all season") return "四季";
  return tag;
}

export function parseSeasonTagInput(input: string) {
  const s = input.trim();
  const low = s.toLowerCase();
  const map: Record<string, string> = {
    春: "spring",
    夏: "summer",
    秋: "fall",
    冬: "winter",
    四季: "all-season",
    全年: "all-season",
  };
  return map[s] ?? map[low] ?? low;
}

export function labelColorTag(tag: string) {
  const t = tag.toLowerCase();
  if (t === "white") return "白色";
  if (t === "black") return "黑色";
  if (t === "navy") return "藏青";
  if (t === "blue") return "蓝色";
  if (t === "light blue") return "浅蓝";
  if (t === "gray" || t === "grey") return "灰色";
  if (t === "beige") return "米色";
  if (t === "cream") return "奶油白";
  if (t === "brown") return "棕色";
  if (t === "red") return "红色";
  if (t === "pink") return "粉色";
  return tag;
}

export function labelKeyword(keyword: string) {
  const k = keyword.toLowerCase();
  const map: Record<string, string> = {
    "button-down": "衬衫",
    knit: "针织",
    stripe: "条纹",
    cardigan: "开衫",
    "straight pants": "直筒裤",
    denim: "牛仔",
    "long skirt": "长裙",
    tank: "背心",
    tee: "T恤",
    fitted: "修身",
    minimal: "极简",
    linen: "亚麻",
    "wide-leg": "阔腿",
    shorts: "短裤",
    "oversized tee": "宽松T恤",
    shirt: "衬衫",
    "light knit": "薄针织",
    "tailored pants": "西裤",
    polo: "Polo衫",
    "denim jacket": "牛仔外套",
    "denim shirt": "牛仔衬衫",
    "midi skirt": "中长裙",
    "oversized shirt": "宽松衬衫",
    sweater: "毛衣",
    hoodie: "卫衣",
    "zip jacket": "拉链外套",
    "light jacket": "薄外套",
    clean: "干净",
    dark: "深色",
    jacket: "外套",
    "wide-leg pants": "阔腿裤",
    "linen pants": "亚麻裤",
    "linen shirt": "亚麻衬衫",
    "white tee": "白T",
  };
  return map[k] ?? keyword;
}
