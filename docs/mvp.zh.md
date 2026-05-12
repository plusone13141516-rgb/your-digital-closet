# Family Closet AI（家庭多人衣橱）MVP 方案（Next.js + Supabase）

> 边界声明（本 MVP 严格遵守）：**不做虚拟试穿、不生成模特图、不上传人脸/人体照片、不做 avatar try-on、不做复杂换装生成**。  
> 系统只处理**用户自己拍好的“衣服单品照片”**，并完成：上传 → 简单分类 → 相似单品匹配 → 保存到对应家庭成员衣橱 → 筛选/收藏/搭配建议。

---

## 1. 产品架构（模块）

### 1.1 核心对象
- **主账号（Household Account）**：一个 Supabase Auth 用户（`auth.users`）拥有一个 household
- **家庭成员（Household Member）**：同一主账号下的多个成员（母亲/儿子等），每个成员有独立衣橱与搭配建议
- **衣服单品（Clothing Item）**：一次上传一件；保存原图 + 处理后图；归属到某个成员
- **单品分析（Clothing Analysis）**：基础分类/颜色/纹理/标签/描述/置信度；可手动修改
- **相似单品（Similar Products）**：上传后自动生成 top matches（当前为 mock catalog），支持收藏
- **收藏搭配（Saved Outfits）**：在某个成员的衣橱里选择上衣 + 下装，rule-based 输出分数与解释，可收藏

### 1.2 MVP 端到端链路
1) 选择成员（Household Dashboard / Member Switcher）  
2) 上传衣服单品照片 → 裁剪 → 生成 processed 图  
3) 触发轻量分析：`category + dominant_color + pattern + style_tags + ai_description + confidence`  
4) 基于分析结果跑 **similar item search**（相似检索，非“同款”保证）得到 top matched items  
5) 把：`clothing_items + clothing_analysis + similar_products` 写入 Supabase（或 demo localStorage）  
6) 在 Member Closet 里筛选/搜索/查看详情；在详情页可编辑分类与备注、重新匹配、收藏 item/匹配商品  
7) Outfit Suggestions 里选择 top + bottom，输出兼容分数与解释，可收藏到 Favorites

---

## 2. 页面结构（移动端优先）

### 公共
- `/` Landing（可进入 Auth 或直接打开 Household；demo 模式可直接体验）
- `/auth` 注册/登录（Supabase Email Auth；未配置 env 时自动进入 demo）

### App（登录后/或 demo）
- `/household` **Household Dashboard**：成员列表、创建/编辑/删除、快速进入某成员衣橱
- `/closet` **Member Closet**：基于当前选中成员展示衣橱；支持 category/color/pattern/tag/search 过滤
- `/closet/[id]` **Item Detail**：原图/处理图、分类结果、标签、描述、相似匹配、notes、编辑/删除、收藏、重新匹配
- `/upload` **Upload**：拍照提示 → 本地上传 → 裁剪 → 自动分类 + 相似匹配 → 保存到该成员
- `/similar` **Similar Search**：选择某个已上传单品重新跑匹配；也可浏览 mock catalog
- `/outfits` **Outfit Suggestions**：选 1 件上衣 + 1 件下装 → rule-based compatibility score + explanation
- `/favorites` **Favorites**：收藏的 items / matched products / outfits（按成员）
- `/profile` Profile / Settings：账号信息、进入 Favorites、退出登录

---

## 3. 数据库 Schema（Supabase PostgreSQL）

> SQL 已在仓库 `migrations/` 中提供：  
> - `20260421_init.sql`（profiles、clothing_items、outfits*旧表）  
> - `20260511_household.sql`（households、members、analysis、similar、saved_outfits 等）

### 3.1 关键表（与需求对齐）

#### `auth.users`（Supabase 内置）
- 作为主账号用户表（对应需求里的 `users`）

#### `public.profiles`
- `user_id (pk, fk auth.users.id)`
- `username`

#### `public.households`
- `id (uuid pk)`
- `owner_id (fk auth.users.id)`：主账号
- `name`

#### `public.household_members`
- `id (uuid pk)`
- `household_id (fk households.id)`
- `name`
- `age_group enum('kid','teen','adult') nullable`

#### `public.clothing_items`
- `id (uuid pk)`
- `user_id (fk auth.users.id)`
- `household_id (fk households.id)`
- `member_id (fk household_members.id)`
- `name`
- `category enum('top','bottom','outerwear','dress','shoes','accessories')`
- `color`（可由系统分析填充，也允许用户改）
- `style_tags text[]`
- `original_image_path`（Storage path）
- `processed_image_path`（Storage path）
- `notes`
- `is_favorite`

#### `public.clothing_analysis`
- `clothing_item_id (unique, fk clothing_items.id)`
- `category`
- `dominant_color`
- `pattern`
- `style_tags`
- `ai_description`（MVP 为短描述；不需要大模型也可运行）
- `confidence_score`

#### `public.similar_products`
> 保存“某个 uploaded item 的匹配结果列表”
- `clothing_item_id (fk clothing_items.id)`
- `product_title`
- `product_image_url`
- `category`
- `similarity_score`
- `is_favorite`
- `source ('mock'...)`
- `metadata jsonb`

#### `public.saved_outfits`
- `user_id` / `household_id` / `member_id`
- `top_item_id` / `bottom_item_id`
- `compatibility_score`
- `explanation`
- `is_favorite`

