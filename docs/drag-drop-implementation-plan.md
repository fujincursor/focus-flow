# 拖放排序功能实现计划

## 📋 概述

为 TasksPage 添加拖放排序功能，允许用户通过拖拽来重新排列任务顺序。

## ✅ 已完成

1. **安装依赖**
   - `@dnd-kit/core` - 核心拖放功能
   - `@dnd-kit/sortable` - 可排序列表
   - `@dnd-kit/utilities` - 工具函数

2. **数据库迁移准备**
   - 创建迁移文件：`supabase/migrations/20251120000000_add_task_order.sql`
   - 添加 `display_order` 字段（INT，默认0）
   - 创建索引：`idx_tasks_display_order`

3. **类型定义更新**
   - 更新 `apps/web/src/types/task.ts`
   - `taskSchema` 添加 `display_order` 字段
   - `TaskRow` 类型添加 `display_order` 属性

## 🔄 待实现步骤

### 第 1 步：运行数据库迁移

```bash
# 选项 A：使用 Supabase CLI（如果已配置）
npx supabase db push

# 选项 B：手动在 Supabase Dashboard 执行
# 打开 Supabase Dashboard → SQL Editor
# 执行 supabase/migrations/20251120000000_add_task_order.sql 中的 SQL
```

### 第 2 步：更新 taskStore

在 `apps/web/src/stores/taskStore.ts` 添加：

```typescript
// 添加 reorderTasks 方法
reorderTasks: async (taskId: string, newOrder: number) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ display_order: newOrder })
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Error reordering task:', error)
    return
  }

  // 更新本地状态
  set(state => ({
    tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, display_order: newOrder } : t
    ).sort((a, b) => a.display_order - b.display_order)
  }))
}

// 修改 fetchTasks 添加排序
fetchTasks: async () => {
  // ...
  .order('display_order', { ascending: true })
  .order('created_at', { ascending: false })
  // ...
}
```

### 第 3 步：创建 SortableTaskList 组件

在 `apps/web/src/components/tasks/` 创建 `SortableTaskList.tsx`：

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { TaskList } from './TaskList'

interface SortableTaskListProps {
  tasks: Task[]
  onReorder: (activeId: string, overId: string) => void
  onToggleComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit?: (task: Task) => void
}

export function SortableTaskList({ tasks, onReorder, ...props }: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      onReorder(active.id, over.id)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map(task => (
            <SortableTaskItem key={task.id} task={task} {...props} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableTaskItem({ task, ...props }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* 渲染单个任务卡片 */}
      <div className="task-item">
        {/* 使用 TaskList 的单个任务渲染逻辑 */}
      </div>
    </div>
  )
}
```

### 第 4 步：更新 TasksPage

修改 `apps/web/src/pages/TasksPage.tsx`：

```typescript
import { SortableTaskList } from '@/components/tasks'

// 在组件中添加
const handleReorder = async (activeId: string, overId: string) => {
  const oldIndex = tasks.findIndex(t => t.id === activeId)
  const newIndex = tasks.findIndex(t => t.id === overId)

  // 使用 arrayMove 重新排序
  const newTasks = arrayMove(tasks, oldIndex, newIndex)

  // 更新每个任务的 display_order
  for (let i = 0; i < newTasks.length; i++) {
    await taskStore.reorderTasks(newTasks[i].id, i)
  }
}

// 替换 TaskList 为 SortableTaskList
<SortableTaskList
  tasks={uncompletedTasks}
  onReorder={handleReorder}
  onToggleComplete={handleToggleComplete}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

### 第 5 步：添加视觉反馈

在拖拽时添加视觉提示：

```typescript
// 在 SortableTaskItem 中添加
const isDragging = attributes['aria-pressed']

<div
  className={`
    task-item
    ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
  `}
>
  {/* 添加拖拽手柄图标 */}
  <GripVertical className="h-4 w-4 text-muted-foreground" />
  {/* 任务内容 */}
</div>
```

## 🧪 测试清单

- [ ] 可以通过拖拽重新排序任务
- [ ] 排序后刷新页面，顺序保持
- [ ] 不同时间敏感度的任务分别排序
- [ ] 已完成任务不可拖拽
- [ ] 拖拽时有明确的视觉反馈
- [ ] 移动端触摸拖拽正常工作
- [ ] 键盘导航支持（Space + 方向键）

## 📝 注意事项

1. **性能优化**
   - 批量更新 display_order 而非逐个更新
   - 使用乐观更新减少延迟感

2. **用户体验**
   - 添加拖拽手柄图标
   - 拖拽时半透明显示
   - 成功保存后显示 toast 提示

3. **边界情况**
   - 网络离线时本地排序
   - 多设备同步冲突处理
   - 新任务的默认 order 值

## 📚 参考文档

- [@dnd-kit 官方文档](https://docs.dndkit.com/)
- [Sortable List 示例](https://docs.dndkit.com/presets/sortable)
