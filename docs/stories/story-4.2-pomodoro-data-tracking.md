# Story 4.2: 番茄钟数据追踪与持久化

**Epic:** Epic 4 - 番茄工作法集成 (Pomodoro Integration)
**Story ID:** 4.2
**优先级:** P0 (V1.1 核心功能)
**预估工作量:** 10小时
**状态:** Ready for Development
**依赖:** Story 4.1 - 番茄计时器 UI 组件

---

## 用户故事

**作为** Focus Flow 用户，
**我想要** 自动记录每个完成的番茄钟到数据库，并在每日总结中查看统计数据，
**以便** 我可以量化我的工作时长并跟踪我的专注模式。

---

## 故事上下文

### Existing System Integration

- **Integrates with:**
  - `summaryService.ts` - 每日总结数据聚合
  - `taskStore.ts` - 任务状态管理
  - Supabase PostgreSQL 数据库
  - `DailySummaryPage.tsx` - 每日总结视图
- **Technology:**
  - Supabase (PostgreSQL + RLS)
  - Zustand for state management
  - Zod for schema validation
- **Follows pattern:**
  - Service 层模式（参考 `taskService.ts`, `summaryService.ts`）
  - Zustand store 模式（参考 `taskStore.ts`）
  - Database migration 模式（参考 `supabase/migrations/`）
- **Touch points:**
  - 新增 `pomodoro_sessions` 数据库表
  - 更新 `daily_summaries` 表查询逻辑
  - 新增 `pomodoroService.ts` 服务层
  - 扩展 `usePomodoroStore` Zustand store

---

## 验收标准

### Functional Requirements

1. **[必需] 数据库 Schema 设计**
   - 创建 `pomodoro_sessions` 表，包含字段：
     - `id` (UUID, primary key)
     - `user_id` (UUID, foreign key to auth.users)
     - `task_id` (UUID, nullable, foreign key to tasks)
     - `session_type` (TEXT: 'work' | 'rest')
     - `start_time` (TIMESTAMP WITH TIME ZONE)
     - `end_time` (TIMESTAMP WITH TIME ZONE, nullable)
     - `duration` (INTEGER, 秒数)
     - `completed` (BOOLEAN, 是否完成整个番茄钟)
     - `created_at` (TIMESTAMP WITH TIME ZONE)
   - 添加 RLS 策略（用户只能访问自己的番茄钟数据）
   - 创建索引：`(user_id, created_at DESC)`

2. **[必需] Pomodoro Service 层**
   - 创建 `pomodoroService.ts` 提供以下方法：
     - `startSession(taskId?, sessionType)` - 开始新番茄钟
     - `completeSession(sessionId)` - 标记番茄钟完成
     - `cancelSession(sessionId)` - 取消未完成的番茄钟
     - `getTodaySessions(userId)` - 获取今日所有番茄钟
     - `getSessionsByDateRange(userId, startDate, endDate)` - 按日期范围查询
   - 所有方法使用 Zod schema 验证输入参数

3. **[必需] Zustand Store 集成**
   - 创建 `pomodoroStore.ts` 管理番茄钟状态：
     - `currentSession` - 当前进行中的番茄钟
     - `todaySessions` - 今日完成的番茄钟列表
     - `startSession()`, `completeSession()`, `cancelSession()` actions
     - 状态持久化到 `localStorage`（页面刷新后恢复）

4. **[必需] 每日总结集成**
   - 更新 `summaryService.ts` 的 `getSummaryWithTasks()` 方法：
     - 计算今日完成的番茄钟数量（`completed === true`）
     - 累加总工作时长（所有 `session_type === 'work'` 的 duration）
   - 在 `DailySummaryPage.tsx` 显示番茄钟统计：
     - "今日完成 X 个番茄钟"
     - "专注时长：X 小时 Y 分钟"

5. **[必需] 数据同步与准确性**
   - 番茄钟完成后，立即保存到数据库（不等待用户操作）
   - 如果网络错误，重试 3 次（指数退避）
   - 使用乐观更新：本地状态先更新，然后同步到数据库

### Integration Requirements

6. **[必需] Pomodoro Timer 集成**
   - 在 `PomodoroTimer` 组件中调用 `pomodoroStore` 方法
   - 工作期开始时调用 `startSession(taskId, 'work')`
   - 工作期完成时调用 `completeSession(sessionId)`
   - 取消番茄钟时调用 `cancelSession(sessionId)`

7. **[必需] 遵循现有数据库模式**
   - 使用 UUID 作为主键
   - 使用 RLS 策略隔离用户数据
   - 外键关联到 `auth.users` 和 `tasks` 表
   - Timestamp 使用 `TIMESTAMP WITH TIME ZONE`

8. **[必需] 错误处理**
   - 数据库错误时显示 Toast 提示用户
   - 网络错误时自动重试，失败后保存到本地队列
   - 提供"同步失败的番茄钟"功能（后台自动重试）

### Quality Requirements

9. **[必需] 单元测试覆盖**
   - 测试 `pomodoroService` 所有方法（使用 Supabase local）
   - 测试 `pomodoroStore` 状态转换
   - 测试 `summaryService` 番茄钟统计逻辑
   - 测试边界情况（取消番茄钟、网络错误等）

