import { create } from 'zustand'
import type { AuthUser, AuthStore } from '../types'
import { queryClient } from '../lib/queryClient'

interface AuthStoreState extends AuthStore {
  refreshToken: string | null
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  accessToken: sessionStorage.getItem('accessToken'),
  refreshToken: sessionStorage.getItem('refreshToken'),

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => {
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
    set({ user, accessToken, refreshToken })
  },

  logout: () => {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    queryClient.clear()
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))
