import { z } from 'zod'

// Time sensitivity enum
export const TimeSensitivity = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  ANYTIME: 'anytime',
} as const

export type TimeSensitivityType = typeof TimeSensitivity[keyof typeof TimeSensitivity]

// Task Schema for validation
export const taskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题过长'),
  description: z.string().max(1000, '任务描述过长').nullable().optional(),
  time_sensitivity: z.enum(['today', 'this_week', 'anytime']),
  estimated_duration: z.number().int().min(1).max(1440).nullable().optional(), // 1-1440 minutes (24 hours)
  is_completed: z.boolean(),
  completed_at: z.string().datetime().nullable().optional(),
  display_order: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Task type inferred from schema
export type Task = z.infer<typeof taskSchema>

// Create task input schema (fields needed to create a task)
export const createTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题过长'),
  description: z.string().max(1000, '任务描述过长').nullable().optional(),
  time_sensitivity: z.enum(['today', 'this_week', 'anytime']),
  estimated_duration: z.number().int().min(1).max(1440).nullable().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

// Update task input schema (all fields optional except those that should not change)
export const updateTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题过长').optional(),
  description: z.string().max(1000, '任务描述过长').nullable().optional(),
  time_sensitivity: z.enum(['today', 'this_week', 'anytime']).optional(),
  estimated_duration: z.number().int().min(1).max(1440).nullable().optional(),
  is_completed: z.boolean().optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Database row type (raw from Supabase)
export type TaskRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  time_sensitivity: 'today' | 'this_week' | 'anytime'
  estimated_duration: number | null
  is_completed: boolean
  completed_at: string | null
  display_order: number
  created_at: string
  updated_at: string
}
