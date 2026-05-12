"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClothingItem } from "@/lib/types";
import { CutoutClothingCard } from "@/components/CutoutClothingCard";
import { OutfitPreviewCanvas } from "@/components/OutfitPreviewCanvas";
import { SwipeDeck } from "@/components/SwipeDeck";
import { saveOutfit } from "@/lib/data";

export function SwipeOutfitMatcher({
  userId,
  memberId,
  items,
}: {
  userId: string;
  memberId: string;
  items: ClothingItem[];
}) {
  const tops = useMemo(() => items.filter((i) => i.category === "Tops"), [items]);
  const bottoms = useMemo(() => items.filter((i) => i.category === "Bottoms"), [items]);

  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedTop = tops.length ? tops[Math.min(topIndex, tops.length - 1)] : null;
  const selectedBottom = bottoms.length ? bottoms[Math.min(bottomIndex, bottoms.length - 1)] : null;

  async function onSave() {
    if (!selectedTop || !selectedBottom) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveOutfit({
        user_id: userId,
        member_id: memberId,
        top_item_id: selectedTop.id,
        bottom_item_id: selectedBottom.id,
        dress_item_id: null,
        shoe_item_id: null,
        trend_card_id: null,
        name: "新穿搭",
        style_tags: Array.from(new Set([...(selectedTop.style_tags ?? []), ...(selectedBottom.style_tags ?? [])])),
        occasion_tags: Array.from(new Set([...(selectedTop.occasion_tags ?? []), ...(selectedBottom.occasion_tags ?? [])])),
        is_favorite: false,
      });
      setStatus("已保存");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <OutfitPreviewCanvas userId={userId} top={selectedTop} bottom={selectedBottom} />

      <Card className="p-5">
        <div className="text-[14px] font-semibold">上装</div>
        <div className="mt-1 text-[12px] text-[var(--dc-muted)]">左右滑动选择上装。</div>
        <div className="mt-4">
          <SwipeDeck
            items={tops}
            initialIndex={0}
            onIndexChange={setTopIndex}
            empty={<div className="text-[13px] text-[var(--dc-muted)]">还没有上装。先去上传一件上装吧。</div>}
            renderCard={(item) => <CutoutClothingCard userId={userId} item={item} selected />}
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-[14px] font-semibold">下装</div>
        <div className="mt-1 text-[12px] text-[var(--dc-muted)]">左右滑动选择下装。</div>
        <div className="mt-4">
          <SwipeDeck
            items={bottoms}
            initialIndex={0}
            onIndexChange={setBottomIndex}
            empty={<div className="text-[13px] text-[var(--dc-muted)]">还没有下装。先去上传一件下装吧。</div>}
            renderCard={(item) => <CutoutClothingCard userId={userId} item={item} selected />}
          />
        </div>
      </Card>

      <Button onClick={onSave} disabled={!selectedTop || !selectedBottom || saving} className="w-full">
        {saving ? "保存中…" : "保存"}
      </Button>
      {status ? <div className="text-center text-[12px] text-[var(--dc-muted)]">{status}</div> : null}
    </div>
  );
}
