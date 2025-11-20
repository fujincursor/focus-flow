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

interface SettingsStore {
  // State
  currentView: CurrentViewSettings

  // Actions
  updateCurrentViewSettings: (settings: Partial<CurrentViewSettings>) => void
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

const STORAGE_KEY = 'focus-flow-settings'

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentView: DEFAULT_CURRENT_VIEW_SETTINGS,

      // Update current view settings
      updateCurrentViewSettings: (settings: Partial<CurrentViewSettings>) => {
        set((state) => ({
          currentView: { ...state.currentView, ...settings },
        }))
        // Auto-save after update
        get().saveSettings()
      },

      // Reset to default settings
      resetToDefaults: () => {
        set({ currentView: DEFAULT_CURRENT_VIEW_SETTINGS })
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
            })
            console.log('[Settings] Loaded settings from LocalStorage:', parsed)
          }
        } catch (error) {
          console.error('[Settings] Failed to load settings:', error)
          // Fall back to defaults
          set({ currentView: DEFAULT_CURRENT_VIEW_SETTINGS })
        }
      },

      // Save settings to LocalStorage
      saveSettings: () => {
        try {
          const { currentView } = get()
          const data = { currentView }
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
