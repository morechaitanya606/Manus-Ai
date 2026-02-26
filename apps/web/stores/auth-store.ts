'use client';

import { create } from 'zustand';
import { getSupabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { isAdminRole, isCreatorRole } from '../lib/roles';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isCreator: () => boolean;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    // Prevent concurrent initializations in React Strict Mode
    if ((get() as any)._initializing) return;
    set({ _initializing: true } as any);

    const supabase = getSupabase();

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false, initialized: true, _initializing: false } as any);

    if (session?.user) {
      get().fetchProfile();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    const supabase = getSupabase();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signUpWithEmail: async (email, password, metadata) => {
    set({ loading: true });
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signInWithGoogle: async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  isAuthenticated: () => Boolean(get().session),
  isAdmin: () => isAdminRole(get().profile?.role),
  isCreator: () => isCreatorRole(get().profile?.role),
}));
