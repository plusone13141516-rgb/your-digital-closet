"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuthStore } from "@/stores/authStore";

type ProfileRow = { user_id: string; username: string };

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setProfile({ user_id: "demo-user", username: "demo" });
      return;
    }
    if (!user?.id) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("profiles")
      .select("user_id, username")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setProfile((data as ProfileRow) ?? null);
      });
  }, [user?.id]);

  return (
    <div className="grid gap-4">
      <PageHeader title="我的账号" subtitle="仅展示用户名与邮箱。" />

      <Card className="p-5">
        <div className="grid gap-4">
          <div>
            <div className="text-[12px] text-[var(--dc-muted)]">用户名</div>
            <div className="mt-1 text-[15px] font-semibold">{profile?.username ?? "—"}</div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--dc-muted)]">邮箱</div>
            <div className="mt-1 text-[15px] font-semibold">{user?.email ?? "—"}</div>
          </div>
          {error ? <div className="text-[13px] text-[var(--dc-muted)]">{error}</div> : null}
          <Button onClick={() => signOut()} variant="ghost" className="w-full">
            退出登录
          </Button>
        </div>
      </Card>

      <div className="rounded-3xl border border-[rgba(43,42,38,0.10)] bg-[rgba(255,255,255,0.45)] px-5 py-4 text-[13px] text-[var(--dc-muted)]">
        隐私提示：本应用不支持人脸/人体照片，仅上传衣服单品图。
      </div>
    </div>
  );
}
