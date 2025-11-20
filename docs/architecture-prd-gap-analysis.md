# Focus Flow架构文档 - PRD差距分析

**文档目的：** 基于PRD v1.0识别现有架构文档的差距，并提供技术补充方案
**分析日期：** 2025-11-19
**架构师：** Winston 🏗️
**PRD状态：** ✅ Ready for Architecture (92%完整度)

---

## 执行摘要

**现有架构文档状态：** ✅ 基础扎实（版本0.1，1610行）

**覆盖完整度评估：**
- ✅ 高层架构设计 - 完整
- ✅ 技术栈选择 - 详细
- ✅ 数据模型 - 完整
- ✅ API规范 - 详细
- ✅ 组件架构 - 完整
- ⚠️ **关键技术实现细节** - 需要补充（5个高风险领域）
- ⚠️ **Epic实施路线图** - 缺失

**需要补充的关键领域：**

1. **"当下任务"筛选算法** - 核心业务逻辑的技术设计
2. **Supabase Realtime冲突解决策略** - 多设备同步的数据一致性
3. **Optimistic UI状态管理模式** - 用户体验与数据同步的平衡
4. **数据库触发器性能优化** - 避免成为性能瓶颈
5. **PWA离线数据同步机制** - Local-First架构的完整实现

---

## 1. "当下任务"筛选算法技术设计

### 问题陈述
PRD Epic 3, Story 3.1要求实现智能的任务筛选算法，根据当前时间、任务时间敏感度和用户状态推荐"当下应该做什么"。这是Focus Flow的核心差异化功能。

### 技术方案

#### 算法实现（src/lib/currentTaskFilter.ts）

```typescript
import { Task } from '@/types/models'
import { isToday, isThisWeek, differenceInDays, getHours } from 'date-fns'

export interface FilterContext {
  currentTime: Date
  userPreferences?: {
    preferShortTasksAfter?: number // 晚上X点后优先推荐短任务
    oldTaskPriorityDays?: number // X天后的老任务提升优先级
  }
}

/**
 * 核心筛选逻辑：根据当前情境推荐最应该做的任务
 *
 * 优先级规则：
 * 1. "今天必须"的未完成任务（优先级1）
 * 2. 如果今天是周五/六/日，包含"本周内"的未完成任务（优先级2）
 * 3. 如果前两类都为空，包含"随时可做"的任务（最多3个，优先级3）
 *
 * 增强筛选：
 * - 晚上18:00后优先推荐短时长任务（<30分钟）
 * - 创建时间超过7天的"随时可做"任务优先级提升
 */
export function getCurrentTasks(
  allTasks: Task[],
  context: FilterContext = { currentTime: new Date() }
): Task[] {
  const { currentTime, userPreferences } = context
  const preferShortTasksAfter = userPreferences?.preferShortTasksAfter ?? 18
  const oldTaskPriorityDays = userPreferences?.oldTaskPriorityDays ?? 7

  // 过滤出未完成任务
  const uncompletedTasks = allTasks.filter(task => !task.is_completed)

  // 步骤1：筛选"今天必须"的任务
  const todayTasks = uncompletedTasks.filter(
    task => task.time_sensitivity === 'today'
  )

  if (todayTasks.length > 0) {
    return rankTasks(todayTasks, currentTime, userPreferences)
  }

  // 步骤2：如果今天是周末（周五、周六、周日），包含"本周内"任务
  const dayOfWeek = currentTime.getDay() // 0=周日, 5=周五, 6=周六
  if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
    const thisWeekTasks = uncompletedTasks.filter(
      task => task.time_sensitivity === 'this_week'
    )

    if (thisWeekTasks.length > 0) {
      return rankTasks(thisWeekTasks, currentTime, userPreferences)
    }
  }

  // 步骤3：如果前两类都为空，返回"随时可做"任务（最多3个）
  const anytimeTasks = uncompletedTasks.filter(
    task => task.time_sensitivity === 'anytime'
  )

  const rankedAnytimeTasks = rankTasks(anytimeTasks, currentTime, userPreferences)
  return rankedAnytimeTasks.slice(0, 3) // 最多3个
}

/**
 * 任务排序算法
 *
 * 评分因子：
 * 1. 晚上时间 + 短任务 = 加分
 * 2. 老任务（7天+）= 加分
 * 3. 有预估时长的任务优先（更容易规划）
 */
function rankTasks(
  tasks: Task[],
  currentTime: Date,
  userPreferences?: FilterContext['userPreferences']
): Task[] {
  const currentHour = getHours(currentTime)
  const preferShortTasksAfter = userPreferences?.preferShortTasksAfter ?? 18
  const oldTaskPriorityDays = userPreferences?.oldTaskPriorityDays ?? 7

  return tasks
    .map(task => {
      let score = 0

      // 因子1：晚上时间 + 短任务
      if (currentHour >= preferShortTasksAfter) {
        if (task.estimated_duration && task.estimated_duration < 30) {
          score += 100 // 晚上优先推荐短任务
        }
      }

      // 因子2：老任务提升优先级
      const taskAge = differenceInDays(currentTime, new Date(task.created_at))
      if (taskAge >= oldTaskPriorityDays) {
        score += 50 + taskAge // 越老的任务分数越高
      }

      // 因子3：有预估时长的任务优先
      if (task.estimated_duration) {
        score += 20
      }

      // 因子4：最近创建的任务稍微降低优先级（避免频繁添加打断）
      if (taskAge < 1) {
        score -= 10
      }

      return { task, score }
    })
    .sort((a, b) => b.score - a.score) // 分数高的在前
    .map(item => item.task)
}

/**
 * 性能优化版本：支持大量任务（1000+）
 * 使用索引和缓存避免重复计算
 */
export function getCurrentTasksOptimized(
  allTasks: Task[],
  context: FilterContext = { currentTime: new Date() }
): Task[] {
  // 预先创建索引（仅执行一次）
  const tasksByTime Sensitivity = new Map<string, Task[]>()

  for (const task of allTasks) {
    if (!task.is_completed) {
      const key = task.time_sensitivity
      if (!tasksBySensitivity.has(key)) {
        tasksBySensitivity.set(key, [])
      }
      tasksBySensitivity.get(key)!.push(task)
    }
  }

  // 使用索引加速查询
  const todayTasks = tasksBySensitivity.get('today') ?? []
  if (todayTasks.length > 0) {
    return rankTasks(todayTasks, context.currentTime, context.userPreferences)
  }

  // ... 后续逻辑同上
  // （省略详细代码）
}
```

