import { supabase } from '@/lib/supabase'
import type { DailySummary, DailySummaryView } from '@/types/models'

/**
 * Get today's summary
 */
export async function getTodaySummary(): Promise<DailySummary | null> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return getSummaryByDate(today)
}

/**
 * Get summary for a specific date
 */
export async function getSummaryByDate(date: string): Promise<DailySummary | null> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('date', date)
    .single()

  if (error) {
    console.error('Error fetching summary:', error)
    return null
  }

  return data
}

/**
 * Get recent summaries for charts (last N days)
 */
export async function getRecentSummaries(days = 7): Promise<DailySummary[]> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return []

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching recent summaries:', error)
    return []
  }

  return data || []
}

/**
 * Get summary with completed tasks
 */
export async function getSummaryWithTasks(date: string): Promise<DailySummaryView | null> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  // Get summary
  const summary = await getSummaryByDate(date)
  if (!summary) return null

  // Get completed tasks for that date
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_completed', true)
    .gte('completed_at', `${date}T00:00:00`)
    .lte('completed_at', `${date}T23:59:59`)
    .order('completed_at', { ascending: true })

  if (error) {
    console.error('Error fetching completed tasks:', error)
    return {
      ...summary,
      completed_tasks: [],
    }
  }

  return {
    ...summary,
    completed_tasks: tasks || [],
  }
}

/**
 * Update reflection notes for a summary
 */
export async function updateReflectionNotes(date: string, notes: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return false

  const { error } = await supabase
    .from('daily_summaries')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Supabase types need to be regenerated after schema changes
    .update({ reflection_notes: notes })
    .eq('user_id', user.user.id)
    .eq('date', date)

  if (error) {
    console.error('Error updating reflection notes:', error)
    return false
  }

  return true
}

/**
 * Get current week's summary (aggregated)
 */
export async function getWeekSummary(): Promise<{
  totalCompleted: number
  totalCreated: number
  totalWorkDuration: number
  completionRate: number
  dailySummaries: DailySummary[]
} | null> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  // Get Monday of current week
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.user.id)
    .gte('date', monday.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching week summary:', error)
    return null
  }

  if (!data || data.length === 0) {
    return {
      totalCompleted: 0,
      totalCreated: 0,
      totalWorkDuration: 0,
      completionRate: 0,
      dailySummaries: [],
    }
  }

  // Aggregate data
  const summaries = data as DailySummary[]
  const totalCompleted = summaries.reduce((sum, day) => sum + day.completed_tasks_count, 0)
  const totalCreated = summaries.reduce((sum, day) => sum + day.created_tasks_count, 0)
  const totalWorkDuration = summaries.reduce((sum, day) => sum + (day.total_work_duration || 0), 0)
  const completionRate = calculateCompletionRate(totalCompleted, totalCreated)

  return {
    totalCompleted,
    totalCreated,
    totalWorkDuration,
    completionRate,
    dailySummaries: summaries,
  }
}

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(completed: number, created: number): number {
  if (created === 0) return 0
  return Math.round((completed / created) * 100)
}