### 3.2 Storage（Supabase Storage）
- bucket：`clothing-images`（建议 private）
- path 约定：`{userId}/{itemId}/original.jpg`、`{userId}/{itemId}/processed.jpg`
- RLS policies：见 `README.md`（按 foldername 第一级等于 auth.uid 控制读写）

---

## 4. 前端组件结构（Next.js App Router）

### 4.1 路由目录
- `src/app/(app)/...`：登录后页面（共享底部导航）
- `src/app/auth`：登录/注册

### 4.2 关键 UI 组件
- `components/BottomNav`：主导航（Household / Closet / Upload / Similar / Outfit / Profile）
- `components/MemberSwitcher`：快速切换成员（影响 closet/upload/similar/outfits/favorites）
- `components/ItemCard`：衣橱卡片（缩略图 + 基本信息）
- `components/OutfitPreview`：上衣+下装预览
- `components/ui/*`：Button / Card / Input / Select / Chip（圆角卡片、轻阴影、暖色系）

### 4.3 状态管理（Zustand）
- `stores/authStore`：Supabase session/user（demo 模式自动注入 demo-user）
- `stores/householdStore`：household + members + selectedMemberId
- `stores/demoClosetStore`：demo 数据（至少 mother/son 两个成员 + 若干单品/匹配）

---

## 5. “简单分类 + 相似匹配”逻辑（MVP）

### 5.1 分类（必须有）
- 当前实现：`src/lib/analysis.ts`
  - 用 canvas 抽样像素 → 估计 dominant color（离散调色板）
  - 用亮度方差粗略推断 pattern（solid / graphic / other）
  - 结合 categoryHint 推 style_tags（rule-based）
  - 生成短描述 + confidence
- 支持手动编辑：`/closet/[id]` 可改 category/color/pattern/tags/description

> 与 DeepFashion2 的吸收方式（不照搬 UI/数据）：  
> - 参考“item-level 服饰类别/属性”的结构化思路 → 把 MVP 分类输出固定为 `category/color/pattern/tags/score`
> - 未来扩展点：如果引入 segmentation/bbox，可把 `processed_image` 由“裁剪”升级为“衣服区域提取”

### 5.2 相似单品匹配（必须有）
- 当前实现：`src/lib/similarity.ts` + `src/lib/mockCatalog.ts`
  - mock catalog（预先索引/内置）  
  - similarity = category + color + pattern + style_tag overlap 的加权分数  
  - 返回 top matched items，写入 `similar_products`
- `/similar` 页支持“选择某个 item 重新跑匹配”

> 与 embedding/vector search 的衔接（未来扩展，不默认实现）：  
> - 在 `findSimilarProducts()` 外包一层 provider：MockProvider / ClipEmbeddingProvider  
> - 把 catalog 放入 `catalog_products` 表，并写入向量索引（pgvector/FAISS/外部向量库）

### 5.3 简单穿搭建议（必须有，轻量版）
- 当前实现：`src/lib/compatibility.ts`
  - 基于 color family（neutral/warm/cool）+ style tag overlap  
  - 输出 `compatibility_score + short explanation`
- outfit structure 参考 Polyvore：明确 “top + bottom” 的组合关系；MVP 不做复杂生成

---

## 6. Mock Catalog / Demo Data

### 6.1 Mock Catalog
在 `src/lib/mockCatalog.ts`：若干（top/bottom/outerwear/dress/shoes/accessories）商品条目：
- `title + category + color + pattern + style_tags + image_url`

### 6.2 Demo Household（至少两个成员）
在 `src/stores/demoClosetStore.ts`：
- Household：`Ward Family`
- Members：`Mother (adult)`、`Son (kid)`
- Items：母亲/儿子各 2 件以上示例单品
- SimilarProducts：每件单品预置 2 条匹配结果

---

## 7. Setup Instructions（开发启动）

### 7.1 仅前端（demo 模式）
```bash
cd digital-closet-app
npm install
npm run dev
```
不配置 Supabase env 时自动进入 demo mode（数据保存在 localStorage）。

### 7.2 启用 Supabase（Auth + DB + Storage）
1) Supabase 控制台创建项目并启用 Email auth  
2) 执行 `migrations/*.sql`  
3) 创建 Storage bucket：`clothing-images`（private）并应用 README 中的 storage policy  
4) 创建 `.env.local`：
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
5) `npm run dev` 重启

---

## 8. 后续可扩展点（不默认实现）
- **Embedding-based similar search**：CLIP/ViT 特征 + pgvector/FAISS；mockCatalog → DB catalog_products
- **Garment segmentation / clothing extraction**：参考 OpenTryOn 的 garment preprocessing 思路，但仅做衣服区域提取，不做人物合成/试穿
- **更细属性体系**：参考 AiDLab-fAshIon-Data 的 attribute/compatibility 方向（注意其学术属性），扩展 tags 与解释
- **多 household / 成员协作**：支持邀请家庭成员加入（role-based）
- **i18n**：中文/英文 UI 切换

---

## 附：GitHub 参考仓库作为依赖（Submodules）

你要求把 DeepFashion2 / Polyvore / AiDLab-fAshIon-Data / OpenTryOn “装进项目里”，本项目已采用 **git submodule** 的方式加入：
- `vendor/deepfashion2`
- `vendor/polyvore-dataset`
- `vendor/AiDLab-fAshIon-Data`
- `vendor/opentryon`

说明：
- 它们当前 **不会参与 Next.js 的构建/运行**（避免 web 项目体积/依赖爆炸）
- 未来如果要做“在线能力”（embedding 检索 / 预处理 / 分割等），建议新增独立的服务或离线 pipeline 来消费这些仓库的代码与数据

