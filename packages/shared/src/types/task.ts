/**
 * Core Task type definitions
 * Based on Focus Flow architecture v1.0
 */

export type TimeSensitivity = 'today' | 'this_week' | 'anytime'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  is_completed: boolean
  time_sensitivity: TimeSensitivity
  estimated_duration: number | null // minutes
  completed_at: string | null // ISO timestamp
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  time_sensitivity: TimeSensitivity
  estimated_duration?: number | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  is_completed?: boolean
  time_sensitivity?: TimeSensitivity
  estimated_duration?: number | null
  completed_at?: string | null
}
