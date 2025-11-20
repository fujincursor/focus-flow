# Story 1.6: 实现路由保护和认证状态管理

**Epic:** Epic 1 - 项目基础设施与用户认证
**Story ID:** 1.6
**优先级:** 高
**预估工作量:** 4小时
**状态:** Ready for Review

---

## 用户故事

**作为** 系统，
**我想要** 确保未登录用户无法访问受保护的页面，
**以便** 保护用户数据安全并引导用户完成登录。

---

## 验收标准

1. ✅ 创建`src/stores/authStore.ts`（Zustand），管理认证状态
2. ✅ 实现authStore的actions（setUser、clearUser、checkAuth）
3. ✅ 创建`src/components/features/auth/ProtectedRoute.tsx`组件
4. ✅ 在App.tsx中配置React Router路由（公开和受保护路由）
5. ✅ 应用启动时调用checkAuth恢复认证状态
6. ✅ 监听Supabase Auth状态变化，自动更新authStore
7. ✅ 实现退出登录功能
8. ✅ 路由切换时显示加载状态
9. ✅ 受保护路由未登录时重定向到登录页

---

## 技术细节

### 技术栈
- **状态管理:** Zustand 4.5+
- **路由:** React Router 6.20+
- **认证:** Supabase Auth
- **类型检查:** TypeScript (strict mode)

### Auth Store架构

**authStore.ts结构:**
```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  clearUser: () => void
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    setUser: (user) => set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null
    }),

    clearUser: () => set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    }),

    checkAuth: async () => {
      try {
        set({ isLoading: true })
        const { data: { session } } = await supabase.auth.getSession()
        set({
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false
        })
      } catch (error) {
        set({
          error: 'Failed to check authentication',
          isLoading: false
        })
      }
    },

    signOut: async () => {
      await supabase.auth.signOut()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    }
  }))
)
```

### ProtectedRoute组件

**ProtectedRoute.tsx:**
```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
```

### 路由配置

