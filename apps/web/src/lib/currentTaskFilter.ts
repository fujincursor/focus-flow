import type { Task } from '@/types/task'

/**
 * Configuration for current task filtering
 */
export interface CurrentTaskFilterConfig {
  /** Maximum number of "anytime" tasks to include */
  maxAnytimeTasks?: number
  /** Hour threshold for evening (prioritize short tasks) */
  eveningStartHour?: number
  /** Days threshold for old tasks to be prioritized */
  oldTaskDaysThreshold?: number
  /** Whether to prioritize short tasks in the evening */
  prioritizeShortTasks?: boolean
  /** Current time (for testing purposes) */
  currentTime?: Date
}

/**
 * Default configuration for task filtering
 */
const DEFAULT_CONFIG: Required<CurrentTaskFilterConfig> = {
  maxAnytimeTasks: 3,
  eveningStartHour: 18,
  oldTaskDaysThreshold: 7,
  prioritizeShortTasks: true,
  currentTime: new Date(),
}

/**
 * Check if current time is weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Check if current time is evening (after eveningStartHour)
 */
function isEvening(date: Date, eveningStartHour: number): boolean {
  return date.getHours() >= eveningStartHour
}

/**
 * Calculate age of task in days
 */
function getTaskAgeDays(task: Task, currentTime: Date): number {
  const createdAt = new Date(task.created_at)
  const diffMs = currentTime.getTime() - createdAt.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculate priority score for a task
 * Higher score = higher priority
 */
function calculatePriorityScore(
  task: Task,
  config: Required<CurrentTaskFilterConfig>
): number {
  let score = 0

  // Base score by time sensitivity
  switch (task.time_sensitivity) {
    case 'today':
      score += 1000
      break
    case 'this_week':
      score += 500
      break
    case 'anytime':
      score += 100
      break
  }

  // Boost old tasks (7+ days old)
  const ageDays = getTaskAgeDays(task, config.currentTime)
  if (ageDays >= config.oldTaskDaysThreshold) {
    score += ageDays * 10
  }

  // Evening preference: short tasks get boost (if enabled)
  if (config.prioritizeShortTasks && isEvening(config.currentTime, config.eveningStartHour)) {
    if (task.estimated_duration && task.estimated_duration <= 30) {
      score += 200
    }
  }

  // Longer waiting tasks get slight boost
  score += ageDays

  return score
}

/**
 * Get current recommended tasks based on time, context, and priorities
 *
 * Filtering logic:
 * 1. First priority: "today" tasks (all uncompleted)
 * 2. Second priority: "this_week" tasks (on weekends or if no today tasks)
 * 3. Third priority: "anytime" tasks (limited to maxAnytimeTasks)
 *
 * Enhanced filtering:
 * - Evening (after 18:00): prioritize tasks with estimated_duration <= 30 min
 * - Old tasks (7+ days): get priority boost
 * - All results sorted by calculated priority score
 *
 * @param tasks - All tasks to filter from
 * @param config - Optional configuration
 * @returns Filtered and sorted tasks for current context
 */
export function getCurrentTasks(
  tasks: Task[],
  config: CurrentTaskFilterConfig = {}
): Task[] {
  const finalConfig: Required<CurrentTaskFilterConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  // Filter out completed tasks
  const uncompletedTasks = tasks.filter(task => !task.is_completed)

  if (uncompletedTasks.length === 0) {
    return []
  }

  // Separate tasks by time sensitivity
  const todayTasks = uncompletedTasks.filter(
    task => task.time_sensitivity === 'today'
  )
  const thisWeekTasks = uncompletedTasks.filter(
    task => task.time_sensitivity === 'this_week'
  )
  const anytimeTasks = uncompletedTasks.filter(
    task => task.time_sensitivity === 'anytime'
  )

  const currentIsWeekend = isWeekend(finalConfig.currentTime)

  // Collect tasks based on priority rules
  let selectedTasks: Task[] = []

  // Always include today tasks
  selectedTasks = [...todayTasks]

  // Include this_week tasks on weekends or if no today tasks
  if (currentIsWeekend || todayTasks.length === 0) {
    selectedTasks = [...selectedTasks, ...thisWeekTasks]
  }

  // Include limited anytime tasks
  const anytimeLimit = Math.min(
    finalConfig.maxAnytimeTasks,
    anytimeTasks.length
  )
  selectedTasks = [...selectedTasks, ...anytimeTasks.slice(0, anytimeLimit)]

  // Calculate priority scores and sort
  const tasksWithScores = selectedTasks.map(task => ({
    task,
    score: calculatePriorityScore(task, finalConfig),
  }))

  // Sort by priority score (highest first)
  tasksWithScores.sort((a, b) => b.score - a.score)

  return tasksWithScores.map(({ task }) => task)
}
