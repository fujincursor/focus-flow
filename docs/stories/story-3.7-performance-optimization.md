# Story 3.7: 优化"当下视图"的性能和加载体验

**Epic:** Epic 3 - "当下能做什么"视图（核心差异化功能）
**Story ID:** 3.7
**优先级:** 中
**预估工作量:** 6小时
**状态:** Ready for Development

---

## 用户故事

**作为** 用户，
**我想要** 打开应用时快速看到当前任务，
**以便** 获得流畅的使用体验。

---

## 验收标准

1. [ ] 实现骨架屏加载状态（Skeleton Loading）
2. [ ] 任务数据预加载：登录时后台预取任务列表
3. [ ] 代码分割和懒加载：非首屏组件使用React.lazy
4. [ ] 图片和资源优化：SVG格式，Tree-shakable图标
5. [ ] FCP优化：目标<1.5秒（3G网络）
6. [ ] 运行Lighthouse审计：Performance ≥ 90，FCP < 1.8s，LCP < 2.5s，CLS < 0.1
7. [ ] 使用React DevTools Profiler优化渲染
8. [ ] 在CI/CD中监控性能指标（Lighthouse CI）

---

## 技术细节

### 骨架屏加载状态

**创建 CurrentViewSkeleton 组件：**
```tsx
export function CurrentViewSkeleton() {
  return (
    <div className="current-view-container">
      <Skeleton className="h-12 w-48 mb-8" /> {/* 标题 */}
      <Card className="max-w-2xl mx-auto p-12">
        <Skeleton className="h-8 w-32 mb-4" /> {/* 徽章 */}
        <Skeleton className="h-10 w-full mb-4" /> {/* 标题 */}
        <Skeleton className="h-20 w-full mb-6" /> {/* 描述 */}
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" /> {/* 按钮 */}
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </Card>
    </div>
  )
}
```

**在 CurrentViewPage 中使用：**
```tsx
if (isLoading) {
  return <CurrentViewSkeleton />
}
```

### 数据预加载

**在认证成功后预取任务：**
```typescript
// authStore.ts
async signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  set({ user: data.user, isAuthenticated: true })

  // 预加载任务数据
  const { fetchTasks } = useTaskStore.getState()
  fetchTasks().catch(console.error) // 非阻塞
}
```

### 代码分割和懒加载

**路由级别代码分割：**
```tsx
import { lazy, Suspense } from 'react'

// 懒加载非首屏路由
const TasksPage = lazy(() => import('@/pages/TasksPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SummaryPage = lazy(() => import('@/pages/SummaryPage'))

// 路由配置
<Route
  path="/tasks"
  element={
    <Suspense fallback={<PageSkeleton />}>
      <TasksPage />
    </Suspense>
  }
/>
```

**组件级别懒加载：**
```tsx
// 图表组件按需加载
const ProgressChart = lazy(
  () => import('@/components/features/summary/ProgressChart')
)
```

### 资源优化

**图标优化 - 使用 Lucide React：**
```tsx
// Tree-shakable 图标导入
import { CheckCircle, ChevronRight, Edit } from 'lucide-react'

// ❌ 避免：全量导入
// import * as Icons from 'lucide-react'
```

**SVG 优化：**
- 使用 SVGO 压缩
- 移除不必要的元数据
- 内联关键 SVG

### 性能优化技术

**1. React.memo 优化组件渲染：**
```tsx
export const FocusTaskCard = React.memo(function FocusTaskCard({
  task,
  onComplete,
  onDefer,
  onEdit,
}: FocusTaskCardProps) {
  // 组件实现
})
```

**2. useMemo 缓存计算：**
```tsx
const currentTasks = useMemo(
  () => getCurrentTasks(tasks, settings),
  [tasks, settings]
)
```

**3. useCallback 缓存回调：**
```tsx
const handleNext = useCallback(() => {
  setCurrentIndex((prev) => prev + 1)
}, [])
```

**4. 虚拟化长列表（如果需要）：**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