**App.tsx路由结构:**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { CurrentViewPage } from '@/pages/CurrentViewPage'
import { TasksPage } from '@/pages/TasksPage'
import { SummaryPage } from '@/pages/SummaryPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 初始化时检查认证状态
    checkAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          useAuthStore.getState().setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().clearUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 受保护路由 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/current" replace />} />
          <Route path="/current" element={<CurrentViewPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Auth状态持久化

Zustand会自动在组件重新渲染时保持状态，但页面刷新后需要从Supabase恢复session：

```typescript
// checkAuth函数使用Supabase的getSession
// Session存储在localStorage中，Supabase自动管理
```

---

## 任务清单

### 准备工作
- [ ] 确认Supabase客户端已配置（Story 1.3）
- [ ] 确认React Router已安装
- [ ] 确认Zustand已安装

### 实现Auth Store
- [ ] 创建`src/stores/authStore.ts`
- [ ] 定义AuthState接口
- [ ] 实现setUser、clearUser、checkAuth、signOut actions
- [ ] 配置Zustand devtools中间件
- [ ] 为authStore编写单元测试

### 实现ProtectedRoute组件
- [ ] 创建`src/components/features/auth/ProtectedRoute.tsx`
- [ ] 实现加载状态显示
- [ ] 实现未认证时重定向逻辑
- [ ] 为ProtectedRoute编写单元测试

### 配置路由
- [ ] 在App.tsx中配置React Router
- [ ] 定义公开路由（/login, /signup）
- [ ] 定义受保护路由（/, /current, /tasks, /summary, /settings）
- [ ] 实现应用启动时的checkAuth调用
- [ ] 实现Auth状态变化监听

### 实现退出登录
- [ ] 在Header/Sidebar添加退出按钮
- [ ] 调用authStore.signOut()
- [ ] 退出后重定向到登录页
- [ ] 清除所有用户相关状态

### 测试与验证
- [ ] 测试未登录访问受保护路由自动重定向
- [ ] 测试登录后可访问受保护路由
- [ ] 测试页面刷新后认证状态保持
- [ ] 测试退出登录功能
- [ ] 测试多设备登录状态同步

---

## 测试策略

### 单元测试（Vitest + Testing Library）

**authStore测试:**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/stores/authStore'

describe('authStore', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should set user on setUser action', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = { id: '123', email: 'test@example.com' }

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should clear user on signOut', async () => {
    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

**ProtectedRoute测试:**
```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

jest.mock('@/stores/authStore')

describe('ProtectedRoute', () => {
  it('should show loading spinner when checking auth', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    })

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should render children when authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
```

### E2E测试（Playwright）

**认证流程测试:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/current')
    await expect(page).toHaveURL(/.*login/)
  })

  test('should access protected routes after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('[type="submit"]')

    await expect(page).toHaveURL(/.*current/)
  })

  test('should maintain auth state after page refresh', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('[type="submit"]')

    // 刷新页面
    await page.reload()

    // 应该仍然在受保护路由
    await expect(page).toHaveURL(/.*current/)
  })

  test('should logout and redirect to login', async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('[type="submit"]')

    // 点击退出按钮
    await page.click('[data-testid="logout-button"]')

    // 应该重定向到登录页
    await expect(page).toHaveURL(/.*login/)
  })
})
```

---

## 依赖关系

**前置依赖:**
- Story 1.3（Supabase客户端和错误处理基础设施）
- Story 1.4（用户注册功能）
- Story 1.5（用户登录功能）

**后续Story:**
- Story 1.7（配置CI/CD流水线和自动化部署）
- Story 1.8（创建基础布局组件和应用外壳）

---

## 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Auth状态竞态条件 | 高 | 中 | 使用Supabase的onAuthStateChange监听器 |
| 刷新后session丢失 | 高 | 低 | Supabase自动将session存储在localStorage |
| 路由保护绕过 | 高 | 低 | 结合RLS策略双重保护 |
| Loading状态闪烁 | 中 | 中 | 优化checkAuth性能，添加最小显示时间 |
| 退出后状态残留 | 中 | 中 | clearUser时清除所有相关store状态 |

---

## 开发笔记

### 参考资料
- [Zustand官方文档](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#protected-routes)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### 最佳实践
1. **Auth状态同步**: 使用Supabase的onAuthStateChange确保多标签页同步
2. **Loading UX**: 提供清晰的加载状态，避免页面闪烁
3. **错误处理**: 网络错误时保留上次的认证状态
4. **Token刷新**: Supabase自动处理token刷新，无需手动实现
5. **安全性**: 前端路由保护 + 后端RLS策略双重保护

### 注意事项
- checkAuth应该在App组件mount时立即调用
- onAuthStateChange订阅必须在组件卸载时取消订阅
- 避免在ProtectedRoute中进行数据获取，应在页面组件中处理
- 退出登录时需要清除所有用户相关的全局状态（taskStore、settingsStore等）

---

## Dev Agent Record

### Agent Model Used
- Model: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Tasks
- [x] 实现authStore
- [x] 实现ProtectedRoute组件
- [x] 配置路由
- [x] 实现退出登录
- [x] 编写测试

### Debug Log References
1. **测试失败 - 初始化状态**: beforeEach 中的 clearUser() 导致 isLoading 为 false，修改为不在 beforeEach 中重置状态
2. **测试失败 - signOut 错误处理**: supabase.auth.signOut() 返回对象而非抛出异常，需要检查 error 并手动抛出

### Completion Notes
Story 1.6 已成功完成。路由保护和认证状态管理功能已完全实现：

**已完成的功能：**
1. ✅ authStore (apps/web/src/stores/authStore.ts)
   - 使用 Zustand + devtools 中间件
   - 实现 setUser、clearUser、checkAuth、signOut actions
   - 实现 initAuthListener 监听 Supabase auth 状态变化
   - 使用新的 authService 函数（getCurrentUser）

2. ✅ ProtectedRoute (apps/web/src/components/auth/ProtectedRoute.tsx)
   - 使用 <Outlet /> 模式（符合 React Router 6 最佳实践）
   - 加载状态显示（Loader2 组件）
   - 未认证时自动重定向到 /login

3. ✅ App.tsx 路由配置
   - 应用启动时调用 checkAuth
   - 使用 initAuthListener 监听认证状态变化
   - 正确配置公开路由和受保护路由
   - 嵌套路由结构（ProtectedRoute > AppLayout > 页面）

4. ✅ LoginPage 集成 authStore
   - 登录成功后调用 setUser(user)
   - 自动更新全局认证状态

5. ✅ 单元测试
   - authStore.test.ts（12个测试，全部通过）
     - 初始化状态
     - setUser / clearUser
     - checkAuth（成功、失败、错误）
     - signOut（成功、失败）
     - initAuthListener（订阅、SIGNED_IN、SIGNED_OUT 事件）
   - ProtectedRoute.test.tsx（4个测试，全部通过）
     - 加载状态显示
     - 未认证重定向
     - 认证后渲染内容
     - 嵌套路由支持

**测试结果：**
```
Test Files  6 passed (6)
Tests       48 passed (48)
Duration    2.60s
```

所有测试包括：
- 验证 schema 测试（11个）
- authService 测试（8个）
- errorHandler 测试（6个）
- utils 测试（7个）
- authStore 测试（12个，新增）
- ProtectedRoute 测试（4个，新增）

### File List
修改或创建的文件：
- `apps/web/src/stores/authStore.ts` - 重写使用新的 authService 函数
- `apps/web/src/components/auth/ProtectedRoute.tsx` - 更新为 Outlet 模式
- `apps/web/src/App.tsx` - 更新路由结构和 auth 监听
- `apps/web/src/pages/LoginPage.tsx` - 添加 setUser 调用
- `apps/web/src/stores/__tests__/authStore.test.ts` - 新增
- `apps/web/src/components/auth/__tests__/ProtectedRoute.test.tsx` - 新增

### Change Log
- 2025-11-19: 重写 authStore，移除对旧 authService 对象模式的依赖
- 2025-11-19: 使用 getCurrentUser 函数和 supabase.auth 直接调用
- 2025-11-19: 更新 ProtectedRoute 为 Outlet 模式
- 2025-11-19: 修复 App.tsx 路由结构，正确嵌套 ProtectedRoute 和 AppLayout
- 2025-11-19: 添加 authStore 和 ProtectedRoute 单元测试（16个测试，全部通过）
- 2025-11-19: 修复 signOut 实现，正确处理 Supabase 返回的 error 对象

---

**最后更新:** 2025-11-19
**创建者:** PM John
