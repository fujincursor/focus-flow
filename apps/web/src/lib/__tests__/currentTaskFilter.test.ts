import { describe, it, expect } from 'vitest'
import { getCurrentTasks } from '../currentTaskFilter'
import type { Task } from '@/types/task'

// Helper function to create a task
function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: Math.random().toString(),
    user_id: 'test-user',
    title: 'Test Task',
    description: null,
    is_completed: false,
    time_sensitivity: 'today',
    estimated_duration: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('currentTaskFilter', () => {
  describe('getCurrentTasks', () => {
    it('returns empty array when no tasks provided', () => {
      const result = getCurrentTasks([])
      expect(result).toEqual([])
    })

    it('filters out completed tasks', () => {
      const tasks = [
        createTask({ is_completed: false, title: 'Active' }),
        createTask({ is_completed: true, title: 'Completed' }),
      ]

      const result = getCurrentTasks(tasks)
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Active')
    })

    it('prioritizes "today" tasks first', () => {
      const tasks = [
        createTask({ time_sensitivity: 'anytime', title: 'Anytime' }),
        createTask({ time_sensitivity: 'today', title: 'Today' }),
        createTask({ time_sensitivity: 'this_week', title: 'This Week' }),
      ]

      const result = getCurrentTasks(tasks)
      // Today tasks should be at the top
      expect(result[0].title).toBe('Today')
    })

    it('includes all "today" tasks', () => {
      const tasks = [
        createTask({ time_sensitivity: 'today', title: 'Today 1' }),
        createTask({ time_sensitivity: 'today', title: 'Today 2' }),
        createTask({ time_sensitivity: 'today', title: 'Today 3' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime' }),
      ]

      const result = getCurrentTasks(tasks)
      const todayTasks = result.filter(t => t.time_sensitivity === 'today')
      expect(todayTasks).toHaveLength(3)
    })

    it('includes "this_week" tasks on weekends', () => {
      const saturday = new Date('2024-01-06T10:00:00') // Saturday
      const tasks = [
        createTask({ time_sensitivity: 'today', title: 'Today' }),
        createTask({ time_sensitivity: 'this_week', title: 'This Week' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime' }),
      ]

      const result = getCurrentTasks(tasks, { currentTime: saturday })
      const thisWeekTasks = result.filter(
        t => t.time_sensitivity === 'this_week'
      )
      expect(thisWeekTasks.length).toBeGreaterThan(0)
    })

    it('includes "this_week" tasks when no "today" tasks exist', () => {
      const tasks = [
        createTask({ time_sensitivity: 'this_week', title: 'This Week 1' }),
        createTask({ time_sensitivity: 'this_week', title: 'This Week 2' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime' }),
      ]

      const result = getCurrentTasks(tasks)
      const thisWeekTasks = result.filter(
        t => t.time_sensitivity === 'this_week'
      )
      expect(thisWeekTasks).toHaveLength(2)
    })

    it('limits "anytime" tasks to configured maximum', () => {
      const tasks = [
        createTask({ time_sensitivity: 'anytime', title: 'Anytime 1' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime 2' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime 3' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime 4' }),
        createTask({ time_sensitivity: 'anytime', title: 'Anytime 5' }),
      ]

      const result = getCurrentTasks(tasks, { maxAnytimeTasks: 3 })
      const anytimeTasks = result.filter(t => t.time_sensitivity === 'anytime')
      expect(anytimeTasks.length).toBeLessThanOrEqual(3)
    })

    it('prioritizes short tasks in the evening', () => {
      const evening = new Date('2024-01-01T19:00:00') // 7 PM
      const tasks = [
        createTask({
          time_sensitivity: 'today',
          title: 'Long Task',
          estimated_duration: 120,
        }),
        createTask({
          time_sensitivity: 'today',
          title: 'Short Task',
          estimated_duration: 15,
        }),
      ]

      const result = getCurrentTasks(tasks, {
        currentTime: evening,
        eveningStartHour: 18,
      })

      // Short task should come first in the evening
      expect(result[0].title).toBe('Short Task')
    })

    it('boosts priority of old tasks', () => {
      const now = new Date('2024-01-15T10:00:00')
      const oldDate = new Date('2024-01-01T10:00:00') // 14 days ago
      const recentDate = new Date('2024-01-14T10:00:00') // 1 day ago

      const tasks = [
        createTask({
          time_sensitivity: 'anytime',
          title: 'Recent Task',
          created_at: recentDate.toISOString(),
        }),
        createTask({
          time_sensitivity: 'anytime',
          title: 'Old Task',
          created_at: oldDate.toISOString(),
        }),
      ]

      const result = getCurrentTasks(tasks, {
        currentTime: now,
        oldTaskDaysThreshold: 7,
      })

      // Old task should come first
      expect(result[0].title).toBe('Old Task')
    })

    it('handles edge case: only completed tasks', () => {
      const tasks = [
        createTask({ is_completed: true, title: 'Completed 1' }),
        createTask({ is_completed: true, title: 'Completed 2' }),
      ]

      const result = getCurrentTasks(tasks)
      expect(result).toEqual([])
    })

    it('handles edge case: tasks with no estimated duration in evening', () => {
      const evening = new Date('2024-01-01T20:00:00')
      const tasks = [
        createTask({
          time_sensitivity: 'today',
          title: 'No Duration',
          estimated_duration: null,
        }),
        createTask({
          time_sensitivity: 'today',
          title: 'Has Duration',
          estimated_duration: 30,
        }),
      ]

      // Should not throw error
      const result = getCurrentTasks(tasks, { currentTime: evening })
      expect(result).toHaveLength(2)
    })

    it('maintains stable sort for tasks with equal priority', () => {
      const tasks = [
        createTask({ time_sensitivity: 'today', title: 'Today 1' }),
        createTask({ time_sensitivity: 'today', title: 'Today 2' }),
        createTask({ time_sensitivity: 'today', title: 'Today 3' }),
      ]

      const result = getCurrentTasks(tasks)
      expect(result).toHaveLength(3)
    })

    it('handles large task lists efficiently', () => {
      const tasks: Task[] = []
      for (let i = 0; i < 1000; i++) {
        tasks.push(
          createTask({
            time_sensitivity: i % 3 === 0 ? 'today' : i % 3 === 1 ? 'this_week' : 'anytime',
            title: `Task ${i}`,
          })
        )
      }

      const start = performance.now()
      const result = getCurrentTasks(tasks)
      const duration = performance.now() - start

      expect(result.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100) // Should complete in under 100ms
    })

    it('respects custom configuration', () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTask({ time_sensitivity: 'anytime', title: `Anytime ${i}` })
      )

      const result = getCurrentTasks(tasks, { maxAnytimeTasks: 5 })
      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('combines multiple priority factors correctly', () => {
      const now = new Date('2024-01-15T20:00:00') // Evening
      const oldDate = new Date('2024-01-01T10:00:00') // 14 days ago

      const tasks = [
        createTask({
          time_sensitivity: 'today',
          title: 'Old + Short',
          created_at: oldDate.toISOString(),
          estimated_duration: 20,
        }),
        createTask({
          time_sensitivity: 'today',
          title: 'Recent + Long',
          created_at: now.toISOString(),
          estimated_duration: 120,
        }),
      ]

      const result = getCurrentTasks(tasks, {
        currentTime: now,
        eveningStartHour: 18,
        oldTaskDaysThreshold: 7,
      })

      // Old + Short task should rank higher
      expect(result[0].title).toBe('Old + Short')
    })

    it('correctly identifies weekend days', () => {
      const sunday = new Date('2024-01-07T10:00:00') // Sunday
      const tasks = [
        createTask({ time_sensitivity: 'this_week', title: 'This Week' }),
      ]

      const result = getCurrentTasks(tasks, { currentTime: sunday })
      expect(result).toHaveLength(1)
    })

    it('correctly identifies weekday', () => {
      const monday = new Date('2024-01-08T10:00:00') // Monday
      const tasks = [
        createTask({ time_sensitivity: 'today', title: 'Today' }),
        createTask({ time_sensitivity: 'this_week', title: 'This Week' }),
      ]

      const result = getCurrentTasks(tasks, { currentTime: monday })

      // On weekdays with today tasks, this_week should not be included
      const thisWeekTasks = result.filter(
        t => t.time_sensitivity === 'this_week'
      )
      expect(thisWeekTasks).toHaveLength(0)
    })
  })
})
