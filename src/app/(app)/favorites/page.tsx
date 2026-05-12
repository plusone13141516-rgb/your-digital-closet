"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getClothingImageUrl, listClothingItems, listFavorites, removeFavorite } from "@/lib/data";
import { ClothingItem, Outfit } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

function OutfitCard({
  userId,
  top,
  bottom,
  onRemove,
}: {
  userId: string;
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  onRemove: () => void;
}) {
  const [topUrl, setTopUrl] = useState<string | null>(null);
  const [bottomUrl, setBottomUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (top?.image_path) {
      getClothingImageUrl(userId, top.image_path).then((u) => {
        if (mounted) setTopUrl(u);
      });
    }
    if (bottom?.image_path) {
      getClothingImageUrl(userId, bottom.image_path).then((u) => {
        if (mounted) setBottomUrl(u);
      });
    }
    return () => {
      mounted = false;
    };
  }, [bottom?.id, bottom?.image_path, top?.id, top?.image_path, userId]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-[92px_1fr] gap-4">
        <div className="overflow-hidden rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.65)]">
          <div className="relative aspect-square">
            {topUrl ? <img src={topUrl} alt={top?.name ?? ""} className="absolute inset-0 h-full w-full object-contain p-3" /> : null}
          </div>
          <div className="h-px bg-[rgba(43,42,38,0.10)]" />
          <div className="relative aspect-square">
            {bottomUrl ? (
              <img
                src={bottomUrl}
                alt={bottom?.name ?? ""}
                className="absolute inset-0 h-full w-full object-contain p-3"
              />
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] text-[var(--dc-muted)]">Favorite outfit</div>
          <div className="mt-1 truncate text-[14px] font-semibold">{top?.name ?? "Top"}</div>
          <div className="truncate text-[14px] font-semibold">{bottom?.name ?? "Bottom"}</div>
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Promise.all([listClothingItems(userId), listFavorites(userId)])
      .then(([itemsData, outfitsData]) => {
        setItems(itemsData);
        setOutfits(outfitsData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load favorites."))
      .finally(() => setLoading(false));
  }, [userId]);

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  async function onRemove(outfitId: string) {
    await removeFavorite(userId, outfitId);
    setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="Favorites" subtitle="Your saved top + bottom combinations." />

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[132px] rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(213,155,106,0.18)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
          {error}
        </div>
      ) : outfits.length === 0 ? (
        <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] px-5 py-6 text-[13px] text-[var(--dc-muted)]">
          No favorites yet. Save an outfit from the Outfit Builder.
        </div>
      ) : (
        <div className="grid gap-3">
          {outfits.map((o) => (
            <OutfitCard
              key={o.id}
              userId={userId}
              top={itemById.get(o.top_item_id) ?? null}
              bottom={itemById.get(o.bottom_item_id) ?? null}
              onRemove={() => onRemove(o.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
