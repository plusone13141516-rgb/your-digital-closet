"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ClothingCategory, ClothingItem } from "@/lib/types";
import { deleteClothingItem, getClothingImageUrl, getClothingItemById, updateClothingItem } from "@/lib/data";
import { useAuthStore } from "@/stores/authStore";

const tagOptions = ["casual", "formal", "sporty", "streetwear", "work", "party"];

export default function ClosetItemPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!userId || !id) return;
    setLoading(true);
    setStatus(null);
    getClothingItemById(userId, id)
      .then((data) => {
        setItem(data);
        if (data) {
          setName(data.name);
          setCategory(data.category);
          setColor(data.color ?? "");
          setSeason(data.season ?? "");
          setTags(data.style_tags ?? []);
        }
        return data;
      })
      .then((data) => {
        if (!data) return;
        return getClothingImageUrl(userId, data.image_path).then((u) => setImageUrl(u));
      })
      .finally(() => setLoading(false));
  }, [id, userId]);

  const isDirty = useMemo(() => {
    if (!item) return false;
    if (name !== item.name) return true;
    if (category !== item.category) return true;
    if ((color || null) !== (item.color ?? null)) return true;
    if ((season || null) !== (item.season ?? null)) return true;
    if (JSON.stringify(tags.slice().sort()) !== JSON.stringify((item.style_tags ?? []).slice().sort())) return true;
    return false;
  }, [category, color, item, name, season, tags]);

  async function save() {
    if (!item) return;
    setSaving(true);
    setStatus(null);
    try {
      const updated = await updateClothingItem({
        userId,
        itemId: item.id,
        patch: {
          name: name.trim() || item.name,
          category,
          color: color.trim() || null,
          season: season.trim() || null,
          style_tags: tags,
        },
      });
      setItem(updated);
      setStatus("Saved.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!item) return;
    setSaving(true);
    setStatus(null);
    try {
      await deleteClothingItem(userId, item);
      router.replace("/closet");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="h-8 w-40 rounded-2xl bg-[rgba(43,42,38,0.08)] animate-pulse" />
        <div className="aspect-square rounded-3xl bg-[rgba(43,42,38,0.06)] animate-pulse" />
        <div className="h-40 rounded-3xl bg-[rgba(43,42,38,0.06)] animate-pulse" />
      </div>
    );
  }

  if (!item) {
    return (
      <Card className="p-5">
        <div className="text-[14px] font-semibold">Item not found</div>
        <div className="mt-2 text-[13px] text-[var(--dc-muted)]">This item may have been deleted.</div>
        <div className="mt-5">
          <Link href="/closet">
            <Button variant="ghost">Back to closet</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="Edit item" subtitle="Update category or metadata anytime." />

      <Card className="p-3">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.65)]">
          {imageUrl ? <img src={imageUrl} alt={item.name} className="absolute inset-0 h-full w-full object-contain p-6" /> : null}
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid gap-4">
          <Input label="Clothing name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ClothingCategory)}
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
            ]}
          />
          <Input label="Color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., cream" />
          <Input
            label="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="spring / summer / fall / winter / all-season"
          />

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">Style tags</div>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((t) => {
                const selected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTags(selected ? tags.filter((x) => x !== t) : [...tags, t])}
                    className={[
                      "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
                      selected
                        ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)]"
                        : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {status ? <div className="text-[13px] text-[var(--dc-muted)]">{status}</div> : null}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={save} disabled={!isDirty || saving}>
              Save
            </Button>
            <Button onClick={remove} disabled={saving} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <Link href="/closet" className="text-[13px] text-[var(--dc-muted)] underline underline-offset-4">
          Back to closet
        </Link>
      </div>
    </div>
  );
}
