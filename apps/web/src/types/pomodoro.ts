import { z } from 'zod'

export const pomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  task_id: z.string().uuid().nullable().optional(),
  session_type: z.enum(['work', 'rest']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().nullable().optional(),
  duration: z.number().int().min(0),
  completed: z.boolean(),
  created_at: z.string().datetime(),
})

export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>

export const createPomodoroSessionSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  session_type: z.enum(['work', 'rest']),
  duration: z.number().int().min(0).max(7200), // 最多2小时
})

export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>

/**
 * 单日番茄钟统计明细
 */
export interface DailyBreakdown {
  date: string // YYYY-MM-DD format
  completed: number // 完成的工作番茄钟数量
  interrupted: number // 中断的工作番茄钟数量
  totalDuration: number // 总专注时长（秒）
  completionRate: number // 完成率 (0-100)
}

/**
 * 周统计数据
 */
export interface WeeklyStats {
  totalCompleted: number // 总完成番茄钟数
  totalInterrupted: number // 总中断番茄钟数
  totalDuration: number // 总专注时长（秒）
  averagePerDay: number // 日均完成数
  dailyBreakdown: DailyBreakdown[] // 每日明细（按日期升序）
}

/**
 * 月统计数据（结构与 WeeklyStats 相同）
 */
export type MonthlyStats = WeeklyStats

/**
 * 自定义范围统计数据（结构与 WeeklyStats 相同）
 */
export type CustomRangeStats = WeeklyStats
