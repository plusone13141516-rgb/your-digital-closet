"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ className, selected, ...props }: Props) {
  return (
    <button
      className={cn(
        "h-9 rounded-full border px-4 text-[13px] font-medium transition active:translate-y-[1px]",
        selected
          ? "border-[rgba(43,42,38,0.1)] bg-[rgba(244,215,123,0.6)] text-[var(--dc-primary-ink)]"
          : "border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] text-[var(--dc-muted)] hover:bg-[rgba(255,255,255,0.75)]",
        className,
      )}
      {...props}
    />
  );
}

