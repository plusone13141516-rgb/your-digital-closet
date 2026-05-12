"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberSwitcher } from "@/components/MemberSwitcher";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Crop34Modal } from "@/components/Crop34Modal";
import { createClothingItem } from "@/lib/data";
import { ClothingCategory } from "@/lib/types";
import { generateThumbs } from "@/lib/imageThumb";
import { analyzeUploadMetadata } from "@/lib/analysis";
import { useAuthStore } from "@/stores/authStore";
import { useHouseholdStore } from "@/stores/householdStore";

const categoryOptions: Array<{ value: ClothingCategory; label: string }> = [
  { value: "Tops", label: "上装" },
  { value: "Bottoms", label: "下装" },
  { value: "Dresses", label: "连体衣" },
];
const styleTagOptions: Array<{ value: string; label: string }> = [
  { value: "casual", label: "休闲" },
  { value: "work", label: "通勤" },
  { value: "formal", label: "正式" },
  { value: "streetwear", label: "街头" },
  { value: "sporty", label: "运动" },
  { value: "party", label: "约会/聚会" },
];
const occasionTagOptions: Array<{ value: string; label: string }> = [
  { value: "work", label: "上班" },
  { value: "weekend", label: "周末" },
  { value: "date", label: "约会" },
  { value: "party", label: "聚会" },
  { value: "travel", label: "旅行" },
  { value: "sport", label: "运动" },
];
const seasonTagOptions: Array<{ value: string; label: string }> = [
  { value: "spring", label: "春" },
  { value: "summer", label: "夏" },
  { value: "fall", label: "秋" },
  { value: "winter", label: "冬" },
  { value: "all-season", label: "四季" },
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((t) => t !== value) : [...list, value];
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const { selectedMemberId } = useHouseholdStore();

  const [file, setFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("Tops");
  const [color, setColor] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [occasionTags, setOccasionTags] = useState<string[]>([]);
  const [seasonTags, setSeasonTags] = useState<string[]>([]);
  const [thumb256, setThumb256] = useState<File | null>(null);
  const [thumb512, setThumb512] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [touched, setTouched] = useState({
    category: false,
    color: false,
    style: false,
    occasion: false,
    season: false,
  });

  const canSave = useMemo(() => Boolean(userId && selectedMemberId && file), [file, selectedMemberId, userId]);

  useEffect(() => {
    return () => {
      // cleanup on unmount (best effort)
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function runAutoTagDetection(targetFile: File, force = false) {
    try {
      setDetecting(true);
      const meta = await analyzeUploadMetadata({ file: targetFile, filenameHint: targetFile.name });
      if (force || !touched.category) setCategory(meta.category as ClothingCategory);
      if (force || !touched.color) if (meta.color && meta.color !== "unknown") setColor(meta.color);
      if (force || !touched.style) if (meta.style_tags?.length) setStyleTags(meta.style_tags);
      if (force || !touched.occasion) if (meta.occasion_tags?.length) setOccasionTags(meta.occasion_tags);
      if (force || !touched.season) if (meta.season_tags?.length) setSeasonTags(meta.season_tags);
    } catch {
      // ignore (best-effort)
    } finally {
      setDetecting(false);
    }
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setStatus(null);
    setFile(next);
    setOriginalFile(next);
    setThumb256(null);
    setThumb512(null);
    setStyleTags([]);
    setOccasionTags([]);
    setSeasonTags([]);
    setTouched({ category: false, color: false, style: false, occasion: false, season: false });
    if (!next) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
    if (!name) setName(next.name.replace(/\.[^/.]+$/, ""));

    // open crop helper by default
    setCropOpen(true);

    // generate thumbs (for closet grid) on current file; will regenerate after crop apply
    void generateThumbs({ file: next })
      .then((t) => {
        setThumb256(t.thumb256);
        setThumb512(t.thumb512);
      })
      .catch(() => {
        setThumb256(null);
        setThumb512(null);
      });

    void runAutoTagDetection(next, true);
  }

  async function onApplyCrop(cropped: File) {
    setStatus(null);
    setFile(cropped);
    const url = URL.createObjectURL(cropped);
    setPreviewUrl(url);
    void generateThumbs({ file: cropped })
      .then((t) => {
        setThumb256(t.thumb256);
        setThumb512(t.thumb512);
      })
      .catch(() => {
        setThumb256(null);
        setThumb512(null);
      });
    void runAutoTagDetection(cropped, true);
  }

  async function onSave() {
    if (!userId || !selectedMemberId || !file) return;
    setSaving(true);
    setStatus(null);
    try {
      await createClothingItem({
        userId,
        memberId: selectedMemberId,
        category,
        imageFile: file,
        name: name.trim() || null,
        color: color.trim() || null,
        styleTags,
        occasionTags,
        seasonTags,
        thumb256File: thumb256,
        thumb512File: thumb512,
      });

      router.push(`/closet/${selectedMemberId}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="上传" subtitle="上传衣服单品图（不需要人体照/不生成模特）。" right={<MemberSwitcher />} />

      <Card className="p-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">衣服图片</div>
            <input
              type="file"
              accept="image/*"
              onChange={onPickFile}
              className="block w-full text-[13px] text-[var(--dc-muted)] file:mr-4 file:rounded-2xl file:border-0 file:bg-[rgba(244,215,123,0.65)] file:px-4 file:py-3 file:text-[13px] file:font-medium file:text-[var(--dc-primary-ink)]"
            />
            <div className="text-[12px] text-[var(--dc-muted)]">建议上传已抠图图片（透明背景更佳），但不强制。</div>
            {file ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setCropOpen(true)}>
                  裁剪为 3:4
                </Button>
                <Button size="sm" variant="ghost" onClick={() => file && runAutoTagDetection(file, true)} disabled={detecting}>
                  {detecting ? "识别中…" : "自动识别 tags"}
                </Button>
              </div>
            ) : null}
          </div>

          {previewUrl ? (
            <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.65)] p-3">
              <div className="text-[13px] text-[var(--dc-muted)]">预览</div>
              <div
                className="relative mt-3 aspect-square overflow-hidden rounded-3xl"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(43,42,38,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(43,42,38,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(43,42,38,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(43,42,38,0.06) 75%)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                }}
              >
                <img src={previewUrl} alt="Preview" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-6" />
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">名称（可选）</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：白色T恤" />
          </div>

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">分类</div>
            <Select
              value={category}
              options={categoryOptions}
              onChange={(e) => {
                setTouched((t) => ({ ...t, category: true }));
                setCategory((e.target as HTMLSelectElement).value as ClothingCategory);
              }}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">颜色（可选）</div>
            <Input
              value={color}
              onChange={(e) => {
                setTouched((t) => ({ ...t, color: true }));
                setColor(e.target.value);
              }}
              placeholder="例如：白色 / 藏青 / 米色"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">风格标签（可选）</div>
            <div className="flex flex-wrap gap-2">
              {styleTagOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTouched((t) => ({ ...t, style: true }));
                    setStyleTags((v) => toggle(v, value));
                  }}
                  className={[
                    "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
                    styleTags.includes(value)
                      ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)]"
                      : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">场景标签（可选）</div>
            <div className="flex flex-wrap gap-2">
              {occasionTagOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTouched((t) => ({ ...t, occasion: true }));
                    setOccasionTags((v) => toggle(v, value));
                  }}
                  className={[
                    "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
                    occasionTags.includes(value)
                      ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)]"
                      : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-[13px] text-[var(--dc-muted)]">季节标签（可选）</div>
            <div className="flex flex-wrap gap-2">
              {seasonTagOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTouched((t) => ({ ...t, season: true }));
                    setSeasonTags((v) => toggle(v, value));
                  }}
                  className={[
                    "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
                    seasonTags.includes(value)
                      ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)]"
                      : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={onSave} disabled={!canSave || saving} className="w-full">
            {saving ? "保存中…" : "保存到衣橱"}
          </Button>

          {status ? (
            <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(255,255,255,0.55)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
              {status}
            </div>
          ) : null}
        </div>
      </Card>

      {originalFile ? (
        <Crop34Modal file={originalFile} open={cropOpen} onClose={() => setCropOpen(false)} onApply={onApplyCrop} />
      ) : null}
    </div>
  );
}
