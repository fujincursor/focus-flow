import { supabase } from '@/lib/supabase'
import type {
  PomodoroSession,
  CreatePomodoroSessionInput,
  DailyBreakdown,
  WeeklyStats,
  MonthlyStats,
  CustomRangeStats,
} from '@/types/pomodoro'
import type { Database } from '@/types/database.types'

type PomodoroSessionInsert = Database['public']['Tables']['pomodoro_sessions']['Insert']
type PomodoroSessionUpdate = Database['public']['Tables']['pomodoro_sessions']['Update']

/**
 * 开始新的番茄钟会话
 * 注意：user_id 由数据库自动填充，RLS 策略会自动关联当前用户
 */
export async function startSession(
  input: CreatePomodoroSessionInput
): Promise<PomodoroSession | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const insertData: PomodoroSessionInsert = {
    user_id: user.id,
    task_id: input.task_id,
    session_type: input.session_type,
    duration: input.duration,
    start_time: new Date().toISOString(),
    completed: false,
  }

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single()

  if (error) {
    console.error('startSession error:', error)
    throw new Error('开始番茄钟失败')
  }

  return data as PomodoroSession
}

/**
 * 完成番茄钟会话
 * RLS 策略确保只能更新自己的会话
 */
export async function completeSession(sessionId: string): Promise<void> {
  const updateData: PomodoroSessionUpdate = {
    end_time: new Date().toISOString(),
    completed: true,
  }

  const { error } = await supabase
    .from('pomodoro_sessions')
    // @ts-expect-error Supabase type inference issue - types are correct at runtime
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error('completeSession error:', error)
    throw new Error('完成番茄钟失败')
  }
}

/**
 * 取消番茄钟会话
 */
export async function cancelSession(sessionId: string): Promise<void> {
  const updateData: PomodoroSessionUpdate = {
    end_time: new Date().toISOString(),
    completed: false,
  }

  const { error } = await supabase
    .from('pomodoro_sessions')
    // @ts-expect-error Supabase type inference issue - types are correct at runtime
    .update(updateData)
    .eq('id', sessionId)

  if (error) {
    console.error('cancelSession error:', error)
    throw new Error('取消番茄钟失败')
  }
}

/**
 * 获取今日所有番茄钟会话
 * RLS 策略自动过滤当前用户的数据
 */
export async function getTodaySessions(): Promise<PomodoroSession[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .gte('created_at', todayStr)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getTodaySessions error:', error)
    return []
  }

  return (data as PomodoroSession[]) || []
}

/**
 * 按日期范围获取番茄钟会话
 */
export async function getSessionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PomodoroSession[]> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getSessionsByDateRange error:', error)
    return []
  }

  return (data as PomodoroSession[]) || []
}

/**
 * 计算今日番茄钟统计
 */
export async function getTodayPomodoroStats(): Promise<{
  completedCount: number
  totalWorkDuration: number // 秒数
}> {
  const sessions = await getTodaySessions()

  const completedWorkSessions = sessions.filter(
    s => s.session_type === 'work' && s.completed
  )

  const totalWorkDuration = completedWorkSessions.reduce(
    (sum, s) => sum + s.duration,
    0
  )

  return {
    completedCount: completedWorkSessions.length,
    totalWorkDuration,
  }
}

// ==================== 统计聚合函数 ====================

/**
 * 创建空统计数据结构
 * @returns {WeeklyStats} 空数据
 */
function createEmptyStats(): WeeklyStats {
  return {
    totalCompleted: 0,
    totalInterrupted: 0,
    totalDuration: 0,
    averagePerDay: 0,
    dailyBreakdown: [],
  }
}

/**
 * 按日期聚合番茄钟会话数据
 * @param {PomodoroSession[]} sessions - 会话数组
 * @returns {WeeklyStats} 聚合后的统计数据
 */
function aggregateStatsByDays(sessions: PomodoroSession[]): WeeklyStats {
  // 处理空数据
  if (sessions.length === 0) {
    return createEmptyStats()
  }

  // 按日期分组（使用 Map）
  const dailyMap = new Map<string, PomodoroSession[]>()

  sessions.forEach(session => {
    // 提取日期部分 (YYYY-MM-DD)
    const date = session.created_at.split('T')[0]

    if (!dailyMap.has(date)) {
      dailyMap.set(date, [])
    }
    dailyMap.get(date)!.push(session)
  })

  // 聚合每日数据
  const dailyBreakdown: DailyBreakdown[] = Array.from(dailyMap.entries()).map(
    ([date, daySessions]) => {
      // 只统计工作番茄钟（不包括休息时间）
      const workSessions = daySessions.filter(s => s.session_type === 'work')

      const completed = workSessions.filter(s => s.completed).length
      const interrupted = workSessions.filter(s => !s.completed).length

      const totalDuration = workSessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.duration, 0)

      const completionRate =
        workSessions.length > 0
          ? Math.round((completed / workSessions.length) * 100)
          : 0

      return {
        date,
        completed,
        interrupted,
        totalDuration,
        completionRate,
      }
    }
  )

  // 按日期升序排序
  dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date))

  // 计算总计
  const totalCompleted = dailyBreakdown.reduce((sum, day) => sum + day.completed, 0)
  const totalInterrupted = dailyBreakdown.reduce((sum, day) => sum + day.interrupted, 0)
  const totalDuration = dailyBreakdown.reduce((sum, day) => sum + day.totalDuration, 0)

  // 计算日均完成数（保留一位小数）
  const averagePerDay =
    dailyBreakdown.length > 0
      ? Math.round((totalCompleted / dailyBreakdown.length) * 10) / 10
      : 0

  return {
    totalCompleted,
    totalInterrupted,
    totalDuration,
    averagePerDay,
    dailyBreakdown,
  }
}

/**
 * 获取最近7天的番茄钟统计
 * @returns {Promise<WeeklyStats>} 周统计数据
 */
export async function getWeeklyStats(): Promise<WeeklyStats> {
  // 计算日期范围：今天往前推7天
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  // 使用现有函数获取会话数据
  const sessions = await getSessionsByDateRange(startDate, endDate)

  // 聚合数据
  return aggregateStatsByDays(sessions)
}

/**
 * 获取最近30天的番茄钟统计
 * @returns {Promise<MonthlyStats>} 月统计数据
 */
export async function getMonthlyStats(): Promise<MonthlyStats> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const sessions = await getSessionsByDateRange(startDate, endDate)

  return aggregateStatsByDays(sessions)
}

/**
 * 获取自定义日期范围的番茄钟统计
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Promise<CustomRangeStats>} 自定义范围统计数据
 */
export async function getCustomRangeStats(
  startDate: Date,
  endDate: Date
): Promise<CustomRangeStats> {
  // 参数验证
  if (startDate > endDate) {
    console.error('getCustomRangeStats: startDate cannot be after endDate')
    return createEmptyStats()
  }

  const sessions = await getSessionsByDateRange(startDate, endDate)

  return aggregateStatsByDays(sessions)
}
