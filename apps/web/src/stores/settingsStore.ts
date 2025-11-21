import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Settings for the Current View page
 */
export interface CurrentViewSettings {
  /** Maximum number of "anytime" tasks to display (1-10) */
  maxAnytimeTasks: number
  /** Automatically switch to next task after completion */
  autoSwitchAfterComplete: boolean
  /** Show celebration animation when completing tasks */
  celebrationAnimation: boolean
  /** Play sound effects when completing tasks */
  soundEffects: boolean
  /** Prioritize short tasks in the evening (after 18:00) */
  prioritizeShortTasks: boolean
}

/**
 * Settings for Pomodoro Timer
 */
export interface PomodoroSettings {
  /** Enable Pomodoro timer in Current View */
  enablePomodoro: boolean
  /** Work session duration in minutes */
  pomodoroWorkDuration: number
  /** Rest session duration in minutes */
  pomodoroRestDuration: number
  /** Enable sound notifications */
  pomodoroSoundEnabled: boolean
  /** Auto-start rest after work session completes */
  autoStartRest: boolean
}

interface SettingsStore {
  // State
  currentView: CurrentViewSettings
  pomodoro: PomodoroSettings

  // Actions
  updateCurrentViewSettings: (settings: Partial<CurrentViewSettings>) => void
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void
  resetToDefaults: () => void
  loadSettings: () => void
  saveSettings: () => void
}

/** Default settings for Current View */
export const DEFAULT_CURRENT_VIEW_SETTINGS: CurrentViewSettings = {
  maxAnytimeTasks: 3,
  autoSwitchAfterComplete: true,
  celebrationAnimation: true,
  soundEffects: false,
  prioritizeShortTasks: true,
}

/** Default settings for Pomodoro */
export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  enablePomodoro: false,
  pomodoroWorkDuration: 25,
  pomodoroRestDuration: 5,
  pomodoroSoundEnabled: false,
  autoStartRest: false,
}

const STORAGE_KEY = 'focus-flow-settings'

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentView: DEFAULT_CURRENT_VIEW_SETTINGS,
      pomodoro: DEFAULT_POMODORO_SETTINGS,

      // Update current view settings
      updateCurrentViewSettings: (settings: Partial<CurrentViewSettings>) => {
        set((state) => ({
          currentView: { ...state.currentView, ...settings },
        }))
        // Auto-save after update
        get().saveSettings()
      },

      // Update pomodoro settings
      updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, ...settings },
        }))
        // Auto-save after update
        get().saveSettings()
      },

      // Reset to default settings
      resetToDefaults: () => {
        set({
          currentView: DEFAULT_CURRENT_VIEW_SETTINGS,
          pomodoro: DEFAULT_POMODORO_SETTINGS,
        })
        get().saveSettings()
      },

      // Load settings from LocalStorage
      loadSettings: () => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) {
            const parsed = JSON.parse(saved)
            set({
              currentView: {
                ...DEFAULT_CURRENT_VIEW_SETTINGS,
                ...parsed.currentView,
              },
              pomodoro: {
                ...DEFAULT_POMODORO_SETTINGS,
                ...parsed.pomodoro,
              },
            })
            console.log('[Settings] Loaded settings from LocalStorage:', parsed)
          }
        } catch (error) {
          console.error('[Settings] Failed to load settings:', error)
          // Fall back to defaults
          set({
            currentView: DEFAULT_CURRENT_VIEW_SETTINGS,
            pomodoro: DEFAULT_POMODORO_SETTINGS,
          })
        }
      },

      // Save settings to LocalStorage
      saveSettings: () => {
        try {
          const { currentView, pomodoro } = get()
          const data = { currentView, pomodoro }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          console.log('[Settings] Saved settings to LocalStorage:', data)
        } catch (error) {
          console.error('[Settings] Failed to save settings:', error)
        }
      },
    }),
    { name: 'SettingsStore' }
  )
)
