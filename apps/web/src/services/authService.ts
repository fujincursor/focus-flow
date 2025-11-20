import { supabase } from '@/lib/supabase'
import { AuthError } from '@/types/errors'
import type { User } from '@supabase/supabase-js'

/**
 * Sign up data interface
 */
export interface SignUpData {
  email: string
  password: string
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User | null
  error: Error | null
}

/**
 * Sign up a new user with email and password
 * Sends a confirmation email to the user
 *
 * @param data - User email and password
 * @returns AuthResponse with user or error
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new AuthError(error.message, error)
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Sign in an existing user with email and password
 *
 * @param data - User email and password
 * @returns AuthResponse with user or error
 */
export async function signIn(data: SignUpData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new AuthError(error.message, error)
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Sign out the current user
 * Clears the session and removes tokens
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new AuthError(error.message, error)
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
