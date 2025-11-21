import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PomodoroSession } from '@/types/pomodoro'
import * as pomodoroService from '@/services/pomodoroService'

interface PomodoroStore {
  currentSession: PomodoroSession | null
  todaySessions: PomodoroSession[]
  error: string | null

  // Actions
  startSession: (taskId?: string, sessionType?: 'work' | 'rest', duration?: number) => Promise<void>
  completeSession: () => Promise<void>
  cancelSession: () => Promise<void>
  fetchTodaySessions: () => Promise<void>
  clearError: () => void
}

export const usePomodoroStore = create<PomodoroStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        todaySessions: [],
        error: null,

        startSession: async (taskId, sessionType = 'work', duration = 25 * 60) => {
          try {
            const session = await pomodoroService.startSession({
              task_id: taskId || null,
              session_type: sessionType,
              duration,
            })
            set({ currentSession: session, error: null })
          } catch (error) {
            const message = error instanceof Error ? error.message : '开始番茄钟失败'
            set({ error: message })
            throw error
          }
        },

        completeSession: async () => {
          const { currentSession } = get()
          if (!currentSession) return

          try {
            await pomodoroService.completeSession(currentSession.id)
            set({ currentSession: null, error: null })
            await get().fetchTodaySessions() // 刷新今日列表
          } catch (error) {
            const message = error instanceof Error ? error.message : '完成番茄钟失败'
            set({ error: message })
            throw error
          }
        },

        cancelSession: async () => {
          const { currentSession } = get()
          if (!currentSession) return

          try {
            await pomodoroService.cancelSession(currentSession.id)
            set({ currentSession: null, error: null })
          } catch (error) {
            const message = error instanceof Error ? error.message : '取消番茄钟失败'
            set({ error: message })
            throw error
          }
        },

        fetchTodaySessions: async () => {
          try {
            const sessions = await pomodoroService.getTodaySessions()
            set({ todaySessions: sessions, error: null })
          } catch (error) {
            const message = error instanceof Error ? error.message : '获取番茄钟列表失败'
            set({ error: message })
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'pomodoro-storage',
        partialize: (state) => ({
          currentSession: state.currentSession, // 持久化当前会话
        }),
      }
    )
  )
)
