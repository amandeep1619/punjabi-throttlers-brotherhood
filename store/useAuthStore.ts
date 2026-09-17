import { create } from "zustand";

export type AuthUser = {
  id: string;
  memberId: string;
  name: string;
  role: "member" | "admin";
  photoUrl: string | null;
} | null;

type AuthState = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  clear: () => void;
};

// Client-side cache for display purposes only (nav, greetings). Every real
// auth/permission decision is still enforced server-side via the session
// cookie (see lib/auth.ts / proxy.ts) — this never becomes a second source
// of truth for what a user is allowed to do.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
