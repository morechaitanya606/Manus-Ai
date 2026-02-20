'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SessionUser = {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  displayName?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (input: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  updateToken: (accessToken: string) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (input) =>
        set({
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          user: input.user,
        }),
      updateToken: (accessToken) => set({ accessToken }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
      isAuthenticated: () => Boolean(get().accessToken && get().user),
      isAdmin: () => {
        const role = get().user?.role;
        return role === 'PLATFORM_ADMIN' || role === 'STORE_OWNER' || role === 'STORE_MANAGER';
      },
    }),
    {
      name: 'atelier-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
