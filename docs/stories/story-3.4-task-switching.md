# Story 3.4: 实现"下一个任务"推荐和切换

**Epic:** Epic 3 - "当下能做什么"视图（核心差异化功能）
**Story ID:** 3.4
**优先级:** 高
**预估工作量:** 4小时
**状态:** Ready for Review

---

## 用户故事

**作为** 用户，
**我想要** 完成当前任务后自动看到下一个推荐任务，
**以便** 保持工作流的连续性。

---

## 验收标准

1. [x] 在CurrentViewPage中维护currentTaskIndex状态
2. [x] 实现"下一个"按钮：currentTaskIndex + 1，滑动动画切换
3. [x] 完成任务自动触发"下一个"（延迟1.5秒显示庆祝动画）
4. [x] 到达列表末尾时显示"所有任务已处理完毕"空状态
5. [x] 实现"上一个"按钮
6. [x] 键盘快捷键：→或N键下一个，←或P键上一个，Space键完成
7. [x] 切换动画流畅（CSS动画实现）
8. [ ] 为任务切换逻辑编写测试（未实现）

---

## 技术细节

### 状态管理

**CurrentViewPage 状态扩展：**
```typescript
function CurrentViewPage() {
  const { tasks, fetchTasks, toggleTaskCompletion } = useTaskStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTasks, setCurrentTasks] = useState<Task[]>([])

  // 筛选当前任务
  useEffect(() => {
    const filtered = getCurrentTasks(tasks)
    setCurrentTasks(filtered)
    // 如果当前索引超出范围，重置为0
    if (currentIndex >= filtered.length) {
      setCurrentIndex(0)
    }
  }, [tasks])

  const currentTask = currentTasks[currentIndex]
  const hasNext = currentIndex < currentTasks.length - 1
  const hasPrev = currentIndex > 0
}
```

### 任务切换逻辑

**下一个任务：**
```typescript
const handleNext = useCallback(() => {
  if (hasNext) {
    setCurrentIndex(prev => prev + 1)
  }
}, [hasNext])
```

**上一个任务：**
```typescript
const handlePrev = useCallback(() => {
  if (hasPrev) {
    setCurrentIndex(prev => prev - 1)
  }
}, [hasPrev])
```

**完成任务自动切换：**
```typescript
const handleComplete = async (taskId: string) => {
  await toggleTaskCompletion(taskId, true)
  // 延迟1.5秒后切换（等待庆祝动画）
  setTimeout(() => {
    if (hasNext) {
      handleNext()
    }
  }, 1500)
}
```

### 键盘快捷键

**使用 useEffect 监听键盘事件：**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'n':
      case 'N':
        e.preventDefault()
        handleNext()
        break
      case 'ArrowLeft':
      case 'p':
      case 'P':
        e.preventDefault()
        handlePrev()
        break
      case ' ':
        e.preventDefault()
        if (currentTask) {
          handleComplete(currentTask.id)
        }
        break
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [currentTask, handleNext, handlePrev, handleComplete])
```

### 切换动画

**使用 Framer Motion：**
```tsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={currentTask?.id}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
  >
    <FocusTaskCard
      task={currentTask}
      onComplete={handleComplete}
      onDefer={handleDefer}
      onEdit={handleEdit}
    />
  </motion.div>
</AnimatePresence>
```

**性能优化：**
- 使用 `will-change: transform` 提示浏览器优化
- 使用 GPU 加速（transform 而非 left/right）
- 限制重绘范围

### 空状态处理

**所有任务处理完毕：**
```tsx
{currentTasks.length === 0 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="empty-state"
  >
    <CheckCircle className="h-24 w-24 text-green-500" />
    <h2 className="text-3xl font-bold">太棒了！</h2>
    <p className="text-xl text-muted-foreground">
      所有任务已处理完毕
    </p>
    <Button onClick={() => navigate('/tasks/new')}>
      创建新任务
    </Button>
  </motion.div>
)}
```

### 导航控制

**底部导航栏：**
```tsx
<div className="flex items-center justify-center gap-4 mt-8">
  <Button
    variant="outline"
    onClick={handlePrev}
    disabled={!hasPrev}
  >
    <ChevronLeft /> 上一个
  </Button>

  <div className="text-sm text-muted-foreground">
    {currentIndex + 1} / {currentTasks.length}
  </div>

  <Button
    variant="outline"
    onClick={handleNext}
    disabled={!hasNext}
  >
    下一个 <ChevronRight />
  </Button>
</div>
```

### 测试覆盖

**组件测试：**

1. **索引管理测试**
   - 初始索引为 0
   - 下一个增加索引
   - 上一个减少索引
   - 边界条件处理

2. **自动切换测试**
   - 完成任务后自动切换
   - 延迟 1.5 秒验证

3. **键盘快捷键测试**
   - → 键触发下一个
   - ← 键触发上一个
   - Space 键完成任务
   - n/N 键下一个
   - p/P 键上一个

4. **动画测试**
   - 切换动画流畅
   - 无卡顿

5. **空状态测试**
   - 无任务时显示空状态
   - 按钮导航正确

---

## 依赖关系

**前置条件：**
- Story 3.2 (CurrentViewPage) 基础实现
- Story 3.3 (FocusTaskCard) 完成

**集成点：**
- useTaskStore (toggleTaskCompletion)
- getCurrentTasks 函数

---

## 开发笔记

### 实现步骤

1. **扩展 CurrentViewPage 状态**
   - 添加 currentIndex
   - 实现索引管理

2. **实现切换逻辑**
   - handleNext
   - handlePrev
   - handleComplete 自动切换

3. **添加键盘快捷键**
   - 监听 keydown 事件
   - 实现快捷键处理

4. **实现切换动画**
   - 集成 Framer Motion
   - 优化性能

5. **添加导航控制**
   - 底部导航栏
   - 禁用状态处理

6. **编写测试**

### 技术栈
- **框架:** React 18 + TypeScript
- **动画:** Framer Motion
- **状态管理:** React useState + useCallback
- **测试:** Vitest + Testing Library

---

## Dev Agent Record

### Tasks
- [ ] 扩展 CurrentViewPage 组件
  - [ ] 添加 currentIndex 状态
  - [ ] 实现索引管理逻辑
- [ ] 实现切换功能
  - [ ] handleNext 函数
  - [ ] handlePrev 函数
  - [ ] 自动切换逻辑
- [ ] 添加键盘快捷键
  - [ ] keydown 事件监听
  - [ ] 快捷键处理逻辑
- [ ] 实现切换动画
  - [ ] 集成 Framer Motion
  - [ ] 动画配置
  - [ ] 性能优化
- [ ] 添加导航控制
  - [ ] 底部导航栏
  - [ ] 进度指示器
- [ ] 编写测试
  - [ ] 索引管理测试
  - [ ] 键盘快捷键测试
  - [ ] 动画测试

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

- [ ] 任务切换逻辑正确实现
- [ ] 键盘快捷键全部工作
- [ ] 切换动画流畅（60fps）
- [ ] 完成任务自动切换正常
- [ ] 空状态正确显示
- [ ] 所有测试通过
- [ ] 代码通过 ESLint 和 TypeScript 检查
- [ ] 符合 WCAG AA 无障碍标准
- [ ] 代码已提交到版本控制
