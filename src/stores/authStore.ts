import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthState = {
  isReady: boolean;
  session: Session | null;
  user: User | null;
  error: string | null;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isReady: false,
  session: null,
  user: null,
  error: null,
  init: async () => {
    if (!isSupabaseConfigured()) {
      set({
        isReady: true,
        session: null,
        user: {
          id: "demo-user",
          app_metadata: {},
          user_metadata: { username: "demo" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User,
        error: null,
      });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) set({ error: error.message });
    set({ session: data.session, user: data.session?.user ?? null, isReady: true });

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({ session: nextSession, user: nextSession?.user ?? null });
    });
  },
  signOut: async () => {
    if (!isSupabaseConfigured()) {
      set({ session: null, user: null, isReady: true });
      return;
    }
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