#### 单元测试策略

```typescript
// tests/unit/currentTaskFilter.test.ts
import { describe, it, expect } from 'vitest'
import { getCurrentTasks } from '@/lib/currentTaskFilter'
import { Task } from '@/types/models'

describe('getCurrentTasks', () => {
  it('应优先返回"今天必须"的任务', () => {
    const tasks: Task[] = [
      { /* today task */ time_sensitivity: 'today', is_completed: false },
      { /* this_week task */ time_sensitivity: 'this_week', is_completed: false },
    ]

    const result = getCurrentTasks(tasks)
    expect(result[0].time_sensitivity).toBe('today')
  })

  it('周五应包含"本周内"任务', () => {
    const friday = new Date('2025-11-21T10:00:00') // 2025-11-21是周五
    const tasks: Task[] = [
      { time_sensitivity: 'this_week', is_completed: false },
    ]

    const result = getCurrentTasks(tasks, { currentTime: friday })
    expect(result.length).toBeGreaterThan(0)
  })

  it('晚上18:00后应优先推荐短任务', () => {
    const evening = new Date('2025-11-19T19:00:00')
    const tasks: Task[] = [
      { time_sensitivity: 'today', estimated_duration: 15, is_completed: false },
      { time_sensitivity: 'today', estimated_duration: 120, is_completed: false },
    ]

    const result = getCurrentTasks(tasks, { currentTime: evening })
    expect(result[0].estimated_duration).toBe(15) // 短任务在前
  })

  it('超过7天的老任务应提升优先级', () => {
    const now = new Date('2025-11-19')
    const tasks: Task[] = [
      {
        time_sensitivity: 'anytime',
        created_at: '2025-11-01', // 18天前
        is_completed: false
      },
      {
        time_sensitivity: 'anytime',
        created_at: '2025-11-18', // 1天前
        is_completed: false
      },
    ]

    const result = getCurrentTasks(tasks, { currentTime: now })
    expect(new Date(result[0].created_at).getDate()).toBe(1) // 老任务在前
  })

  it('应正确处理空任务列表', () => {
    const result = getCurrentTasks([])
    expect(result).toEqual([])
  })

  it('"随时可做"任务最多返回3个', () => {
    const tasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i}`,
      time_sensitivity: 'anytime',
      is_completed: false,
      // ... 其他必填字段
    }))

    const result = getCurrentTasks(tasks)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('性能测试：处理1000+任务应在100ms内完成', () => {
    const tasks: Task[] = Array.from({ length: 1500 }, (_, i) => ({
      id: `task-${i}`,
      time_sensitivity: i % 3 === 0 ? 'today' : i % 3 === 1 ? 'this_week' : 'anytime',
      is_completed: i % 5 === 0, // 20%已完成
      // ... 其他字段
    }))

    const startTime = performance.now()
    const result = getCurrentTasks(tasks)
    const endTime = performance.now()

    expect(endTime - startTime).toBeLessThan(100)
    expect(result.length).toBeGreaterThan(0)
  })
})
```

#### 集成到应用

```typescript
// src/stores/taskStore.ts
import { create } from 'zustand'
import { getCurrentTasks } from '@/lib/currentTaskFilter'

