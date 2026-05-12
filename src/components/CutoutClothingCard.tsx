"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { getClothingImageUrl } from "@/lib/data";
import { ClothingItem } from "@/lib/types";
import { cn } from "@/lib/cn";
import { labelCategory, labelColorTag } from "@/lib/labels";

function pickBestImagePath(item: ClothingItem) {
  return (
    item.image_path ||
    item.image_url ||
    item.cutout_image_url ||
    item.processed_image_path ||
    item.original_image_url ||
    item.original_image_path ||
    ""
  );
}

export function CutoutClothingCard({
  userId,
  item,
  selected,
  className,
}: {
  userId: string;
  item: ClothingItem;
  selected?: boolean;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  const path = useMemo(() => pickBestImagePath(item), [item]);

  useEffect(() => {
    let alive = true;
    if (!path) return;
    getClothingImageUrl(userId, path).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [path, userId]);

  return (
    <Card
      className={cn(
        "p-4 transition",
        selected ? "border-[rgba(43,42,38,0.20)] bg-[rgba(244,215,123,0.24)]" : "bg-[rgba(255,255,255,0.55)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.75)]">
        {url ? (
          <img
            src={url}
            alt={item.name ?? ""}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-6"
          />
        ) : null}
      </div>
      <div className="mt-3">
        <div className="truncate text-[13px] font-semibold">{item.name ?? "未命名"}</div>
        <div className="mt-1 text-[12px] text-[var(--dc-muted)]">
          {labelCategory(item.category)} • {item.color ? labelColorTag(item.color) : "—"}
        </div>
      </div>
    </Card>
  );
}