// 仅在任务列表超过50项时使用
```

### Lighthouse 性能目标

**关键指标：**
- **FCP (First Contentful Paint):** < 1.8s
- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.5s
- **Performance Score:** ≥ 90

**优化策略：**

1. **减少 FCP：**
   - 内联关键 CSS
   - 预连接到 Supabase
   - 使用 font-display: swap

2. **减少 LCP：**
   - 优化图片加载
   - 预加载关键资源
   - 服务器端渲染（未来）

3. **减少 CLS：**
   - 设置图片尺寸
   - 骨架屏占位
   - 避免动态插入内容

### React DevTools Profiler

**使用 Profiler 组件：**
```tsx
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
}

<Profiler id="CurrentViewPage" onRender={onRenderCallback}>
  <CurrentViewPage />
</Profiler>
```

### CI/CD 性能监控

**添加 Lighthouse CI 配置：**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lighthouse:ci

# package.json
"scripts": {
  "lighthouse:ci": "lhci autorun"
}
```

**lighthouserc.js 配置：**
```js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/dist',
      url: ['/'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

### 测试覆盖

**性能测试：**

1. **加载时间测试**
   - 测量 FCP、LCP
   - 验证骨架屏显示

2. **Lighthouse 自动化测试**
   - CI/CD 集成
   - 性能基线监控

3. **Bundle 大小测试**
   - 主包 < 200KB (gzipped)
   - 懒加载包 < 50KB 每个

---

## 依赖关系

**前置条件：**
- 所有 Epic 3 功能已实现

**工具依赖：**
- @lhci/cli (Lighthouse CI)
- @tanstack/react-virtual (虚拟化，可选)

---

## 开发笔记

### 实现步骤

1. **创建骨架屏组件**
   - CurrentViewSkeleton
   - PageSkeleton

2. **实现数据预加载**
   - authStore 集成

3. **配置代码分割**
   - 路由懒加载
   - 组件懒加载

4. **优化现有组件**
   - React.memo
   - useMemo/useCallback

5. **运行 Lighthouse 审计**
   - 识别性能瓶颈
   - 逐项优化

6. **配置 Lighthouse CI**
   - GitHub Actions
   - 性能监控

7. **使用 Profiler 分析**
   - 识别慢组件
   - 优化渲染

### 技术栈
- **性能工具:** Lighthouse, React DevTools Profiler
- **CI/CD:** Lighthouse CI
- **优化库:** React.memo, useMemo, useCallback
- **虚拟化:** @tanstack/react-virtual (可选)

---

## Dev Agent Record

### Tasks
- [ ] 创建骨架屏组件
  - [ ] CurrentViewSkeleton
  - [ ] PageSkeleton
- [ ] 实现数据预加载
  - [ ] authStore 预加载逻辑
- [ ] 配置代码分割
  - [ ] 路由懒加载
  - [ ] 组件懒加载
- [ ] 优化组件渲染
  - [ ] React.memo
  - [ ] useMemo/useCallback
- [ ] 资源优化
  - [ ] 图标 Tree-shaking
  - [ ] SVG 优化
- [ ] Lighthouse 审计
  - [ ] 运行审计
  - [ ] 优化建议实施
- [ ] 配置 Lighthouse CI
  - [ ] GitHub Actions 工作流
  - [ ] 性能基线配置
- [ ] React Profiler 分析
  - [ ] 识别性能瓶颈
  - [ ] 优化实施

### Agent Model Used
<!-- Dev agent will fill this -->

### Debug Log References
<!-- Dev agent will add links to debug log entries if needed -->

### Completion Notes
<!-- Dev agent will summarize what was implemented -->

### File List
<!-- Dev agent will list all modified/created files -->

### Change Log
<!-- Dev agent will document key implementation decisions -->

---

## 定义完成 (Definition of Done)

- [ ] 骨架屏加载状态实现
- [ ] 数据预加载正常工作
- [ ] 代码分割配置完成
- [ ] 资源优化完成
- [ ] Lighthouse Performance ≥ 90
- [ ] FCP < 1.8s, LCP < 2.5s, CLS < 0.1
- [ ] Lighthouse CI 配置完成
- [ ] React Profiler 分析完成
- [ ] 性能优化文档记录
- [ ] 代码已提交到版本控制
