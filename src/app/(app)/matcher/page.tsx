"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { useHouseholdStore } from "@/stores/householdStore";

export default function MatcherIndexPage() {
  const router = useRouter();
  const { selectedMemberId } = useHouseholdStore();

  useEffect(() => {
    if (!selectedMemberId) return;
    router.replace(`/matcher/${selectedMemberId}`);
  }, [router, selectedMemberId]);

  return (
    <div className="grid gap-4">
      <PageHeader title="搭配" subtitle="自由搭配 + 趋势搭配（不需要人体照）。" />
      <Card className="p-5">
        <div className="text-[13px] text-[var(--dc-muted)]">
          先在「设置」里选择成员（当前默认是你自己），再回来进行搭配。
        </div>
      </Card>
    </div>
  );
}
