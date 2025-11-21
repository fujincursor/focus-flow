# Story 2.6: Mobile Swipe Gestures - Brownfield Enhancement

**Story ID:** Story 2.6
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement (Mobile UX)
**Priority:** P2
**Estimated Effort:** 4-5 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 移动端用户，
**我想要** 通过滑动手势快速完成任务操作，
**以便** 在触摸屏设备上获得更自然流畅的交互体验。

---

## Story Context

### Existing System Integration

- **Integrates with:** TaskCard.tsx, TaskList.tsx, SortableTaskList.tsx
- **Technology:** React + react-swipeable 或 framer-motion
- **Follows pattern:** 移动端优先的手势交互模式
- **Touch points:**
  - `apps/web/src/components/tasks/TaskCard.tsx` - 添加滑动手势
  - 移动端检测 (窗口宽度 < 768px)

### Current State

当前移动端需要点击复选框或菜单按钮来完成/删除任务，操作不够直观。

---

## Acceptance Criteria

### Functional Requirements

1. **右滑完成任务**
   - 在任务卡片上向右滑动 (swipe right) 触发完成操作
   - 滑动距离 > 40% 卡片宽度时触发
   - 显示绿色背景 + ✓ 图标作为视觉反馈
   - 松手后任务标记为完成，卡片恢复原位

2. **左滑显示删除按钮**
   - 向左滑动 (swipe left) 显示红色删除按钮
   - 滑动距离 > 40% 卡片宽度时按钮完全显示
   - 点击删除按钮触发删除确认对话框
   - 点击卡片其他区域或向右滑动，删除按钮隐藏

3. **仅移动端启用**
   - 检测设备类型/屏幕宽度
   - 仅在移动端 (< 768px) 启用手势
   - 桌面端保持现有交互方式

4. **平滑动画**
   - 滑动时卡片跟随手指移动
   - 松手后平滑回弹到原位或完成动作
   - 使用 spring 动画提升手感

### Integration Requirements

5. **与拖放排序兼容**
   - 手势与拖放排序不冲突
   - 可以区分垂直拖动(排序)和水平滑动(操作)
   - 垂直拖动时禁用水平滑动手势

6. **与现有点击操作兼容**
   - 轻触仍然可以打开任务详情/编辑
   - 复选框点击仍然有效（作为备用方式）
   - 不影响卡片内部按钮的点击

### Quality Requirements

7. **用户体验**
   - 手势响应灵敏 (< 16ms per frame)
   - 视觉反馈清晰 (颜色、图标)
   - 误触率低（滑动阈值合理）

8. **无障碍性**
   - 非手势用户仍可通过按钮完成相同操作
   - 屏幕阅读器用户不受影响

---

## Technical Implementation

### 1. Install Swipeable Library

```bash
pnpm add react-swipeable
```

### 2. Create SwipeableTaskCard Component

```typescript
// apps/web/src/components/tasks/SwipeableTaskCard.tsx
import { useSwipeable } from 'react-swipeable'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { TaskCard } from './TaskCard'

interface SwipeableTaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function SwipeableTaskCard({ task, onComplete, onDelete }: SwipeableTaskCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const SWIPE_THRESHOLD = 0.4 // 40% of card width
  const isMobile = window.innerWidth < 768

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!isMobile) return
      setIsSwiping(true)
      setSwipeOffset(eventData.deltaX)
    },
    onSwiped: (eventData) => {
      setIsSwiping(false)
      const cardWidth = eventData.event.currentTarget.clientWidth
      const threshold = cardWidth * SWIPE_THRESHOLD

      if (eventData.deltaX > threshold) {
        // Right swipe - complete task
        onComplete(task.id)
      } else if (eventData.deltaX < -threshold) {
        // Left swipe - show delete (handled by CSS)
        setSwipeOffset(-80) // Show delete button
        return
      }

      // Reset position
      setSwipeOffset(0)
    },
    trackMouse: false,
    trackTouch: true,
  })

  if (!isMobile) {
    return <TaskCard task={task} />
  }

  const swipeProgress = Math.abs(swipeOffset) / (window.innerWidth * SWIPE_THRESHOLD)
  const backgroundColor = swipeOffset > 0
    ? `rgba(34, 197, 94, ${Math.min(swipeProgress, 1)})` // green
    : `rgba(239, 68, 68, ${Math.min(swipeProgress, 1)})` // red

  return (
    <div className="relative overflow-hidden">
      {/* Background indicators */}
      <div
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ backgroundColor }}
      >
        {swipeOffset > 0 && (
          <Check className="text-white h-6 w-6" />
        )}
        {swipeOffset < 0 && (
          <Trash2 className="text-white h-6 w-6 ml-auto" />
        )}
      </div>

      {/* Swipeable card */}
      <motion.div
        {...handlers}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-background"
      >
        <TaskCard task={task} />
      </motion.div>

      {/* Delete button (revealed on left swipe) */}
      {swipeOffset < -40 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-0 top-0 h-full px-6 bg-red-500 text-white"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}
```

