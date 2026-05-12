"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClothingItem } from "@/lib/types";
import { getClothingImageUrl } from "@/lib/data";
import { cn } from "@/lib/cn";
import { labelCategory, labelColorTag, labelSeasonTag } from "@/lib/labels";

export function ItemCard({ userId, item }: { userId: string; item: ClothingItem }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 列表卡片优先用缩略图（image_path 现在会指向 thumb_512）
  const path =
    item.image_path ??
    item.image_url ??
    item.cutout_image_url ??
    item.processed_image_path ??
    item.original_image_url ??
    item.original_image_path ??
    "";

  useEffect(() => {
    let mounted = true;
    getClothingImageUrl(userId, path)
      .then((u) => {
        if (mounted) setUrl(u);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "图片加载失败");
      });
    return () => {
      mounted = false;
    };
  }, [path, userId]);

  return (
    <Link
      href={`/closet/${item.member_id}`}
      className="group block rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.45)] shadow-[0_14px_30px_rgba(43,42,38,0.08)] transition active:translate-y-[1px]"
    >
      <div className="relative aspect-square overflow-hidden rounded-[22px] m-2 bg-[rgba(255,255,255,0.6)]">
        {url ? (
          <img
            src={url}
            alt={item.name ?? ""}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-3"
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-[rgba(244,215,123,0.18)]" />
        )}
        <div
          className={cn(
            "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-medium border",
            item.category === "Tops"
              ? "bg-[rgba(244,215,123,0.75)] border-[rgba(43,42,38,0.08)]"
              : item.category === "Bottoms"
                ? "bg-[rgba(213,155,106,0.25)] border-[rgba(43,42,38,0.1)]"
                : "bg-[rgba(43,42,38,0.08)] border-[rgba(43,42,38,0.12)]",
          )}
        >
          {labelCategory(item.category)}
        </div>
      </div>
      <div className="px-4 pb-4 pt-1">
        <div className="truncate text-[14px] font-semibold">{item.name ?? "未命名"}</div>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--dc-muted)]">
          <span className="truncate">{item.color ? labelColorTag(item.color) : "—"}</span>
          <span className="opacity-40">•</span>
          <span className="truncate">{(item.season_tags ?? [])[0] ? labelSeasonTag((item.season_tags ?? [])[0]!) : "—"}</span>
        </div>
        {error ? <div className="mt-2 text-[12px] text-[var(--dc-muted)]">{error}</div> : null}
      </div>
    </Link>
  );
}
