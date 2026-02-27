import { create } from 'zustand'

type AuthState = {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  login: (token: string) => set({ token }),
  logout: () => set({ token: null }),
}))

