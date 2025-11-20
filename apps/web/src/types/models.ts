// Core data models for Focus Flow

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  time_sensitivity: 'today' | 'this_week' | 'anytime'
  estimated_duration: number | null // minutes
  is_completed: boolean
  completed_at: string | null // ISO 8601 timestamp
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
}

export interface CreateTaskInput {
  title: string
  description?: string
  time_sensitivity: 'today' | 'this_week' | 'anytime'
  estimated_duration?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  time_sensitivity?: 'today' | 'this_week' | 'anytime'
  estimated_duration?: number
  is_completed?: boolean
}

export interface DailySummary {
  id: string
  user_id: string
  date: string // YYYY-MM-DD format
  completed_tasks_count: number
  created_tasks_count: number
  total_work_duration: number // minutes
  completion_rate: number
  reflection_notes?: string
  created_at: string
  updated_at: string
}

export type TimeSensitivity = Task['time_sensitivity']

export interface DailySummaryView extends DailySummary {
  completed_tasks: Task[]
}
