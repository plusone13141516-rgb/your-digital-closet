"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Upload, Sparkles, WandSparkles, SwatchBook } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/closet", label: "衣橱", Icon: Shirt },
  { href: "/upload", label: "上传", Icon: Upload },
  { href: "/trends", label: "趋势", Icon: SwatchBook },
  { href: "/matcher", label: "搭配", Icon: WandSparkles },
  { href: "/outfits", label: "穿搭", Icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4">
      <div className="rounded-[26px] border border-[rgba(43,42,38,0.14)] bg-[rgba(255,252,242,0.82)] backdrop-blur-xl shadow-[0_18px_50px_rgba(43,42,38,0.18)]">
        <div className="grid grid-cols-5">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] transition",
                  active ? "text-[var(--dc-primary-ink)]" : "text-[var(--dc-muted)]",
                )}
              >
                <div
                  className={cn(
                    "grid h-9 w-11 place-items-center rounded-2xl transition",
                    active ? "bg-[rgba(244,215,123,0.65)]" : "bg-transparent",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "opacity-100" : "opacity-90")} />
                </div>
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
