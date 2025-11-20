/**
 * Zod validation schemas for Task entities
 * Based on Focus Flow architecture v1.0
 */

import { z } from 'zod'

export const TimeSensitivitySchema = z.enum(['today', 'this_week', 'anytime'])

export const CreateTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不能超过200字符'),
  description: z.string().max(1000, '任务描述不能超过1000字符').nullable().optional(),
  time_sensitivity: TimeSensitivitySchema,
  estimated_duration: z.number().int().positive('预估时长必须为正整数').max(480, '预估时长不能超过8小时').nullable().optional(),
})

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不能超过200字符').optional(),
  description: z.string().max(1000, '任务描述不能超过1000字符').nullable().optional(),
  is_completed: z.boolean().optional(),
  time_sensitivity: TimeSensitivitySchema.optional(),
  estimated_duration: z.number().int().positive('预估时长必须为正整数').max(480, '预估时长不能超过8小时').nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
})

export const TaskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean(),
  time_sensitivity: TimeSensitivitySchema,
  estimated_duration: z.number().int().positive().nullable(),
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
2