import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/services/authService'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  clearUser: () => void
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
  initAuthListener: () => () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // State
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Actions
      setUser: user =>
        set(
          {
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          },
          false,
          'setUser'
        ),

      clearUser: () =>
        set(
          {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          },
          false,
          'clearUser'
        ),

      // Check current authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true }, false, 'checkAuth/start')
          const user = await getCurrentUser()
          get().setUser(user)
        } catch {
          set(
            {
              error: 'Failed to check authentication',
              isLoading: false,
            },
            false,
            'checkAuth/error'
          )
        }
      },

      // Sign out
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Sign out failed:', error)
          throw new Error(error.message)
        }
        get().clearUser()
      },

      // Initialize auth state change listener
      initAuthListener: () => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN') {
            get().setUser(session?.user ?? null)
          } else if (event === 'SIGNED_OUT') {
            get().clearUser()
          }
        })

        // Return cleanup function
        return () => {
          subscription.unsubscribe()
        }
      },
    }),
    { name: 'AuthStore' }
  )
)
