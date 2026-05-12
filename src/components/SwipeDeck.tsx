"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type SwipeDeckProps<T> = {
  items: T[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  renderCard: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
  className?: string;
};

export function SwipeDeck<T>({ items, initialIndex = 0, onIndexChange, renderCard, empty, className }: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const deltaX = useRef<number>(0);

  const safeIndex = useMemo(() => {
    if (!items.length) return 0;
    return Math.max(0, Math.min(items.length - 1, index));
  }, [index, items.length]);

  useEffect(() => {
    if (!items.length) return;
    setIndex(Math.max(0, Math.min(items.length - 1, initialIndex)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    onIndexChange?.(safeIndex);
  }, [onIndexChange, safeIndex]);

  function prev() {
    if (!items.length) return;
    setIndex((v) => (v - 1 + items.length) % items.length);
  }

  function next() {
    if (!items.length) return;
    setIndex((v) => (v + 1) % items.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0]?.clientX ?? null;
    deltaX.current = 0;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    const x = e.touches[0]?.clientX ?? startX.current;
    deltaX.current = x - startX.current;
  }

  function onTouchEnd() {
    if (startX.current == null) return;
    const dx = deltaX.current;
    startX.current = null;
    deltaX.current = 0;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) prev();
    else next();
  }

  if (!items.length) {
    return <div className={cn("rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.55)] p-5", className)}>{empty}</div>;
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="select-none"
      >
        {renderCard(items[safeIndex]!, safeIndex)}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button size="sm" variant="ghost" onClick={prev}>
          ←
        </Button>
        <div className="text-[12px] text-[var(--dc-muted)]">
          {safeIndex + 1} / {items.length}
        </div>
        <Button size="sm" variant="ghost" onClick={next}>
          →
        </Button>
      </div>
    </div>
  );
}

