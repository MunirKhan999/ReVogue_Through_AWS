import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  user_id: number
  email: string
  full_name: string
  role: "buyer" | "seller"
}

interface AuthStore {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem("token", token)
        set({ token, user, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem("token")
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: "revogue-auth",
    },
  ),
)
