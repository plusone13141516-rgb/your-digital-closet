"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { MemberSwitcher } from "@/components/MemberSwitcher";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SwipeOutfitMatcher } from "@/components/SwipeOutfitMatcher";
import { listClothingItems } from "@/lib/data";
import { saveOutfit } from "@/lib/data";
import { ClothingItem } from "@/lib/types";
import { TrendCard } from "@/lib/types";
import { trendSeedData } from "@/lib/trendSeedData";
import { matchClosetToTrend, matchDressesToTrend } from "@/lib/matching/matchClosetToTrend";
import { OutfitPreviewCanvas } from "@/components/OutfitPreviewCanvas";
import { useAuthStore } from "@/stores/authStore";
import { useHouseholdStore } from "@/stores/householdStore";

export default function MatcherMemberPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params?.memberId;

  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const { selectMember } = useHouseholdStore();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"free" | "trend">("free");
  const [trendMode, setTrendMode] = useState<"twoPiece" | "dress">("twoPiece");

  const [selectedTrendId, setSelectedTrendId] = useState<string>(trendSeedData[0]?.id ?? "");
  const selectedTrend = useMemo<TrendCard | null>(
    () => trendSeedData.find((t) => t.id === selectedTrendId) ?? trendSeedData[0] ?? null,
    [selectedTrendId],
  );
  const [selectedComboIndex, setSelectedComboIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;
    selectMember(memberId);
  }, [memberId, selectMember]);

  useEffect(() => {
    if (!userId || !memberId) return;
    setLoading(true);
    setError(null);
    listClothingItems({ userId, memberId })
      .then((data) => setItems(data))
      .catch((e) => setError(e instanceof Error ? e.message : "加载衣橱失败"))
      .finally(() => setLoading(false));
  }, [memberId, userId]);

  const tops = useMemo(() => items.filter((i) => i.category === "Tops"), [items]);
  const bottoms = useMemo(() => items.filter((i) => i.category === "Bottoms"), [items]);
  const dresses = useMemo(() => items.filter((i) => i.category === "Dresses"), [items]);

  const recommendations = useMemo(() => {
    if (!selectedTrend) return [];
    return matchClosetToTrend({ tops, bottoms, trendCard: selectedTrend, limit: 8 });
  }, [bottoms, selectedTrend, tops]);

  const dressRecommendations = useMemo(() => {
    if (!selectedTrend) return [];
    return matchDressesToTrend({ dresses, trendCard: selectedTrend, limit: 8 });
  }, [dresses, selectedTrend]);

  const selectedCombo = useMemo(() => {
    if (!recommendations.length) return null;
    return recommendations[Math.min(selectedComboIndex, recommendations.length - 1)]!;
  }, [recommendations, selectedComboIndex]);

  async function saveTrendOutfit() {
    if (!selectedCombo || !selectedTrend || !userId || !memberId) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveOutfit({
        user_id: userId,
        member_id: memberId,
        top_item_id: selectedCombo.top.id,
        bottom_item_id: selectedCombo.bottom.id,
        dress_item_id: null,
        shoe_item_id: null,
        trend_card_id: selectedTrend.id,
        name: selectedTrend.trend_name,
        style_tags: Array.from(
          new Set([...(selectedCombo.top.style_tags ?? []), ...(selectedCombo.bottom.style_tags ?? []), ...(selectedTrend.style_tags ?? [])]),
        ),
        occasion_tags: Array.from(
          new Set([
            ...(selectedCombo.top.occasion_tags ?? []),
            ...(selectedCombo.bottom.occasion_tags ?? []),
            ...(selectedTrend.occasion_tags ?? []),
          ]),
        ),
        is_favorite: false,
      });
      setStatus("已保存");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function saveTrendDress(dress: ClothingItem) {
    if (!selectedTrend || !userId || !memberId) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveOutfit({
        user_id: userId,
        member_id: memberId,
        top_item_id: null,
        bottom_item_id: null,
        dress_item_id: dress.id,
        shoe_item_id: null,
        trend_card_id: selectedTrend.id,
        name: selectedTrend.trend_name,
        style_tags: Array.from(new Set([...(dress.style_tags ?? []), ...(selectedTrend.style_tags ?? [])])),
        occasion_tags: Array.from(new Set([...(dress.occasion_tags ?? []), ...(selectedTrend.occasion_tags ?? [])])),
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
      <PageHeader title="搭配" subtitle="用你的衣橱做搭配（不需要人体照）。" right={<MemberSwitcher />} />

      {loading ? (
        <div className="h-[420px] rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] animate-pulse" />
      ) : error ? (
        <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(213,155,106,0.18)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
          {error}
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex gap-2">
            <Button variant={tab === "free" ? "primary" : "ghost"} onClick={() => setTab("free")} className="flex-1">
              自由搭配
            </Button>
            <Button variant={tab === "trend" ? "primary" : "ghost"} onClick={() => setTab("trend")} className="flex-1">
              趋势搭配
            </Button>
          </div>

          {tab === "free" ? (
            !tops.length ? (
              <Card className="p-5">
                <div className="text-[13px] text-[var(--dc-muted)]">至少上传 1 件上装，才能开始搭配。</div>
              </Card>
            ) : !bottoms.length ? (
              <Card className="p-5">
                <div className="text-[13px] text-[var(--dc-muted)]">至少上传 1 件下装，才能开始搭配。</div>
              </Card>
            ) : (
              <SwipeOutfitMatcher userId={userId} memberId={memberId!} items={items} />
            )
          ) : (
            <div className="grid gap-4">
              <Card className="p-5">
                <div className="text-[14px] font-semibold">选择趋势卡</div>
                <div className="mt-2">
                  <Select
                    value={selectedTrendId}
                    onChange={(e) => {
                      const v = (e.target as HTMLSelectElement).value;
                      setSelectedTrendId(v);
                      setSelectedComboIndex(0);
                    }}
                    options={trendSeedData.map((t) => ({ value: t.id, label: t.trend_name }))}
                  />
                </div>
                {selectedTrend ? <div className="mt-3 text-[13px] text-[var(--dc-muted)]">{selectedTrend.summary}</div> : null}
              </Card>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={trendMode === "twoPiece" ? "primary" : "ghost"}
                  onClick={() => setTrendMode("twoPiece")}
                  className="flex-1"
                >
                  两件搭配
                </Button>
                <Button
                  size="sm"
                  variant={trendMode === "dress" ? "primary" : "ghost"}
                  onClick={() => setTrendMode("dress")}
                  className="flex-1"
                >
                  连体衣
                </Button>
              </div>

              {trendMode === "twoPiece" ? (
                selectedCombo ? (
                <div className="grid gap-3">
                  <OutfitPreviewCanvas userId={userId} top={selectedCombo.top} bottom={selectedCombo.bottom} />
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-semibold">推荐组合</div>
                        <div className="mt-1 text-[12px] text-[var(--dc-muted)]">{selectedCombo.explanation}</div>
                      </div>
                      <div className="rounded-full bg-[rgba(244,215,123,0.45)] px-3 py-1 text-[12px] font-semibold text-[var(--dc-primary-ink)]">
                        {Math.round(selectedCombo.score * 100)}%
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {recommendations.map((r, idx) => (
                        <button
                          key={`${r.top.id}-${r.bottom.id}-${idx}`}
                          type="button"
                          onClick={() => setSelectedComboIndex(idx)}
                          className={[
                            "w-full rounded-3xl border px-4 py-3 text-left text-[13px] transition",
                            idx === selectedComboIndex
                              ? "border-[rgba(43,42,38,0.15)] bg-[rgba(244,215,123,0.35)]"
                              : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)]",
                          ].join(" ")}
                        >
                          <div className="font-semibold">
                            {(r.top.name ?? "上装")} + {(r.bottom.name ?? "下装")}
                          </div>
                          <div className="mt-1 text-[12px] text-[var(--dc-muted)]">匹配度 {Math.round(r.score * 100)}%</div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Button onClick={saveTrendOutfit} disabled={saving} className="w-full">
                    {saving ? "保存中…" : "保存"}
                  </Button>
                  {status ? <div className="text-center text-[12px] text-[var(--dc-muted)]">{status}</div> : null}
                </div>
              ) : (
                <Card className="p-5">
                  <div className="text-[13px] text-[var(--dc-muted)]">当前趋势暂无可推荐组合。</div>
                </Card>
              )
              ) : !dressRecommendations.length ? (
                <Card className="p-5">
                  <div className="text-[13px] text-[var(--dc-muted)]">当前趋势暂无可推荐连体衣（请先上传连体衣）。</div>
                </Card>
              ) : (
                <div className="grid gap-3">
                  <OutfitPreviewCanvas userId={userId} top={null} bottom={null} dress={dressRecommendations[0]!.dress} />
                  <Card className="p-5">
                    <div className="text-[14px] font-semibold">推荐连体衣</div>
                    <div className="mt-3 grid gap-2">
                      {dressRecommendations.map((r, idx) => (
                        <div key={r.dress.id} className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold">{r.dress.name ?? "连体衣"}</div>
                              <div className="mt-1 text-[12px] text-[var(--dc-muted)]">{r.explanation}</div>
                            </div>
                            <div className="rounded-full bg-[rgba(244,215,123,0.45)] px-3 py-1 text-[12px] font-semibold text-[var(--dc-primary-ink)]">
                              {Math.round(r.score * 100)}%
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button size="sm" onClick={() => saveTrendDress(r.dress)} disabled={saving} className="w-full">
                              {saving ? "保存中…" : "保存"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {status ? <div className="mt-3 text-center text-[12px] text-[var(--dc-muted)]">{status}</div> : null}
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
