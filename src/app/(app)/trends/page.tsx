"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trendSeedData } from "@/lib/trendSeedData";
import { labelColorTag, labelKeyword, labelOccasionTag, labelSeasonTag, labelStyleTag } from "@/lib/labels";

const groups: Array<{ title: string; ids: string[] }> = [
  {
    title: "都市坐标系列（区域代表风）",
    ids: [
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d01", // West Village
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d03", // Korean
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d04", // French
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d16", // Tokyo
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d17", // Hong Kong
    ],
  },
  {
    title: "美学意向系列（核心氛围感）",
    ids: [
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d02", // Clean Girl
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d11", // Quiet Luxury
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d05", // Old Money
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d13", // Ballet Flat
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d14", // Sporty
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d09", // Monochrome
    ],
  },
  {
    title: "生活场景系列（功能穿搭逻辑）",
    ids: [
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d10", // City Walk
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d18", // Office
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d19", // Date Night
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d20", // Coffee Run
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d12", // Linen
    ],
  },
  {
    title: "视觉构成系列（单品组合逻辑）",
    ids: [
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d15", // Neutral Layers
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d06", // Denim-on-Denim
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d07", // White + Skirt
      "2c9a2f9d-7f2c-4d6c-9f14-5a2d0d7f2d08", // Oversized Shirt
    ],
  },
];

export default function TrendsPage() {
  const byId = new Map(trendSeedData.map((t) => [t.id, t]));

  return (
    <div className="grid gap-4">
      <PageHeader
        title="趋势灵感"
        subtitle="MVP 趋势卡（手动写入）。不抓取网站内容，不搬运版权图片/文章。"
        right={
          <Link href="/matcher">
            <Button size="sm" variant="ghost">
              去搭配 →
            </Button>
          </Link>
        }
      />

      <div className="grid gap-5">
        {groups.map((g) => (
          <div key={g.title} className="grid gap-3">
            <div className="px-1 text-[14px] font-semibold text-[var(--dc-primary-ink)]">{g.title}</div>
            <div className="grid grid-cols-1 gap-3">
              {g.ids.map((id) => {
                const t = byId.get(id);
                if (!t) return null;
                return (
                  <Card key={t.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[16px] font-semibold">{t.trend_name}</div>
                        <div className="mt-1 text-[13px] leading-6 text-[var(--dc-muted)]">{t.summary}</div>
                      </div>
                      <div className="shrink-0 rounded-3xl border border-[rgba(43,42,38,0.10)] bg-[rgba(244,215,123,0.35)] px-3 py-2 text-[12px] font-medium text-[var(--dc-primary-ink)]">
                        趋势
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="flex flex-wrap gap-2">
                        {(t.style_tags ?? []).slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] px-3 py-1 text-[12px] text-[var(--dc-primary-ink)]"
                          >
                            {labelStyleTag(tag)}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(t.color_tags ?? []).slice(0, 6).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[rgba(43,42,38,0.10)] bg-[rgba(255,255,255,0.65)] px-3 py-1 text-[12px] text-[var(--dc-muted)]"
                          >
                            {labelColorTag(tag)}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[12px] text-[var(--dc-muted)]">
                        <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] p-3">
                          <div className="font-semibold text-[var(--dc-primary-ink)]">上装关键词</div>
                          <div className="mt-1">{(t.top_keywords ?? []).slice(0, 4).map(labelKeyword).join(" • ") || "—"}</div>
                        </div>
                        <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] p-3">
                          <div className="font-semibold text-[var(--dc-primary-ink)]">下装关键词</div>
                          <div className="mt-1">{(t.bottom_keywords ?? []).slice(0, 4).map(labelKeyword).join(" • ") || "—"}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[12px] text-[var(--dc-muted)]">
                        {(t.occasion_tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] px-3 py-1">
                            {labelOccasionTag(tag)}
                          </span>
                        ))}
                        {(t.season_tags ?? []).slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] px-3 py-1">
                            {labelSeasonTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
