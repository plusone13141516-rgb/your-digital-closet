"use client";

import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(244,215,123,0.7)] shadow-[0_12px_26px_rgba(213,155,106,0.18)] border border-[rgba(43,42,38,0.06)]">
        <span className="font-[family-name:var(--font-display)] text-[18px] text-[var(--dc-primary-ink)]">
          DC
        </span>
      </div>
      <div className="leading-tight">
        <div className="font-[family-name:var(--font-display)] text-[18px] tracking-tight">数字衣橱</div>
        <div className="text-[12px] text-[var(--dc-muted)]">上装 + 下装 + 连体衣（仅单品图）</div>
      </div>
    </div>
  );
}
