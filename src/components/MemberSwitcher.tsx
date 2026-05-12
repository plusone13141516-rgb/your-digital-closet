"use client";

import { useMemo } from "react";
import { useHouseholdStore } from "@/stores/householdStore";
import { cn } from "@/lib/cn";

export function MemberSwitcher({ className }: { className?: string }) {
  // New direction: single user closet (no member switching UI).
  // Keep component to avoid touching multiple pages; it simply renders nothing.
  useHouseholdStore();
  useMemo(() => null, []);
  cn(className);
  return null;
}
