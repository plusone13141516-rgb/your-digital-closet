"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "sm";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--dc-ring)]";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-[var(--dc-primary)] text-[var(--dc-primary-ink)] shadow-[0_10px_30px_rgba(213,155,106,0.18)] hover:brightness-[0.98] border border-[rgba(43,42,38,0.06)]",
    ghost:
      "bg-transparent text-[var(--dc-primary-ink)] border border-[var(--dc-border)] hover:bg-[rgba(255,255,255,0.55)]",
    danger:
      "bg-[#f3c1b3] text-[var(--dc-primary-ink)] border border-[rgba(43,42,38,0.12)] hover:brightness-[0.98]",
  };

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    md: "h-12 px-5 text-[15px]",
    sm: "h-10 px-4 text-[14px]",
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

