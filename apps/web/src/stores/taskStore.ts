import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'
import * as taskService from '@/services/taskService'

interface TaskStore {
  // State
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Realtime sync callback (set by useTaskRealtime hook)
  onLocalUpdate: ((taskId: string) => void) | null

  // Actions
  fetchTasks: () => Promise<void>
  addTask: (input: CreateTaskInput) => Promise<Task | null>
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<Task | null>
  removeTask: (taskId: string) => Promise<boolean>
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<Task | null>
  reorderTasks: (taskId: string, newOrder: number) => Promise<void>
  setError: (error: string | null) => void
  clearTasks: () => void
  setOnLocalUpdate: (callback: ((taskId: string) => void) | null) => void

  // Derived state selectors
  getTodayTasks: () => Task[]
  getThisWeekTasks: () => Task[]
  getAnytimeTasks: () => Task[]
  getCompletedTasks: () => Task[]
  getUncompletedTasks: () => Task[]
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      isLoading: false,
      error: null,
      onLocalUpdate: null,

      // Fetch all tasks from the server
      fetchTasks: async () => {
        set({ isLoading: true, error: null })
        try {
          const tasks = await taskService.getTasks()
          set({ tasks, isLoading: false })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '获取任务列表失败'
          set({ error: errorMessage, isLoading: false })
          console.error('fetchTasks error:', error)
        }
      },

      // Add a new task (Optimistic UI)
      addTask: async (input: CreateTaskInput) => {
        // Create a temporary task for optimistic UI
        const tempTask: Task = {
          id: `temp-${Date.now()}`,
          user_id: '',
          title: input.title,
          description: input.description || null,
          time_sensitivity: input.time_sensitivity,
          estimated_duration: input.estimated_duration || null,
          is_completed: false,
          completed_at: null,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Optimistically add to state
        set(state => ({
          tasks: [tempTask, ...state.tasks],
          error: null,
        }))

        try {
          const newTask = await taskService.createTask(input)

          // Replace temporary task with real task
          set(state => ({
            tasks: state.tasks.map(t => (t.id === tempTask.id ? newTask : t)),
          }))

          // Notify realtime hook about local update
          const { onLocalUpdate } = get()
          if (onLocalUpdate) {
            onLocalUpdate(newTask.id)
          }

          return newTask
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== tempTask.id),
            error: error instanceof Error ? error.message : '创建任务失败',
          }))
          console.error('addTask error:', error)
          return null
        }
      },

      // Update a task (Optimistic UI)
      updateTask: async (taskId: string, input: UpdateTaskInput) => {
        // Store original task for rollback
        const originalTask = get().tasks.find(t => t.id === taskId)
        if (!originalTask) {
          set({ error: '任务不存在' })
          return null
        }

        // Optimistically update in state
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  ...input,
                  updated_at: new Date().toISOString(),
                  ...(input.is_completed !== undefined && {
                    completed_at: input.is_completed
                      ? new Date().toISOString()
                      : null,
                  }),
                }
              : t
          ),
          error: null,
        }))

        try {
          const updatedTask = await taskService.updateTask(taskId, input)

          // Replace with actual updated task from server
          set(state => ({
            tasks: state.tasks.map(t => (t.id === taskId ? updatedTask : t)),
          }))

          // Notify realtime hook about local update
          const { onLocalUpdate } = get()
          if (onLocalUpdate) {
            onLocalUpdate(taskId)
          }

          return updatedTask
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            tasks: state.tasks.map(t => (t.id === taskId ? originalTask : t)),
            error: error instanceof Error ? error.message : '更新任务失败',
          }))
          console.error('updateTask error:', error)
          return null
        }
      },

      // Remove a task (Optimistic UI)
      removeTask: async (taskId: string) => {
        // Store original task for rollback
        const originalTask = get().tasks.find(t => t.id === taskId)
        if (!originalTask) {
          set({ error: '任务不存在' })
          return false
        }

        // Optimistically remove from state
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId),
          error: null,
        }))

        try {
          await taskService.deleteTask(taskId)

          // Notify realtime hook about local update
          const { onLocalUpdate } = get()
          if (onLocalUpdate) {
            onLocalUpdate(taskId)
          }

          return true
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            tasks: [...state.tasks, originalTask].sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            error: error instanceof Error ? error.message : '删除任务失败',
          }))
          console.error('removeTask error:', error)
          return false
        }
      },

      // Toggle task completion status (Optimistic UI)
      toggleTaskCompletion: async (taskId: string, completed: boolean) => {
        return get().updateTask(taskId, { is_completed: completed })
      },

      // Reorder tasks (for drag-and-drop)
      reorderTasks: async (taskId: string, newOrder: number) => {
        // Optimistically update local state
        set(state => ({
          tasks: state.tasks
            .map(t => (t.id === taskId ? { ...t, display_order: newOrder } : t))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        }))

        try {
          await taskService.updateTask(taskId, { display_order: newOrder })

          // Notify realtime hook about local update
          const { onLocalUpdate } = get()
          if (onLocalUpdate) {
            onLocalUpdate(taskId)
          }
        } catch (error) {
          console.error('reorderTasks error:', error)
          set({ error: error instanceof Error ? error.message : '重新排序失败' })
          // Refetch tasks to restore correct order
          await get().fetchTasks()
        }
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error })
      },

      // Clear all tasks (for logout)
      clearTasks: () => {
        set({ tasks: [], error: null, isLoading: false })
      },

      // Set callback for local update notifications
      setOnLocalUpdate: (callback: ((taskId: string) => void) | null) => {
        set({ onLocalUpdate: callback })
      },

      // Derived state: Get tasks by time sensitivity = "today"
      getTodayTasks: () => {
        return get().tasks.filter(task => task.time_sensitivity === 'today')
      },

      // Derived state: Get tasks by time sensitivity = "this_week"
      getThisWeekTasks: () => {
        return get().tasks.filter(task => task.time_sensitivity === 'this_week')
      },

      // Derived state: Get tasks by time sensitivity = "anytime"
      getAnytimeTasks: () => {
        return get().tasks.filter(task => task.time_sensitivity === 'anytime')
      },

      // Derived state: Get completed tasks
      getCompletedTasks: () => {
        return get().tasks.filter(task => task.is_completed)
      },

      // Derived state: Get uncompleted tasks
      getUncompletedTasks: () => {
        return get().tasks.filter(task => !task.is_completed)
      },
    }),
    { name: 'TaskStore' }
  )
)
