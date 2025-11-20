import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import { supabase } from '@/lib/supabase'
import * as authService from '@/services/authService'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

// Mock authService
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
}))

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with null user', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      } as any

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle null user', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser(null)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('clearUser', () => {
    it('should clear user and reset authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      } as any

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.clearUser()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('should check authentication and set user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      } as any

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.checkAuth()
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle authentication check failure', async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.checkAuth()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle error during auth check', async () => {
      vi.mocked(authService.getCurrentUser).mockRejectedValue(
        new Error('Auth check failed')
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.checkAuth()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to check authentication')
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      } as any

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.isAuthenticated).toBe(true)

      await act(async () => {
        await result.current.signOut()
      })

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should throw error when sign out fails', async () => {
      const mockError = {
        message: 'Sign out failed',
        name: 'AuthApiError',
        status: 500,
      }

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      } as any)

      const { result } = renderHook(() => useAuthStore())

      let thrownError: Error | null = null
      try {
        await act(async () => {
          await result.current.signOut()
        })
      } catch (error) {
        thrownError = error as Error
      }

      expect(thrownError).toBeTruthy()
      expect(thrownError?.message).toContain('Sign out failed')
    })
  })

  describe('initAuthListener', () => {
    it('should initialize auth state change listener', () => {
      const mockUnsubscribe = vi.fn()
      const mockSubscription = { unsubscribe: mockUnsubscribe }

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      } as any)

      const { result } = renderHook(() => useAuthStore())

      let cleanup: (() => void) | undefined
      act(() => {
        cleanup = result.current.initAuthListener()
      })

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(cleanup).toBeDefined()

      // Call cleanup
      cleanup?.()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should update user on SIGNED_IN event', () => {
      let authCallback: (event: string, session: any) => void = () => {}

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback: any) => {
          authCallback = callback
          return {
            data: {
              subscription: {
                unsubscribe: vi.fn(),
              },
            },
          } as any
        }
      )

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.initAuthListener()
      })

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }

      act(() => {
        authCallback('SIGNED_IN', { user: mockUser })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should clear user on SIGNED_OUT event', () => {
      let authCallback: (event: string, session: any) => void = () => {}

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (callback: any) => {
          authCallback = callback
          return {
            data: {
              subscription: {
                unsubscribe: vi.fn(),
              },
            },
          } as any
        }
      )

      const { result } = renderHook(() => useAuthStore())

      // Set a user first
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      } as any

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.initAuthListener()
      })

      act(() => {
        authCallback('SIGNED_OUT', null)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
