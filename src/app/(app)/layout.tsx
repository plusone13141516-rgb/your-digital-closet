"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { isSupabaseConfigured } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { useDemoClosetStore } from "@/stores/demoClosetStore";
import { useHouseholdStore } from "@/stores/householdStore";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isReady, user, init } = useAuthStore();
  const { init: initHousehold } = useHouseholdStore();

  useEffect(() => {
    init();
    useDemoClosetStore.getState().hydrate();
  }, [init]);

  useEffect(() => {
    if (!user?.id) return;
    initHousehold(user.id);
  }, [initHousehold, user?.id]);

  useEffect(() => {
    if (!isReady) return;
    if (!isSupabaseConfigured()) return;
    if (!user) router.replace("/auth");
  }, [isReady, router, user]);

  if (isSupabaseConfigured() && !isReady) {
    return (
      <div className="flex flex-1 justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="h-10 w-48 rounded-2xl bg-[rgba(43,42,38,0.08)] animate-pulse" />
          <div className="mt-4 h-40 rounded-3xl bg-[rgba(43,42,38,0.06)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isSupabaseConfigured() && isReady && !user) return null;

  return (
    <div className="flex flex-1 justify-center px-4 pb-28 pt-6">
      <div className="w-full max-w-md">
        {!isSupabaseConfigured() ? (
          <div className="mb-4 rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(244,215,123,0.35)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
            当前为演示模式（未配置 Supabase 环境变量）。上传内容仅保存在本设备。
          </div>
        ) : null}
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
