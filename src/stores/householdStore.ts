import { create } from "zustand";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Household, HouseholdMember } from "@/lib/types";
import { uuidv4 } from "@/lib/uuid";
import { useDemoClosetStore } from "@/stores/demoClosetStore";

type HouseholdState = {
  isReady: boolean;
  household: Household | null;
  members: HouseholdMember[];
  selectedMemberId: string | null;
  error: string | null;
  init: (userId: string) => Promise<void>;
  selectMember: (memberId: string) => void;
  createMember: (input: { householdId: string; name: string; age_group: HouseholdMember["age_group"] }) => Promise<void>;
  updateMember: (input: {
    memberId: string;
    patch: Partial<Pick<HouseholdMember, "name" | "age_group">>;
  }) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
};

const selectedKey = "dc-selected-member";

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  isReady: false,
  household: null,
  members: [],
  selectedMemberId: null,
  error: null,
  init: async (userId) => {
    if (!userId) return;

    if (!isSupabaseConfigured()) {
      const demo = useDemoClosetStore.getState();
      set({
        household: demo.household,
        members: demo.members,
        selectedMemberId: demo.selectedMemberId,
        isReady: true,
        error: null,
      });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const stored =
      typeof window !== "undefined" ? (window.localStorage.getItem(selectedKey) ? window.localStorage.getItem(selectedKey) : null) : null;

    const household = await (async () => {
      const { data, error } = await supabase.from("households").select("*").eq("owner_id", userId).order("created_at").limit(1);
      if (error) throw new Error(error.message);
      if (data && data.length) return data[0] as Household;
      const { data: created, error: insertError } = await supabase
        .from("households")
        .insert({ owner_id: userId, name: "我的衣橱" })
        .select("*")
        .single();
      if (insertError) throw new Error(insertError.message);
      return created as Household;
    })();

    const { data: members, error: membersError } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", household.id)
      .order("created_at");
    if (membersError) throw new Error(membersError.message);

    let list = (members ?? []) as HouseholdMember[];
    // New direction: a single user closet. Ensure at least one member exists.
    if (list.length === 0) {
      const { data: createdMember, error: insertMemberError } = await supabase
        .from("household_members")
        .insert({ household_id: household.id, name: "Me", age_group: null })
        .select("*")
        .single();
      if (insertMemberError) throw new Error(insertMemberError.message);
      list = [createdMember as HouseholdMember];
    }

    const selected = (stored && list.some((m) => m.id === stored) ? stored : null) ?? list[0]?.id ?? null;

    set({ household, members: list, selectedMemberId: selected, isReady: true, error: null });
  },
  selectMember: (memberId) => {
    if (!memberId) return;
    if (!isSupabaseConfigured()) {
      useDemoClosetStore.getState().selectMember(memberId);
    }
    set({ selectedMemberId: memberId });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(selectedKey, memberId);
    }
  },
  createMember: async ({ householdId, name, age_group }) => {
    if (!name.trim()) return;
    if (!isSupabaseConfigured()) {
      const member: HouseholdMember = {
        id: `demo-member-${uuidv4()}`,
        household_id: householdId,
        name: name.trim(),
        age_group: age_group ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      useDemoClosetStore.getState().upsertMember(member);
      set({ members: useDemoClosetStore.getState().members });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("household_members")
      .insert({ household_id: householdId, name: name.trim(), age_group })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const next = [...get().members, data as HouseholdMember];
    set({ members: next });
    if (!get().selectedMemberId) get().selectMember((data as HouseholdMember).id);
  },
  updateMember: async ({ memberId, patch }) => {
    if (!memberId) return;
    if (!isSupabaseConfigured()) {
      const current = useDemoClosetStore.getState().members.find((m) => m.id === memberId);
      if (!current) return;
      const next: HouseholdMember = { ...current, ...patch, updated_at: new Date().toISOString() };
      useDemoClosetStore.getState().upsertMember(next);
      set({ members: useDemoClosetStore.getState().members });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("household_members")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", memberId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const members = get().members.map((m) => (m.id === memberId ? (data as HouseholdMember) : m));
    set({ members });
  },
  deleteMember: async (memberId) => {
    if (!memberId) return;
    if (!isSupabaseConfigured()) {
      useDemoClosetStore.getState().deleteMember(memberId);
      const demo = useDemoClosetStore.getState();
      set({ members: demo.members, selectedMemberId: demo.selectedMemberId });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("household_members").delete().eq("id", memberId);
    if (error) throw new Error(error.message);
    const members = get().members.filter((m) => m.id !== memberId);
    const selected = get().selectedMemberId === memberId ? members[0]?.id ?? null : get().selectedMemberId;
    set({ members, selectedMemberId: selected });
    if (selected) get().selectMember(selected);
  },
}));
