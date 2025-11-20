/**
 * User profile type definitions
 * Based on Focus Flow architecture v1.0
 */

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface UpdateUserProfileInput {
  full_name?: string | null
  avatar_url?: string | null
}
