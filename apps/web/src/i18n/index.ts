import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '@/locales/en/common.json'
import zhCommon from '@/locales/zh/common.json'
import enAuth from '@/locales/en/auth.json'
import zhAuth from '@/locales/zh/auth.json'
import enTasks from '@/locales/en/tasks.json'
import zhTasks from '@/locales/zh/tasks.json'
import enSettings from '@/locales/en/settings.json'
import zhSettings from '@/locales/zh/settings.json'
import enSummary from '@/locales/en/summary.json'
import zhSummary from '@/locales/zh/summary.json'
import enCurrentView from '@/locales/en/currentView.json'
import zhCurrentView from '@/locales/zh/currentView.json'
import enPomodoro from '@/locales/en/pomodoro.json'
import zhPomodoro from '@/locales/zh/pomodoro.json'
import enStatistics from '@/locales/en/statistics.json'
import zhStatistics from '@/locales/zh/statistics.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    tasks: enTasks,
    settings: enSettings,
    summary: enSummary,
    currentView: enCurrentView,
    pomodoro: enPomodoro,
    statistics: enStatistics,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    tasks: zhTasks,
    settings: zhSettings,
    summary: zhSummary,
    currentView: zhCurrentView,
    pomodoro: zhPomodoro,
    statistics: zhStatistics,
  },
}

i18n
  .use(LanguageDetector) // Detect language from localStorage or browser
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language is English
    defaultNS: 'common',
    ns: ['common', 'auth', 'tasks', 'settings', 'summary', 'currentView', 'pomodoro', 'statistics'],

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already handles XSS protection
    },

    react: {
      useSuspense: false, // Disable suspense for now (can enable later)
    },
  })

export default i18n
