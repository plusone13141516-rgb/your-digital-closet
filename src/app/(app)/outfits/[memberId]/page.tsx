"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { MemberSwitcher } from "@/components/MemberSwitcher";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OutfitPreviewCanvas } from "@/components/OutfitPreviewCanvas";
import { listClothingItems, listOutfits, removeOutfit } from "@/lib/data";
import { ClothingItem, Outfit, TrendCard } from "@/lib/types";
import { trendSeedData } from "@/lib/trendSeedData";
import { useAuthStore } from "@/stores/authStore";
import { useHouseholdStore } from "@/stores/householdStore";

export default function OutfitsMemberPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params?.memberId ?? "";

  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const { selectMember } = useHouseholdStore();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;
    selectMember(memberId);
  }, [memberId, selectMember]);

  useEffect(() => {
    if (!userId || !memberId) return;
    setLoading(true);
    setError(null);
    Promise.all([listClothingItems({ userId, memberId }), listOutfits({ userId, memberId })])
      .then(([i, o]) => {
        setItems(i);
        setOutfits(o);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载穿搭失败"))
      .finally(() => setLoading(false));
  }, [memberId, userId]);

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const trendById = useMemo(() => new Map(trendSeedData.map((t) => [t.id, t])), []);

  async function onDelete(outfit: Outfit) {
    if (!confirm("确定删除这套穿搭吗？")) return;
    await removeOutfit({ userId, outfitId: outfit.id });
    setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="穿搭" subtitle="你保存的穿搭。" right={<MemberSwitcher />} />

      {loading ? (
        <div className="h-[420px] rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] animate-pulse" />
      ) : error ? (
        <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(213,155,106,0.18)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
          {error}
        </div>
      ) : outfits.length === 0 ? (
        <Card className="p-5">
          <div className="text-[13px] text-[var(--dc-muted)]">还没有保存的穿搭。去「搭配」页保存第一个吧。</div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {outfits.map((o) => {
            const top = o.top_item_id ? itemById.get(o.top_item_id) ?? null : null;
            const bottom = o.bottom_item_id ? itemById.get(o.bottom_item_id) ?? null : null;
            const dress = o.dress_item_id ? itemById.get(o.dress_item_id) ?? null : null;
            const trend = (o.trend_card_id ? (trendById.get(o.trend_card_id) as TrendCard | undefined) : undefined) ?? null;
            return (
              <div key={o.id} className="grid gap-3">
                <OutfitPreviewCanvas userId={userId} top={top} bottom={bottom} dress={dress} />
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold">{o.name ?? "新穿搭"}</div>
                      {trend ? <div className="mt-1 text-[12px] text-[var(--dc-muted)]">趋势：{trend.trend_name}</div> : null}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(o)}>
                      删除
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
