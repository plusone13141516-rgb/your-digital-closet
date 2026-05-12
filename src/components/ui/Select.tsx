"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ className, label, options, id, ...props }: Props) {
  const selectId = id ?? props.name ?? undefined;
  return (
    <label className="grid gap-2 text-[13px] text-[var(--dc-muted)]">
      {label ? <span>{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          "h-12 w-full rounded-2xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.72)] px-4 text-[15px] text-[var(--dc-primary-ink)] outline-none transition focus:ring-4 focus:ring-[var(--dc-ring)]",
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

