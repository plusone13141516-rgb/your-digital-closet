"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { getClothingImageUrl } from "@/lib/data";
import { ClothingItem } from "@/lib/types";

function pickImage(item: ClothingItem | null) {
  if (!item) return null;
  return item.image_url || item.image_path || item.cutout_image_url || item.processed_image_path || item.original_image_url || item.original_image_path || null;
}

export function OutfitPreviewCanvas({
  userId,
  top,
  bottom,
  dress,
}: {
  userId: string;
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  dress?: ClothingItem | null;
}) {
  const [topUrl, setTopUrl] = useState<string | null>(null);
  const [bottomUrl, setBottomUrl] = useState<string | null>(null);
  const [dressUrl, setDressUrl] = useState<string | null>(null);

  const topPath = useMemo(() => pickImage(top), [top]);
  const bottomPath = useMemo(() => pickImage(bottom), [bottom]);
  const dressPath = useMemo(() => pickImage(dress ?? null), [dress]);

  useEffect(() => {
    let alive = true;
    setTopUrl(null);
    if (!topPath) return;
    getClothingImageUrl(userId, topPath).then((u) => {
      if (alive) setTopUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [topPath, userId]);

  useEffect(() => {
    let alive = true;
    setBottomUrl(null);
    if (!bottomPath) return;
    getClothingImageUrl(userId, bottomPath).then((u) => {
      if (alive) setBottomUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [bottomPath, userId]);

  useEffect(() => {
    let alive = true;
    setDressUrl(null);
    if (!dressPath) return;
    getClothingImageUrl(userId, dressPath).then((u) => {
      if (alive) setDressUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [dressPath, userId]);

  return (
    <Card className="p-5">
      <div className="text-[14px] font-semibold">穿搭预览</div>
      <div className="mt-1 text-[12px] text-[var(--dc-muted)]">只展示衣服单品图，不需要人体照。</div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.6)]">
        {dress ? (
          <div className="relative aspect-square">
            {dressUrl ? (
              <img
                src={dressUrl}
                alt={dress?.name ?? ""}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
            ) : (
              <div className="grid h-full place-items-center text-[13px] text-[var(--dc-muted)]">请选择连体衣</div>
            )}
          </div>
        ) : (
          <>
            <div className="relative aspect-square">
              {topUrl ? (
                <img
                  src={topUrl}
                  alt={top?.name ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-4"
                />
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-[var(--dc-muted)]">请选择上装</div>
              )}
            </div>
            <div className="h-px bg-[rgba(43,42,38,0.10)]" />
            <div className="relative aspect-square">
              {bottomUrl ? (
                <img
                  src={bottomUrl}
                  alt={bottom?.name ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-4"
                />
              ) : (
                <div className="grid h-full place-items-center text-[13px] text-[var(--dc-muted)]">请选择下装</div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
