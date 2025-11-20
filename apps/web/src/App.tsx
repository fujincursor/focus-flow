import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/components/theme-provider'
import { ProtectedRoute } from '@/components/auth'
import { AppLayout } from '@/components/layout'
import { Toaster } from '@/components/ui/toaster'
import {
  CurrentViewPage,
  CurrentTaskPage,
  TasksPage,
  DailySummaryPage,
  StatisticsPage,
  SettingsPage,
  LoginPage,
  SignupPage,
  DebugPage,
} from '@/pages'

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth)
  const initAuthListener = useAuthStore(state => state.initAuthListener)

  useEffect(() => {
    // 初始化时检查认证状态
    checkAuth()

    // 监听认证状态变化
    const unsubscribe = initAuthListener()

    return () => {
      unsubscribe()
    }
  }, [checkAuth, initAuthListener])

  return (
    <ThemeProvider defaultTheme="system" storageKey="focus-flow-theme">
      <BrowserRouter>
        <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/debug" element={<DebugPage />} />

        {/* 受保护路由 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CurrentViewPage />} />
            <Route path="/current" element={<CurrentTaskPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/daily-summary" element={<DailySummaryPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