10. **[必需] 集成测试**
    - 端到端测试：启动番茄钟 → 完成 → 查看每日总结
    - 测试 RLS 策略（用户 A 无法访问用户 B 的番茄钟）
    - 测试数据同步（离线创建 → 上线后自动同步）

11. **[必需] 现有功能无回归**
    - `daily_summaries` 表查询正常
    - `DailySummaryPage` 现有统计（完成任务数、创建任务数）不受影响
    - 任务管理功能（CRUD）正常

---

## 技术细节

### 数据库迁移

**文件：** `supabase/migrations/20251121000000_create_pomodoro_sessions.sql`

```sql
-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('work', 'rest')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL DEFAULT 0, -- 秒数
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_pomodoro_sessions_user_created
  ON pomodoro_sessions(user_id, created_at DESC);

CREATE INDEX idx_pomodoro_sessions_task
  ON pomodoro_sessions(task_id)
  WHERE task_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pomodoro sessions"
  ON pomodoro_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
  ON pomodoro_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
  ON pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
  ON pomodoro_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON pomodoro_sessions TO authenticated;
GRANT ALL ON pomodoro_sessions TO service_role;

-- Add comment
COMMENT ON TABLE pomodoro_sessions IS 'Stores completed and in-progress pomodoro timer sessions';
```

### Zod Schema

**文件：** `apps/web/src/types/pomodoro.ts`

```typescript
import { z } from 'zod'

export const pomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  task_id: z.string().uuid().nullable().optional(),
  session_type: z.enum(['work', 'rest']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().nullable().optional(),
  duration: z.number().int().min(0),
  completed: z.boolean(),
  created_at: z.string().datetime(),
})

export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>

export const createPomodoroSessionSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  session_type: z.enum(['work', 'rest']),
  duration: z.number().int().min(0).max(7200), // 最多2小时
})

export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>
```

### Service 层实现

**文件：** `apps/web/src/services/pomodoroService.ts`

```typescript
import { supabase } from '@/lib/supabase/client'
import { getAuthUser } from '@/lib/supabase/auth'
import type { PomodoroSession, CreatePomodoroSessionInput } from '@/types/pomodoro'

/**
 * 开始新的番茄钟会话
 */
export async function startSession(
  input: CreatePomodoroSessionInput
): Promise<PomodoroSession | null> {
  const user = await getAuthUser()
  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: user.user.id,
      task_id: input.task_id,
      session_type: input.session_type,
      duration: input.duration,
      start_time: new Date().toISOString(),
      completed: false,
    })
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
 */
export async function completeSession(sessionId: string): Promise<void> {
  const user = await getAuthUser()
  if (!user) throw new Error('用户未登录')

  const { error } = await supabase
    .from('pomodoro_sessions')
    .update({
      end_time: new Date().toISOString(),
      completed: true,
    })
    .eq('id', sessionId)
    .eq('user_id', user.user.id)

  if (error) {
    console.error('completeSession error:', error)
    throw new Error('完成番茄钟失败')
  }
}

/**
 * 取消番茄钟会话
 */
export async function cancelSession(sessionId: string): Promise<void> {
  const user = await getAuthUser()
  if (!user) throw new Error('用户未登录')

  const { error } = await supabase
    .from('pomodoro_sessions')
    .update({
      end_time: new Date().toISOString(),
      completed: false,
    })
    .eq('id', sessionId)
    .eq('user_id', user.user.id)

  if (error) {
    console.error('cancelSession error:', error)
    throw new Error('取消番茄钟失败')
  }
}

/**
 * 获取今日所有番茄钟会话
 */
export async function getTodaySessions(): Promise<PomodoroSession[]> {
  const user = await getAuthUser()
  if (!user) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.user.id)
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
  const user = await getAuthUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.user.id)
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
```

### Zustand Store

**文件：** `apps/web/src/stores/pomodoroStore.ts`

```typescript
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
```

### 集成到 DailySummaryPage

**文件：** `apps/web/src/pages/DailySummaryPage.tsx` (部分更新)

