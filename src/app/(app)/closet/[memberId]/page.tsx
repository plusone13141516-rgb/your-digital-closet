"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { MemberSwitcher } from "@/components/MemberSwitcher";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ClothingCategory, ClothingItem } from "@/lib/types";
import { deleteClothingItem, getClothingImageUrl, listClothingItems, updateClothingItem } from "@/lib/data";
import { parseOccasionTagInput, parseSeasonTagInput, parseStyleTagInput } from "@/lib/labels";
import { useAuthStore } from "@/stores/authStore";

const categoryOptions: Array<{ value: ClothingCategory; label: string }> = [
  { value: "Tops", label: "上装" },
  { value: "Bottoms", label: "下装" },
  { value: "Dresses", label: "连体衣" },
];

type Filter = "all" | "Tops" | "Bottoms" | "Dresses";

function pickPath(item: ClothingItem) {
  return item.image_path ?? item.image_url ?? item.cutout_image_url ?? item.processed_image_path ?? "";
}

function categoryLabel(value: string) {
  if (value === "Tops") return "上装";
  if (value === "Bottoms") return "下装";
  if (value === "Dresses") return "连体衣";
  return value;
}

export default function ClosetMemberPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params?.memberId ?? "";
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<ClothingCategory>("Tops");
  const [editColor, setEditColor] = useState("");
  const [editStyleTags, setEditStyleTags] = useState<string>("");
  const [editOccasionTags, setEditOccasionTags] = useState<string>("");
  const [editSeasonTags, setEditSeasonTags] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId || !memberId) return;
    setLoading(true);
    setError(null);
    listClothingItems({ userId, memberId })
      .then((data) => setItems(data))
      .catch((e) => setError(e instanceof Error ? e.message : "加载衣橱失败"))
      .finally(() => setLoading(false));
  }, [memberId, userId]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [filter, items]);

  useEffect(() => {
    if (!selected) return;
    setEditName(selected.name ?? "");
    setEditCategory(selected.category as ClothingCategory);
    setEditColor(selected.color ?? "");
    setEditStyleTags((selected.style_tags ?? []).join(", "));
    setEditOccasionTags((selected.occasion_tags ?? []).join(", "));
    setEditSeasonTags((selected.season_tags ?? []).join(", "));
  }, [selected]);

  async function onSaveEdit() {
    if (!selected) return;
    setSaving(true);
    try {
      const patch: any = {
        name: editName.trim() || null,
        category: editCategory,
        color: editColor.trim() || null,
        style_tags: editStyleTags
          .split(/[,，]/)
          .map((s) => parseStyleTagInput(s))
          .filter(Boolean),
        occasion_tags: editOccasionTags
          .split(/[,，]/)
          .map((s) => parseOccasionTagInput(s))
          .filter(Boolean),
        season_tags: editSeasonTags
          .split(/[,，]/)
          .map((s) => parseSeasonTagInput(s))
          .filter(Boolean),
      };
      const updated = await updateClothingItem({ userId, itemId: selected.id, patch });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setSelected(updated);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item: ClothingItem) {
    if (!confirm("确定删除这件单品吗？")) return;
    await deleteClothingItem({ userId, item });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (selected?.id === item.id) setSelected(null);
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="衣橱" subtitle="你的单品衣橱（上装 / 下装 / 连体衣）。" right={<MemberSwitcher />} />

      <div className="flex flex-wrap gap-2">
        {(["all", "Tops", "Bottoms", "Dresses"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={[
              "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
              filter === k
                ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)]"
                : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
            ].join(" ")}
          >
            {k === "all" ? "全部" : categoryOptions.find((o) => o.value === k)?.label ?? k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[3/4] rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(213,155,106,0.18)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] px-5 py-6 text-[13px] text-[var(--dc-muted)]">
          还没有单品。去「上传」添加你的第一件衣服吧。
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <ClosetTile key={item.id} userId={userId} item={item} onEdit={() => setSelected(item)} onDelete={() => onDelete(item)} />
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[rgba(0,0,0,0.35)] p-4">
          <Card className="w-full max-w-md p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[14px] font-semibold">编辑单品</div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                关闭
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">名称</div>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="可选" />
              </div>

              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">分类</div>
                <Select
                  value={editCategory}
                  options={categoryOptions}
                  onChange={(e) => setEditCategory((e.target as HTMLSelectElement).value as ClothingCategory)}
                />
              </div>

              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">颜色</div>
                <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} placeholder="例如：白色" />
              </div>

              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">风格标签（逗号分隔）</div>
                <Input value={editStyleTags} onChange={(e) => setEditStyleTags(e.target.value)} placeholder="例如：休闲, 通勤" />
              </div>
              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">场景标签（逗号分隔）</div>
                <Input value={editOccasionTags} onChange={(e) => setEditOccasionTags(e.target.value)} placeholder="例如：上班, 周末" />
              </div>
              <div className="grid gap-2">
                <div className="text-[13px] text-[var(--dc-muted)]">季节标签（逗号分隔）</div>
                <Input value={editSeasonTags} onChange={(e) => setEditSeasonTags(e.target.value)} placeholder="例如：夏, 四季" />
              </div>

              <Button onClick={onSaveEdit} disabled={saving} className="w-full">
                {saving ? "保存中…" : "保存修改"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function ClosetTile({
  userId,
  item,
  onEdit,
  onDelete,
}: {
  userId: string;
  item: ClothingItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const path = pickPath(item);
    if (!path) return;
    getClothingImageUrl(userId, path).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [item, userId]);

  return (
    <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.45)] shadow-[0_14px_30px_rgba(43,42,38,0.08)]">
      <div className="relative aspect-square overflow-hidden rounded-[22px] m-2 bg-[rgba(255,255,255,0.6)]">
        {url ? <img src={url} alt={item.name ?? ""} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-3" /> : null}
        <div className="absolute left-2 top-2 rounded-full bg-[rgba(244,215,123,0.75)] px-2.5 py-1 text-[11px] font-medium text-[var(--dc-primary-ink)]">
          {categoryLabel(item.category)}
        </div>
      </div>
      <div className="px-4 pb-4 pt-1">
        <div className="truncate text-[14px] font-semibold">{item.name ?? "未命名"}</div>
        <div className="mt-1 text-[12px] text-[var(--dc-muted)]">{item.color ?? "—"}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            编辑
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}