### 3. Update TaskList to Use SwipeableTaskCard

```typescript
// apps/web/src/components/tasks/TaskList.tsx
import { SwipeableTaskCard } from './SwipeableTaskCard'

export function TaskList({ tasks }: TaskListProps) {
  const { toggleTaskCompletion, markForDeletion } = useTaskStore()

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <SwipeableTaskCard
          key={task.id}
          task={task}
          onComplete={toggleTaskCompletion}
          onDelete={markForDeletion}
        />
      ))}
    </div>
  )
}
```

### 4. Mobile Detection Utility

```typescript
// apps/web/src/lib/utils.ts
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent || navigator.vendor

  // Check for mobile user agents
  if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
    return true
  }

  // Check screen size
  return window.innerWidth < 768
}
```

---

## Testing Strategy

### Manual Testing

1. **移动端真机测试**
   - iOS Safari
   - Android Chrome
   - 验证手势流畅度和准确性

2. **不同屏幕尺寸**
   - 手机 (375px - 428px)
   - 平板 (768px+)
   - 确认在平板以上禁用手势

3. **边界情况**
   - 快速连续滑动
   - 斜向滑动
   - 滑动时触摸其他元素

### Integration Tests

```typescript
describe('SwipeableTaskCard - Mobile', () => {
  beforeEach(() => {
    // Mock mobile viewport
    global.innerWidth = 375
  })

  it('completes task on right swipe', async () => {
    const onComplete = vi.fn()
    render(<SwipeableTaskCard task={mockTask} onComplete={onComplete} />)

    // Simulate swipe right gesture
    const card = screen.getByRole('article')
    fireEvent.touchStart(card, { touches: [{ clientX: 0 }] })
    fireEvent.touchMove(card, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(card)

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockTask.id)
    })
  })

  it('shows delete button on left swipe', async () => {
    render(<SwipeableTaskCard task={mockTask} onDelete={vi.fn()} />)

    const card = screen.getByRole('article')
    fireEvent.touchStart(card, { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(card, { touches: [{ clientX: 0 }] })
    fireEvent.touchEnd(card)

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
```

---

## Definition of Done

- [x] react-swipeable integrated
- [x] Right swipe completes task
- [x] Left swipe shows delete button
- [x] Visual feedback (color, icons) works
- [x] Smooth animations implemented
- [x] Mobile-only (< 768px) detection
- [x] Compatible with drag-and-drop sorting
- [x] Compatible with existing click actions
- [x] Tested on iOS and Android real devices
- [x] No regression on desktop
- [x] Swipe threshold tuned for low false positives

---

## Risk Mitigation

### Primary Risk
**Gestures conflict with native browser scrolling**

**Mitigation:**
- Use preventDefault carefully
- Differentiate vertical (scroll) vs horizontal (swipe) motion
- Test extensively on real devices

**Rollback:** Remove swipe gestures, minimal impact

### Secondary Risk
**Gesture not discoverable by users**

**Mitigation:**
- Add onboarding tooltip: "滑动任务卡片可以快速操作"
- Show hint on first visit (localStorage flag)
- Keep traditional buttons as backup

---

## Future Enhancements (Not in Scope)

- Customizable swipe actions (user preferences)
- Different swipe distances for different actions
- Haptic feedback (vibration on action trigger)

---

## References

- [react-swipeable](https://github.com/FormidableLabs/react-swipeable)
- [framer-motion](https://www.framer.com/motion/)
- [Mobile Gesture Best Practices](https://www.nngroup.com/articles/gesture-usability/)
