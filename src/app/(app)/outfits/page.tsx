"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { useHouseholdStore } from "@/stores/householdStore";

export default function OutfitsIndexPage() {
  const router = useRouter();
  const { selectedMemberId } = useHouseholdStore();

  useEffect(() => {
    if (!selectedMemberId) return;
    router.replace(`/outfits/${selectedMemberId}`);
  }, [router, selectedMemberId]);

  return (
    <div className="grid gap-4">
      <PageHeader title="穿搭" subtitle="你保存的穿搭。" />
      <Card className="p-5">
        <div className="text-[13px] text-[var(--dc-muted)]">先选择成员（当前默认是你自己），再回来查看穿搭。</div>
      </Card>
    </div>
  );
}