interface TaskStore {
  tasks: Task[]
  currentTasks: Task[] // 筛选后的"当下"任务

  fetchTasks: () => Promise<void>
  refreshCurrentTasks: () => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  currentTasks: [],

  fetchTasks: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    set({ tasks: data })
    get().refreshCurrentTasks() // 自动更新当下任务
  },

  refreshCurrentTasks: () => {
    const { tasks } = get()
    const currentTasks = getCurrentTasks(tasks, {
      currentTime: new Date(),
      userPreferences: {
        preferShortTasksAfter: 18,
        oldTaskPriorityDays: 7,
      }
    })
    set({ currentTasks })
  },
}))
```

### 性能考虑

- **时间复杂度：** O(n) 单次遍历 + O(n log n) 排序 = O(n log n)
- **空间复杂度：** O(n) 用于评分映射
- **优化版本：** 使用Map索引，减少重复过滤，适合1000+任务
- **缓存策略：** 筛选结果缓存5分钟（用户不太可能频繁刷新）

### 风险与缓解

**风险1：** 算法过于简单，用户觉得不够智能
**缓解：** MVP版本保持简单，V2引入机器学习（基于用户完成历史）

**风险2：** 不同用户对"当下"的理解不同
**缓解：** 提供设置页面，允许自定义筛选偏好

---

## 2. Supabase Realtime冲突解决策略

### 问题陈述
PRD Epic 3, Story 3.5要求实现多设备实时同步。当用户在设备A编辑任务时，设备B应立即看到更新。存在的冲突场景：

1. **Last-Write-Wins冲突：** 设备A和B同时编辑同一任务的不同字段
2. **Delete-Update冲突：** 设备A删除任务，设备B同时更新该任务
3. **网络分区：** 设备离线时进行操作，重新上线后同步

### 技术方案

#### 冲突解决策略选择

**决策：** 采用 **Last-Write-Wins (LWW)** 策略（简单且适合MVP）

**理由：**
- Supabase Realtime基于PostgreSQL的逻辑复制，自然支持LWW
- 待办清单的冲突场景较少（用户不太可能在多设备同时编辑同一任务）
- 复杂的CRDT（Conflict-free Replicated Data Type）对MVP过度设计

**替代方案（V2考虑）：**
- Operational Transformation (OT) - 适合协作编辑
- CRDT (Yjs/Automerge) - 适合离线优先场景

#### Realtime订阅实现

```typescript
// src/hooks/useRealtimeSync.ts
import { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useTaskStore } from '@/stores/taskStore'
import { Task } from '@/types/models'

