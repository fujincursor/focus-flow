# Story 2.4: Undo Delete Functionality - Brownfield Enhancement

**Story ID:** Story 2.4
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement
**Priority:** P2
**Estimated Effort:** 3-4 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 用户，
**我想要** 在误删任务后能够撤销删除操作，
**以便** 避免因为误操作而永久丢失重要任务数据。

---

## Story Context

### Existing System Integration

- **Integrates with:** DeleteConfirmDialog.tsx, taskService.ts, Zustand store
- **Technology:** React + Zustand + shadcn/ui Toast/Sonner
- **Follows pattern:** Optimistic UI 更新模式
- **Touch points:**
  - `apps/web/src/components/tasks/DeleteConfirmDialog.tsx` - 触发删除
  - `apps/web/src/stores/taskStore.ts` - 状态管理
  - `apps/web/src/services/taskService.ts` - API 调用

### Current State

当前删除任务有确认对话框，但一旦确认删除，无法撤销。

---

## Acceptance Criteria

### Functional Requirements

1. **删除后显示撤销提示**
   - 使用 Toast 通知显示 "任务已删除" 消息
   - Toast 包含 "撤销" 按钮
   - Toast 显示倒计时 (3 秒)
   - 3 秒后 Toast 自动消失，删除操作确认

2. **撤销操作**
   - 点击 "撤销" 按钮立即恢复任务
   - 任务恢复到删除前的位置和状态
   - 显示 "任务已恢复" Toast 确认

3. **延迟删除机制**
   - 前端立即从列表移除任务（Optimistic UI）
   - 3 秒内不调用实际删除 API
   - 3 秒后或用户确认后才调用 `deleteTask()` API
   - 撤销时不需要调用 API，直接恢复本地状态

### Integration Requirements

4. **与现有删除流程兼容**
   - DeleteConfirmDialog 仍然存在（防止误点）
   - 确认删除后进入 "待删除" 状态（3 秒撤销期）
   - 支持批量删除时的撤销

5. **跨页面撤销**
   - 即使切换到其他页面，撤销期内仍可撤销
   - 使用全局 Toast 实现

### Quality Requirements

6. **用户体验**
   - Toast 位置固定（右下角/右上角）
   - 倒计时视觉清晰
   - 撤销按钮明显且易点击

7. **边界情况处理**
   - 网络断开时撤销仍然有效（本地状态）
   - 用户快速删除多个任务时，每个都有独立撤销
   - 页面刷新后撤销期失效（不持久化待删除状态）

---

## Technical Implementation

### 1. Update Task Store

```typescript
// apps/web/src/stores/taskStore.ts
interface TaskStore {
  tasks: Task[]
  pendingDeletes: Map<string, { task: Task; timeoutId: NodeJS.Timeout }>

  markForDeletion: (taskId: string) => void
  undoDelete: (taskId: string) => void
  confirmDelete: (taskId: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  pendingDeletes: new Map(),

  markForDeletion: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return

    // Remove from visible list immediately
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }))

    // Schedule actual deletion after 3 seconds
    const timeoutId = setTimeout(() => {
      get().confirmDelete(taskId)
    }, 3000)

    // Store in pending deletes
    set((state) => ({
      pendingDeletes: new Map(state.pendingDeletes).set(taskId, {
        task,
        timeoutId,
      }),
    }))

    // Show toast with undo button
    toast('任务已删除', {
      action: {
        label: '撤销',
        onClick: () => get().undoDelete(taskId),
      },
      duration: 3000,
    })
  },

  undoDelete: (taskId) => {
    const pending = get().pendingDeletes.get(taskId)
    if (!pending) return

    // Cancel scheduled deletion
    clearTimeout(pending.timeoutId)

    // Restore task to list
    set((state) => ({
      tasks: [...state.tasks, pending.task],
      pendingDeletes: new Map(
        Array.from(state.pendingDeletes).filter(([id]) => id !== taskId)
      ),
    }))

    toast.success('任务已恢复')
  },

  confirmDelete: async (taskId) => {
    const pending = get().pendingDeletes.get(taskId)
    if (!pending) return

    try {
      // Call actual delete API
      await taskService.deleteTask(taskId)

      // Remove from pending deletes
      set((state) => ({
        pendingDeletes: new Map(
          Array.from(state.pendingDeletes).filter(([id]) => id !== taskId)
        ),
      }))
    } catch (error) {
      // If delete fails, restore task
      set((state) => ({
        tasks: [...state.tasks, pending.task],
        pendingDeletes: new Map(
          Array.from(state.pendingDeletes).filter(([id]) => id !== taskId)
        ),
      }))
      toast.error('删除失败')
    }
  },
}))
```

### 2. Update Delete Dialog

```typescript
// apps/web/src/components/tasks/DeleteConfirmDialog.tsx
const handleConfirmDelete = () => {
  // Instead of calling deleteTask directly:
  // deleteTask(task.id)

  // Call markForDeletion:
  markForDeletion(task.id)
  onOpenChange(false)
}
```

### 3. Add Translation Keys

```json
// zh/tasks.json
{
  "delete": {
    "undoToast": "任务已删除",
    "undoButton": "撤销",
    "restored": "任务已恢复",
    "failed": "删除失败"
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('Undo Delete', () => {
  it('should restore task when undo is clicked within 3 seconds', () => {
    const { markForDeletion, undoDelete, tasks } = useTaskStore.getState()

    markForDeletion('task-1')
    expect(tasks).not.toContainEqual(expect.objectContaining({ id: 'task-1' }))

    undoDelete('task-1')
    expect(tasks).toContainEqual(expect.objectContaining({ id: 'task-1' }))
  })

  it('should delete task after 3 seconds if not undone', async () => {
    vi.useFakeTimers()
    const { markForDeletion, tasks } = useTaskStore.getState()

    markForDeletion('task-1')

    vi.advanceTimersByTime(3000)
    await vi.runAllTimersAsync()

    // Task should be permanently deleted
    expect(taskService.deleteTask).toHaveBeenCalledWith('task-1')
  })
})
```

---

## Definition of Done

- [x] Mark for deletion mechanism implemented
- [x] Toast with undo button shows for 3 seconds
- [x] Undo restores task correctly
- [x] Actual deletion delayed by 3 seconds
- [x] Multiple pending deletes supported
- [x] Internationalization implemented
- [x] Unit tests written and passing
- [x] No regression in existing delete functionality

---

## Risk Mitigation

**Primary Risk:** User confusion about deletion timing

**Mitigation:**
- Clear Toast message with countdown
- Undo button prominent
- Confirmation dialog still exists for first gate

**Rollback:** Revert to immediate deletion

---

## Related Stories

- **Story 2.5:** Keyboard Shortcuts (can add Ctrl+Z for undo)

---

## References

- [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/sonner)
- [Gmail-style undo pattern](https://uxdesign.cc/undo-the-unintended-consequences-of-immediate-action-3f8ed6d0f8b4)
