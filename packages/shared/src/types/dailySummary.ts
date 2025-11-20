/**
 * Daily Summary type definitions
 * Based on Focus Flow architecture v1.0
 */

export interface DailySummary {
  id: string
  user_id: string
  date: string // YYYY-MM-DD format
  tasks_completed: number
  total_duration: number // total minutes
  reflection_note: string | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface CreateDailySummaryInput {
  date: string
  reflection_note?: string | null
}

export interface UpdateDailySummaryInput {
  reflection_note?: string | null
}