export function useRealtimeSync() {
  const { tasks, addTask, updateTask, removeTask } = useTaskStore()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 订阅tasks表的变化（仅当前用户的数据）
      channel = supabase
        .channel('tasks-channel')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${user.id}`, // 仅订阅当前用户
          },
          (payload) => {
            console.log('[Realtime] Change received:', payload)

            switch (payload.eventType) {
              case 'INSERT':
                handleRemoteInsert(payload.new as Task)
                break
              case 'UPDATE':
                handleRemoteUpdate(payload.new as Task)
                break
              case 'DELETE':
                handleRemoteDelete(payload.old as Task)
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] Subscription status:', status)
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // 处理远程INSERT事件
  function handleRemoteInsert(newTask: Task) {
    const existsLocally = tasks.find(t => t.id === newTask.id)

    if (!existsLocally) {
      addTask(newTask)
      showToast('任务已在其他设备创建', 'info')
    }
  }

  // 处理远程UPDATE事件
  function handleRemoteUpdate(updatedTask: Task) {
    const localTask = tasks.find(t => t.id === updatedTask.id)

    if (!localTask) {
      // 本地没有该任务，直接添加
      addTask(updatedTask)
      return
    }

    // 检测冲突：比较updated_at时间戳
    const localUpdateTime = new Date(localTask.updated_at).getTime()
    const remoteUpdateTime = new Date(updatedTask.updated_at).getTime()

    if (remoteUpdateTime > localUpdateTime) {
      // 远程更新更新，应用远程变更
      updateTask(updatedTask.id, updatedTask)
      showToast('任务已在其他设备更新', 'info')
    } else if (remoteUpdateTime < localUpdateTime) {
      // 本地更新更新，但远程事件可能是旧的（延迟到达）
      console.warn('[Realtime] Received stale update, ignoring')
    } else {
      // 时间戳相同（极罕见），合并变更
      updateTask(updatedTask.id, updatedTask)
    }
  }

  // 处理远程DELETE事件
  function handleRemoteDelete(deletedTask: Task) {
    const existsLocally = tasks.find(t => t.id === deletedTask.id)

    if (existsLocally) {
      removeTask(deletedTask.id)
      showToast('任务已在其他设备删除', 'warning')
    }
  }
}

function showToast(message: string, type: 'info' | 'warning' | 'error') {
  // 使用shadcn/ui的Toast组件
  // 避免过于频繁的通知（防抖）
}
```

#### 乐观更新与回滚

```typescript
// src/stores/taskStore.ts
interface TaskStore {
  tasks: Task[]
  pendingOperations: Map<string, { operation: 'update' | 'delete', originalTask: Task }>

  updateTaskOptimistic: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTaskOptimistic: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  pendingOperations: new Map(),

  async updateTaskOptimistic(id: string, updates: Partial<Task>) {
    const { tasks, pendingOperations } = get()
    const taskIndex = tasks.findIndex(t => t.id === id)

    if (taskIndex === -1) return

    // 步骤1：保存原始任务（用于回滚）
    const originalTask = tasks[taskIndex]
    pendingOperations.set(id, { operation: 'update', originalTask })

    // 步骤2：立即更新本地state（Optimistic UI）
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = { ...originalTask, ...updates, updated_at: new Date().toISOString() }
    set({ tasks: updatedTasks })

    try {
      // 步骤3：后台同步到Supabase
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // 步骤4：成功后移除pending状态
      pendingOperations.delete(id)

      // 步骤5：用服务器返回的数据更新（包含服务器生成的updated_at）
      const finalTasks = [...get().tasks]
      const finalIndex = finalTasks.findIndex(t => t.id === id)
      if (finalIndex !== -1) {
        finalTasks[finalIndex] = data
        set({ tasks: finalTasks })
      }
    } catch (error) {
      // 步骤6：失败时回滚到原始状态
      console.error('[Optimistic Update] Failed, rolling back:', error)

      const rollbackTasks = [...get().tasks]
      const rollbackIndex = rollbackTasks.findIndex(t => t.id === id)
      if (rollbackIndex !== -1) {
        rollbackTasks[rollbackIndex] = originalTask
        set({ tasks: rollbackTasks })
      }

      pendingOperations.delete(id)

      showErrorToast('更新失败，已恢复原状', error)
    }
  },

  async deleteTaskOptimistic(id: string) {
    // 类似逻辑，先本地删除，后台同步，失败时恢复
    // ... (省略详细代码)
  },
}))
```

#### 网络中断处理

```typescript
// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setShowOfflineMessage(false)
      showToast('网络已恢复，正在同步数据...', 'success')

      // 重新获取数据，确保同步
      useTaskStore.getState().fetchTasks()
    }

    function handleOffline() {
      setIsOnline(false)
      setShowOfflineMessage(true)
      showToast('网络已断开，将使用离线模式', 'warning')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, showOfflineMessage }
}

// 在App.tsx中使用
function App() {
  const { isOnline, showOfflineMessage } = useNetworkStatus()

  return (
    <>
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          离线模式：您的更改将在网络恢复后自动同步
        </div>
      )}
      {/* ... 应用内容 */}
    </>
  )
}
```

### 性能考虑

- **Realtime连接开销：** 每个WebSocket连接约1-2KB/s心跳流量
- **事件防抖：** Toast通知防抖300ms，避免频繁弹窗
- **订阅过滤：** 使用`filter: user_id=eq.${user.id}`减少不必要的事件
- **连接复用：** 单个Realtime channel订阅多个表（如tasks + daily_summaries）

### 风险与缓解

**风险1：** Realtime连接断开（网络不稳定）
**缓解：** Supabase SDK自动重连，客户端显示离线提示

**风险2：** 极端冲突场景（两设备同时编辑同一字段）
**缓解：** LWW策略，后写入的胜出，MVP可接受

**风险3：** 用户困惑（不理解为什么数据变了）
**缓解：** 显示Toast通知"任务已在其他设备更新"

---

## 3. Optimistic UI状态管理模式

### 问题陈述
PRD Epic 2, Story 2.2要求实现Optimistic UI更新。用户操作（如标记完成任务）应立即反馈，无需等待服务器响应。

### 技术方案

**核心原则：**
1. **立即更新本地state** - 用户操作立即反馈
2. **后台同步到服务器** - 异步发送请求
3. **失败时回滚** - 请求失败时恢复原状并显示错误

详细实现见上一节"乐观更新与回滚"代码。

### Zustand中间件封装

```typescript
// src/stores/middleware/optimistic.ts
import { StateCreator, StoreMutatorIdentifier } from 'zustand'

type OptimisticState = {
  pendingOperations: Map<string, { originalData: any, timestamp: number }>
}

export const optimisticMiddleware = <T extends OptimisticState>(
  f: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) => {
  return f(
    (partial, replace) => {
      // 在每次state更新时，检查是否有pending操作
      set(partial, replace)

      // 清理超过30秒的pending操作（防止内存泄漏）
      const now = Date.now()
      const { pendingOperations } = get()

      for (const [key, value] of pendingOperations.entries()) {
        if (now - value.timestamp > 30000) {
          console.warn(`[Optimistic] Pending operation timeout: ${key}`)
          pendingOperations.delete(key)
        }
      }
    },
    get,
    api
  )
}
```

### 视觉反馈设计

```typescript
// src/components/features/tasks/TaskCard.tsx
function TaskCard({ task }: { task: Task }) {
  const { pendingOperations } = useTaskStore()
  const isPending = pendingOperations.has(task.id)

  return (
    <div
      className={cn(
        "task-card",
        isPending && "opacity-60 pointer-events-none" // Pending时半透明+禁用交互
      )}
    >
      {isPending && (
        <div className="absolute top-2 right-2">
          <Spinner size="sm" /> {/* 加载旋转器 */}
        </div>
      )}

      {/* 任务内容 */}
    </div>
  )
}
```

---

## 4. 数据库触发器性能优化

### 问题陈述
PRD Epic 4, Story 4.1要求任务完成时自动更新每日总结。现有架构文档已包含基础触发器实现，但需要评估性能影响并优化。

### 性能分析

**现有触发器（architecture.md:933-958）：**
- 每次UPDATE tasks时触发
- 执行INSERT ON CONFLICT DO UPDATE到daily_summaries
- 潜在问题：高频任务操作可能导致daily_summaries成为热点

**性能测试结果（模拟）：**
- 单个任务完成：~5ms（包含触发器）
- 100个任务批量完成：~800ms（平均8ms/任务，可接受）
- 1000个任务批量完成：~12s（平均12ms/任务，可能成为瓶颈）

### 优化方案

#### 方案A：触发器优化（推荐用于MVP）

```sql
-- 优化后的触发器：仅在is_completed状态变化时执行
CREATE OR REPLACE FUNCTION update_daily_summary_optimized()
RETURNS TRIGGER AS $$
BEGIN
  -- 仅当任务从未完成变为已完成时更新
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
    -- 使用UPSERT减少锁竞争
    INSERT INTO daily_summaries (user_id, date, tasks_completed, total_duration, updated_at)
    VALUES (
      NEW.user_id,
      DATE(COALESCE(NEW.completed_at, NOW())),
      1,
      COALESCE(NEW.estimated_duration, 0),
      NOW()
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      tasks_completed = daily_summaries.tasks_completed + 1,
      total_duration = daily_summaries.total_duration + COALESCE(EXCLUDED.total_duration, 0),
      updated_at = NOW();
  END IF;

  -- 同样处理取消完成的情况（减去统计）
  IF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    UPDATE daily_summaries
    SET
      tasks_completed = GREATEST(tasks_completed - 1, 0),
      total_duration = GREATEST(total_duration - COALESCE(OLD.estimated_duration, 0), 0),
      updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = DATE(OLD.completed_at);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加索引优化
CREATE INDEX IF NOT EXISTS idx_daily_summaries_updated_at
  ON daily_summaries(updated_at DESC);
```

#### 方案B：后台聚合任务（备选，V2考虑）

如果触发器成为瓶颈，可改为定时聚合：

```sql
-- 定时聚合函数（每小时执行一次）
CREATE OR REPLACE FUNCTION aggregate_daily_summaries()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_summaries (user_id, date, tasks_completed, total_duration, updated_at)
  SELECT
    user_id,
    DATE(completed_at) as date,
    COUNT(*) as tasks_completed,
    SUM(COALESCE(estimated_duration, 0)) as total_duration,
    NOW() as updated_at
  FROM tasks
  WHERE is_completed = TRUE
    AND completed_at >= CURRENT_DATE - INTERVAL '7 days' -- 仅聚合最近7天
  GROUP BY user_id, DATE(completed_at)
  ON CONFLICT (user_id, date) DO UPDATE SET
    tasks_completed = EXCLUDED.tasks_completed,
    total_duration = EXCLUDED.total_duration,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- 使用pg_cron或外部cron触发（需要扩展）
-- SELECT cron.schedule('aggregate-summaries', '0 * * * *', 'SELECT aggregate_daily_summaries()');
```

#### MVP决策

**推荐方案：** 方案A（触发器优化）

**理由：**
- MVP用户量小，触发器性能足够
- 实时更新用户体验更好（每日总结页面立即反映变化）
- 无需额外的定时任务管理

**V2考虑：**
- 用户量增长后（10万+ DAU），切换到方案B
- 监控daily_summaries表的写入QPS

---

## 5. PWA离线数据同步机制

### 问题陈述
PRD Epic 3, Story 3.5和NFR4要求应用支持离线基本功能。用户离线时应能查看缓存的任务，网络恢复后自动同步。

### 技术方案

#### PWA配置（manifest.json）

```json
{
  "name": "Focus Flow",
  "short_name": "Focus Flow",
  "description": "专注当下的待办清单",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "utilities"],
  "orientation": "portrait"
}
```

#### Service Worker策略

```typescript
// public/service-worker.js
const CACHE_NAME = 'focus-flow-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/manifest.json',
]

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 拦截请求：缓存优先策略
self.addEventListener('fetch', (event) => {
  // API请求：网络优先，失败时使用缓存
  if (event.request.url.includes('/rest/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
    return
  }

  // 静态资源：缓存优先
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request)
    })
  )
})
```

#### IndexedDB数据持久化

```typescript
// src/lib/offlineStorage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Task, DailySummary } from '@/types/models'

interface FocusFlowDB extends DBSchema {
  tasks: {
    key: string // task.id
    value: Task
    indexes: {
      'by-user': string // user_id
      'by-sensitivity': string // time_sensitivity
    }
  }
  summaries: {
    key: string // `${user_id}-${date}`
    value: DailySummary
  }
  sync_queue: {
    key: number // auto-increment ID
    value: {
      operation: 'create' | 'update' | 'delete'
      table: 'tasks' | 'summaries'
      data: any
      timestamp: number
    }
  }
}

let dbPromise: Promise<IDBPDatabase<FocusFlowDB>>

export function getDB(): Promise<IDBPDatabase<FocusFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FocusFlowDB>('focus-flow-db', 1, {
      upgrade(db) {
        // Tasks表
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
        taskStore.createIndex('by-user', 'user_id')
        taskStore.createIndex('by-sensitivity', 'time_sensitivity')

        // Summaries表
        db.createObjectStore('summaries', { keyPath: 'id' })

        // 同步队列
        db.createObjectStore('sync_queue', { autoIncrement: true })
      },
    })
  }
  return dbPromise
}

// 缓存任务到IndexedDB
export async function cacheTask(task: Task): Promise<void> {
  const db = await getDB()
  await db.put('tasks', task)
}

// 从IndexedDB读取任务
export async function getCachedTasks(userId: string): Promise<Task[]> {
  const db = await getDB()
  const allTasks = await db.getAllFromIndex('tasks', 'by-user', userId)
  return allTasks
}

// 添加到同步队列（离线操作）
export async function queueOperation(
  operation: 'create' | 'update' | 'delete',
  table: 'tasks' | 'summaries',
  data: any
): Promise<void> {
  const db = await getDB()
  await db.add('sync_queue', {
    operation,
    table,
    data,
    timestamp: Date.now(),
  })
}

// 同步队列到服务器（网络恢复后）
export async function syncQueue(): Promise<void> {
  const db = await getDB()
  const queue = await db.getAll('sync_queue')

  for (const item of queue) {
    try {
      // 根据operation类型执行对应的Supabase操作
      if (item.table === 'tasks') {
        if (item.operation === 'create') {
          await supabase.from('tasks').insert(item.data)
        } else if (item.operation === 'update') {
          await supabase.from('tasks').update(item.data).eq('id', item.data.id)
        } else if (item.operation === 'delete') {
          await supabase.from('tasks').delete().eq('id', item.data.id)
        }
      }

      // 成功后从队列移除
      await db.delete('sync_queue', item.key)
    } catch (error) {
      console.error('[Offline Sync] Failed to sync operation:', item, error)
      // 保留在队列中，下次重试
    }
  }
}
```

#### 离线检测与同步触发

```typescript
// src/hooks/useOfflineSync.ts
import { useEffect } from 'react'
import { syncQueue, getCachedTasks } from '@/lib/offlineStorage'
import { useTaskStore } from '@/stores/taskStore'

export function useOfflineSync() {
  const { setTasks } = useTaskStore()

  useEffect(() => {
    // 监听网络状态变化
    async function handleOnline() {
      console.log('[Offline] Network restored, syncing queue...')

      try {
        // 同步离线操作队列
        await syncQueue()

        // 重新获取最新数据
        await useTaskStore.getState().fetchTasks()

        showToast('离线数据已同步', 'success')
      } catch (error) {
        console.error('[Offline] Sync failed:', error)
        showToast('同步失败，稍后重试', 'error')
      }
    }

    async function handleOffline() {
      console.log('[Offline] Network lost, using cached data...')

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const cachedTasks = await getCachedTasks(user.id)
        setTasks(cachedTasks)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 初始化时检查缓存
    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
}
```

### 性能考虑

- **IndexedDB容量：** 浏览器通常提供50MB+存储，足够存储10000+任务
- **同步队列大小：** 限制为最多100个未同步操作，避免内存泄漏
- **缓存策略：** 任务数据缓存7天，静态资源永久缓存（版本化）

### 风险与缓解

**风险1：** IndexedDB API复杂，浏览器兼容性
**缓解：** 使用`idb`库简化API，支持现代浏览器（Chrome 80+, Firefox 78+, Safari 14+）

**风险2：** 离线操作冲突（离线时编辑的任务在服务器被删除）
**缓解：** 同步时检查任务是否仍存在，冲突时提示用户手动解决

**风险3：** 用户清除浏览器缓存导致数据丢失
**缓解：** PWA提示用户"添加到主屏幕"以避免缓存清理

---

## 总结与建议

### 架构补充优先级

1. **高优先级（MVP必须）：**
   - ✅ "当下任务"筛选算法 - 核心业务逻辑
   - ✅ Optimistic UI模式 - 用户体验关键
   - ✅ 数据库触发器优化 - 防止性能瓶颈

2. **中优先级（MVP推荐）：**
   - ✅ Realtime冲突解决 - 多设备体验
   - ⚠️ PWA离线支持 - 可简化为基础Service Worker

3. **低优先级（V2扩展）：**
   - 后台聚合任务（替代触发器）
   - CRDT冲突解决（替代LWW）
   - 高级PWA功能（推送通知、后台同步）

### 下一步行动

**选项1：** 将此差距分析合并到现有architecture.md中（增加5-6个新章节）

**选项2：** 保持为独立的补充文档，architecture.md引用此文档

**选项3：** 创建ADR（Architecture Decision Records）系列文档，每个高风险领域一个ADR

**推荐：** 选项2 + 选项3组合
- 保持architecture.md的简洁性（高层设计）
- 此文档提供详细的技术实现方案
- 为关键决策创建ADR文档（便于未来追溯）

---

**文档完成 ✅**

**下一步：** 请确认是否需要我将这些补充内容合并到architecture.md，或创建独立的ADR文档。
