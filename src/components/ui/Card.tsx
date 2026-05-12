"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[0_18px_40px_rgba(43,42,38,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

