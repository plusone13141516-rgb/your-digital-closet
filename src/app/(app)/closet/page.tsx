"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { useHouseholdStore } from "@/stores/householdStore";

export default function ClosetPage() {
  const router = useRouter();
  const { selectedMemberId } = useHouseholdStore();

  useEffect(() => {
    if (!selectedMemberId) return;
    router.replace(`/closet/${selectedMemberId}`);
  }, [router, selectedMemberId]);

  return (
    <div className="grid gap-4">
      <PageHeader title="衣橱" subtitle="选择成员后查看衣橱（当前默认是你自己）。" />
      <Card className="p-5">
        <div className="text-[13px] text-[var(--dc-muted)]">请先选择成员，然后会自动打开对应衣橱。</div>
      </Card>
    </div>
  );
}
