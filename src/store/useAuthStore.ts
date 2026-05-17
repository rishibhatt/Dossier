import { create } from "zustand"

type AuthUserSnapshot = {
  id: string
  email: string | null
}

type AuthState = {
  user: AuthUserSnapshot | null
  setUser: (user: AuthUserSnapshot | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}))
