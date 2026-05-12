"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { HouseholdMember } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useDemoClosetStore } from "@/stores/demoClosetStore";
import { useHouseholdStore } from "@/stores/householdStore";

const ageOptions = [
  { value: "", label: "年龄段（可选）" },
  { value: "kid", label: "儿童" },
  { value: "teen", label: "青少年" },
  { value: "adult", label: "成人" },
];

export default function HouseholdPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
  const { household, members, selectedMemberId, selectMember, createMember, updateMember, deleteMember } = useHouseholdStore();

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState<string>("");
  const [editing, setEditing] = useState<HouseholdMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!members.length) {
      setCounts({});
      return;
    }

    if (!isSupabaseConfigured()) {
      const items = useDemoClosetStore.getState().items;
      const next: Record<string, number> = {};
      for (const m of members) next[m.id] = items.filter((i) => i.member_id === m.id).length;
      setCounts(next);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let alive = true;
    Promise.all(
      members.map(async (m) => {
        const { count, error } = await supabase
          .from("clothing_items")
          .select("id", { count: "exact", head: true })
          .eq("member_id", m.id)
          .eq("user_id", userId);
        if (error) return [m.id, 0] as const;
        return [m.id, count ?? 0] as const;
      }),
    ).then((pairs) => {
      if (!alive) return;
      setCounts(Object.fromEntries(pairs));
    });

    return () => {
      alive = false;
    };
  }, [members, userId]);

  const headerSubtitle = useMemo(() => {
    const name = household?.name ?? "我的衣橱";
    return `当前是单用户模式（默认成员：我）。`;
  }, [household?.name]);

  async function onCreate() {
    if (!household?.id) return;
    setCreating(true);
    setStatus(null);
    try {
      await createMember({ householdId: household.id, name: newName, age_group: (newAge || null) as HouseholdMember["age_group"] });
      setNewName("");
      setNewAge("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(member: HouseholdMember) {
    setEditing(member);
    setEditName(member.name);
    setEditAge(member.age_group ?? "");
    setStatus(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setCreating(true);
    setStatus(null);
    try {
      await updateMember({
        memberId: editing.id,
        patch: { name: editName.trim() || editing.name, age_group: (editAge || null) as HouseholdMember["age_group"] },
      });
      setEditing(null);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "保存失败");
    } finally {
      setCreating(false);
    }
  }

  async function remove(member: HouseholdMember) {
    setCreating(true);
    setStatus(null);
    try {
      await deleteMember(member.id);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "删除失败");
    } finally {
      setCreating(false);
    }
  }

  function openCloset(memberId: string) {
    selectMember(memberId);
    router.push("/closet");
  }

  return (
    <div className="grid gap-4">
      <PageHeader title="设置" subtitle={headerSubtitle} />

      <div className="grid gap-3">
        {members.length ? (
          members.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <button type="button" onClick={() => openCloset(m.id)} className="min-w-0 text-left">
                  <div className="text-[14px] font-semibold">{m.name}</div>
                  <div className="mt-1 text-[12px] text-[var(--dc-muted)]">
                    {(m.age_group ?? "—").toString()} • {counts[m.id] ?? 0} 件单品
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={selectedMemberId === m.id ? "primary" : "ghost"} onClick={() => openCloset(m.id)}>
                    打开衣橱
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(m)}>
                    编辑
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="danger" onClick={() => remove(m)} disabled={creating}>
                  删除
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-5">
            <div className="text-[14px] font-semibold">还没有成员</div>
            <div className="mt-2 text-[13px] text-[var(--dc-muted)]">创建一个成员后才能开始上传。</div>
          </Card>
        )}
      </div>

      {editing ? (
        <Card className="p-5">
          <div className="text-[14px] font-semibold">编辑成员</div>
          <div className="mt-4 grid gap-4">
            <Input label="姓名" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Select label="年龄段" value={editAge} onChange={(e) => setEditAge(e.target.value)} options={ageOptions} />
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={saveEdit} disabled={creating}>
                保存
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={creating}>
                取消
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <div className="text-[14px] font-semibold">添加成员</div>
          <div className="mt-4 grid gap-4">
            <Input label="姓名" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例如：我" />
            <Select label="年龄段" value={newAge} onChange={(e) => setNewAge(e.target.value)} options={ageOptions} />
            {status ? <div className="text-[13px] text-[var(--dc-muted)]">{status}</div> : null}
            <Button onClick={onCreate} disabled={!newName.trim() || creating || !household?.id} className="w-full">
              添加
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
