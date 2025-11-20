import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, signOut, getCurrentUser } from '../authService'
import { supabase } from '@/lib/supabase'
import { AuthError } from '@/types/errors'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      } as any)

      const result = await signUp({
        email: 'test@example.com',
        password: 'Password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe('test@example.com')
      expect(result.error).toBeNull()
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    it('should return error when sign up fails', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: 'Email already exists',
          name: 'AuthApiError',
          status: 400,
        },
      } as any)

      const result = await signUp({
        email: 'existing@example.com',
        password: 'Password123',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error).toBeInstanceOf(AuthError)
    })
  })

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockUser,
          session: {
            access_token: 'mock-token',
          },
        },
        error: null,
      } as any)

      const result = await signIn({
        email: 'test@example.com',
        password: 'Password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe('test@example.com')
      expect(result.error).toBeNull()
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      })
    })

    it('should return error with invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: 'Invalid login credentials',
          name: 'AuthApiError',
          status: 400,
        },
      } as any)

      const result = await signIn({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error).toBeInstanceOf(AuthError)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      })

      await expect(signOut()).resolves.not.toThrow()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error when sign out fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: {
          message: 'Sign out failed',
          name: 'AuthApiError',
          status: 500,
        },
      } as any)

      await expect(signOut()).rejects.toThrow(AuthError)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: mockUser,
        },
        error: null,
      } as any)

      const user = await getCurrentUser()

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should return null when no user is logged in', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: null,
        },
        error: null,
      } as any)

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })
})
