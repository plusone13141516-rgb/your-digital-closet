"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, label, id, ...props }: Props) {
  const inputId = id ?? props.name ?? undefined;
  return (
    <label className="grid gap-2 text-[13px] text-[var(--dc-muted)]">
      {label ? <span>{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-2xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.72)] px-4 text-[15px] text-[var(--dc-primary-ink)] outline-none transition focus:ring-4 focus:ring-[var(--dc-ring)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}

