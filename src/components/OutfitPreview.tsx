"use client";

import { useEffect, useState } from "react";
import { ClothingItem } from "@/lib/types";
import { getClothingImageUrl } from "@/lib/data";

export function OutfitPreview({
  userId,
  top,
  bottom,
}: {
  userId: string;
  top: ClothingItem | null;
  bottom: ClothingItem | null;
}) {
  const [topUrl, setTopUrl] = useState<string | null>(null);
  const [bottomUrl, setBottomUrl] = useState<string | null>(null);
  const topPath = top
    ? top.cutout_image_url ?? top.processed_image_path ?? top.image_path ?? top.original_image_url ?? top.original_image_path
    : null;
  const bottomPath = bottom
    ? bottom.cutout_image_url ?? bottom.processed_image_path ?? bottom.image_path ?? bottom.original_image_url ?? bottom.original_image_path
    : null;

  useEffect(() => {
    let mounted = true;
    setTopUrl(null);
    if (!topPath) return;
    getClothingImageUrl(userId, topPath).then((u) => {
      if (mounted) setTopUrl(u);
    });
    return () => {
      mounted = false;
    };
  }, [topPath, userId]);

  useEffect(() => {
    let mounted = true;
    setBottomUrl(null);
    if (!bottomPath) return;
    getClothingImageUrl(userId, bottomPath).then((u) => {
      if (mounted) setBottomUrl(u);
    });
    return () => {
      mounted = false;
    };
  }, [bottomPath, userId]);

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] shadow-[0_18px_50px_rgba(43,42,38,0.12)]">
      <div className="grid grid-rows-2">
        <div className="relative aspect-[4/3] bg-[rgba(244,215,123,0.12)]">
          {topUrl ? (
            <img
              src={topUrl}
              alt={top?.name ?? ""}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-6"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[13px] text-[var(--dc-muted)]">
              请选择上装
            </div>
          )}
        </div>
        <div className="relative aspect-[4/3] bg-[rgba(213,155,106,0.10)]">
          {bottomUrl ? (
            <img
              src={bottomUrl}
              alt={bottom?.name ?? ""}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-6"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-[13px] text-[var(--dc-muted)]">
              请选择下装
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
