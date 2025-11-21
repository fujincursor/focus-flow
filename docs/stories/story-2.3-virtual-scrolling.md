# Story 2.3: Virtual Scrolling Optimization - Brownfield Enhancement

**Story ID:** Story 2.3
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement (Performance)
**Priority:** P3 (Nice to Have)
**Estimated Effort:** 4-6 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 重度用户，
**我想要** 任务列表在任务数量很多时仍保持流畅滚动，
**以便** 我可以快速浏览大量任务而不会遇到性能问题。

---

## Story Context

### Existing System Integration

- **Integrates with:** TaskList.tsx
- **Technology:** React + react-window 或 @tanstack/react-virtual
- **Follows pattern:** 现有的列表渲染模式
- **Trigger:** 当任务数量 > 100 时性能优化生效

### Current State

当前 TaskList 渲染所有任务到 DOM。在任务数量较少时 (< 50) 性能良好，但随着任务增多会出现性能下降。

---

## Acceptance Criteria

### Functional Requirements

1. **使用虚拟滚动库**
   - 集成 `@tanstack/react-virtual` 或 `react-window`
   - 仅渲染可见区域 + 缓冲区的任务
   - 支持动态高度（任务卡片高度不固定）

2. **性能阈值**
   - 任务数量 < 50: 使用常规渲染（保持简单）
   - 任务数量 ≥ 50: 自动启用虚拟滚动
   - 1000 个任务时滚动帧率 > 30 FPS

3. **保持现有功能**
   - 时间敏感度分组仍正常工作
   - 拖放排序功能不受影响
   - 搜索过滤仍然流畅

### Integration Requirements

4. **向后兼容**
   - 现有 TaskList API 保持不变
   - 对调用方透明（自动判断是否启用虚拟滚动）

5. **测试场景**
   - 创建测试数据（500, 1000 任务）验证性能
   - 使用 React DevTools Profiler 测量渲染时间

### Quality Requirements

6. **性能指标**
   - 初始渲染 < 200ms (1000 任务)
   - 滚动操作 < 16ms per frame (60 FPS)
   - 内存占用合理（不会无限增长）

7. **用户体验**
   - 滚动平滑，无卡顿
   - 无明显的"空白加载"现象
   - 滚动条行为正常

---

## Technical Implementation

```typescript
// apps/web/src/components/tasks/TaskList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

const VIRTUAL_SCROLL_THRESHOLD = 50

export function TaskList({ tasks }: TaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Only enable virtualization for large lists
  const shouldVirtualize = tasks.length >= VIRTUAL_SCROLL_THRESHOLD

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated task card height
    enabled: shouldVirtualize,
  })

  if (!shouldVirtualize) {
    // Regular rendering for small lists
    return (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    )
  }

  // Virtual scrolling for large lists
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TaskCard task={tasks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Definition of Done

- [x] Virtual scrolling library integrated
- [x] Auto-enable for > 50 tasks
- [x] Performance meets targets (60 FPS scrolling)
- [x] Existing features work correctly
- [x] Tested with 100, 500, 1000 tasks
- [x] No regression in < 50 tasks scenario
- [x] Memory usage profiled and acceptable

---

## Risk Mitigation

**Primary Risk:** Virtual scrolling breaks drag-and-drop functionality

**Mitigation:**
- Test DnD extensively
- Consider disabling DnD when virtualization is active
- Or use a virtualization library that supports DnD

**Rollback:** Feature flag to disable virtualization

---

## References

- [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- [react-window](https://react-window.vercel.app/)