```typescript
import { getTodayPomodoroStats } from '@/services/pomodoroService'

export function DailySummaryPage() {
  const [pomodoroStats, setPomodoroStats] = useState<{
    completedCount: number
    totalWorkDuration: number
  } | null>(null)

  useEffect(() => {
    async function loadData() {
      const [summary, stats] = await Promise.all([
        getSummaryWithTasks(today),
        getTodayPomodoroStats(),
      ])
      setSummary(summary)
      setPomodoroStats(stats)
    }
    loadData()
  }, [today])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours} 小时 ${minutes} 分钟`
  }

  return (
    <div className="space-y-6">
      {/* 现有统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>完成任务</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.completed_tasks_count || 0}</p>
          </CardContent>
        </Card>

        {/* 新增：番茄钟统计 */}
        <Card>
          <CardHeader>
            <CardTitle>完成番茄钟</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pomodoroStats?.completedCount || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              专注时长：{formatDuration(pomodoroStats?.totalWorkDuration || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 风险与兼容性

### Minimal Risk Assessment

**Primary Risk:** 网络错误导致番茄钟数据丢失

**Mitigation:**
- 使用乐观更新（先更新本地状态）
- 失败时自动重试 3 次（指数退避：1s, 2s, 4s）
- 将失败的请求保存到 `localStorage` 队列，下次在线时自动同步

**Rollback:**
- `pomodoro_sessions` 表是独立的，删除表即可回滚
- 更新 `summaryService.ts` 的改动是纯新增（不影响现有逻辑）

### Compatibility Verification

- [x] **No breaking changes to existing APIs** - 新增 service 方法，不修改现有方法
- [x] **Database changes are additive only** - 新增表，不修改现有表
- [x] **UI changes follow existing design patterns** - 使用现有 Card 组件样式
- [x] **Performance impact is minimal** - 索引优化查询，RLS 策略高效

---

## Definition of Done

- [ ] `pomodoro_sessions` 表创建并通过 Supabase migration
- [ ] RLS 策略生效（用户 A 无法访问用户 B 的数据）
- [ ] `pomodoroService.ts` 所有方法实现并通过单元测试
- [ ] `pomodoroStore.ts` 状态管理正确，支持持久化
- [ ] 集成到 `DailySummaryPage.tsx` 显示番茄钟统计
- [ ] 今日总结页面显示"完成 X 个番茄钟"和"专注时长"
- [ ] 错误处理健壮（网络错误、数据库错误）
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 集成测试通过（E2E 流程）
- [ ] 现有功能无回归（每日总结其他统计正常）
- [ ] 代码符合 ESLint 规则

---

## 测试策略

### 单元测试用例（Vitest + Supabase Local）

```typescript
// pomodoroService.test.ts

describe('pomodoroService', () => {
  beforeEach(async () => {
    // 清空测试数据
    await supabase.from('pomodoro_sessions').delete().neq('id', '')
  })

  it('should create a new work session', async () => {
    const session = await startSession({
      task_id: null,
      session_type: 'work',
      duration: 1500, // 25分钟
    })

    expect(session).toMatchObject({
      session_type: 'work',
      duration: 1500,
      completed: false,
    })
    expect(session.id).toBeDefined()
  })

  it('should complete a session', async () => {
    const session = await startSession({
      task_id: null,
      session_type: 'work',
      duration: 1500,
    })

    await completeSession(session.id)

    const { data } = await supabase
      .from('pomodoro_sessions')
      .select()
      .eq('id', session.id)
      .single()

    expect(data.completed).toBe(true)
    expect(data.end_time).toBeDefined()
  })

  it('should get today sessions only', async () => {
    // 创建今日会话
    await startSession({ task_id: null, session_type: 'work', duration: 1500 })

    // 创建昨日会话（手动插入）
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    await supabase.from('pomodoro_sessions').insert({
      user_id: (await getAuthUser()).user.id,
      session_type: 'work',
      duration: 1500,
      created_at: yesterday.toISOString(),
    })

    const todaySessions = await getTodaySessions()
    expect(todaySessions).toHaveLength(1)
  })

  it('should calculate pomodoro stats correctly', async () => {
    // 创建2个完成的工作会话
    const session1 = await startSession({ task_id: null, session_type: 'work', duration: 1500 })
    await completeSession(session1.id)

    const session2 = await startSession({ task_id: null, session_type: 'work', duration: 1500 })
    await completeSession(session2.id)

    // 创建1个未完成的会话（不应计入）
    await startSession({ task_id: null, session_type: 'work', duration: 1500 })

    const stats = await getTodayPomodoroStats()
    expect(stats.completedCount).toBe(2)
    expect(stats.totalWorkDuration).toBe(3000) // 1500 * 2
  })
})
```

### 集成测试用例（Playwright E2E）

```typescript
// pomodoro-integration.spec.ts

test('should complete a pomodoro session and see stats in daily summary', async ({ page }) => {
  // 登录
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button:has-text("登录")')

  // 前往"专注当下"页面
  await page.goto('/current-view')

  // 启动番茄钟（假设 Story 4.1 已完成）
  await page.click('button:has-text("开始")')

  // 快进时间（使用 test clock）
  await page.clock.fastForward(25 * 60 * 1000) // 25分钟

  // 验证工作期结束
  await expect(page.locator('text=工作期结束')).toBeVisible()

  // 前往每日总结页面
  await page.goto('/daily-summary')

  // 验证番茄钟统计
  await expect(page.locator('text=完成番茄钟')).toBeVisible()
  await expect(page.locator('text=1')).toBeVisible() // 完成1个番茄钟
  await expect(page.locator('text=专注时长：0 小时 25 分钟')).toBeVisible()
})
```

---

## 参考资料

- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **Zustand Persist**: https://github.com/pmndrs/zustand#persist-middleware
- **PostgreSQL TIMESTAMP**: https://www.postgresql.org/docs/current/datatype-datetime.html

---

## 下一步

完成此 Story 后，继续 **Story 4.3: 专注当下视图集成**，将番茄计时器无缝嵌入到 `CurrentViewPage.tsx`，并添加设置开关。
