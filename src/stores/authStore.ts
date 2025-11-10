import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authAPI } from '@/services/api'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearError: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Initialize auth state from localStorage
        initialize: () => {
          if (typeof window === 'undefined') return

          const accessToken = localStorage.getItem('accessToken')
          const refreshToken = localStorage.getItem('refreshToken')
          const userStr = localStorage.getItem('user')

          if (accessToken && refreshToken && userStr) {
            try {
              const user = JSON.parse(userStr)
              set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true
              })
            } catch (error) {
              console.error('Failed to parse user data:', error)
              // Clear invalid data
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
            }
          }
        },

        // Login
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null })

          try {
            const response = await authAPI.login(email, password)

            // Save to localStorage
            localStorage.setItem('accessToken', response.accessToken)
            localStorage.setItem('refreshToken', response.refreshToken)
            localStorage.setItem('user', JSON.stringify(response.user))

            // Update state
            set({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
              isLoading: false
            })
            throw error
          }
        },

        // Logout
        logout: async () => {
          set({ isLoading: true })

          try {
            await authAPI.logout()
          } catch (error) {
            console.error('Logout API error:', error)
            // Continue with logout even if API fails
          } finally {
            // Clear localStorage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')

            // Reset state
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        },

        // Refresh access token
        refreshAccessToken: async () => {
          const { refreshToken } = get()

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          try {
            const response = await authAPI.refresh(refreshToken)

            // Update tokens
            localStorage.setItem('accessToken', response.accessToken)

            set({
              accessToken: response.accessToken
            })
          } catch (error) {
            // If refresh fails, logout user
            get().logout()
            throw error
          }
        },

        // Set user
        setUser: (user: User | null) => {
          set({ user })
          if (user) {
            localStorage.setItem('user', JSON.stringify(user))
          } else {
            localStorage.removeItem('user')
          }
        },

        // Set tokens
        setTokens: (accessToken: string, refreshToken: string) => {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            accessToken,
            refreshToken,
            isAuthenticated: true
          })
        },

        // Clear error
        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
)

// Selectors
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
