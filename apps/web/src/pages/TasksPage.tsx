import { useEffect, useState, useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import {
  CreateTaskDialog,
  DeleteConfirmDialog,
  EditTaskDialog,
  TaskList,
  SortableTaskList,
} from '@/components/tasks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import type { Task } from '@/types/task'
import { useDebounce } from '@/hooks/useDebounce'

export function TasksPage() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    toggleTaskCompletion,
    removeTask,
    reorderTasks,
    getTodayTasks,
    getThisWeekTasks,
    getAnytimeTasks,
    getUncompletedTasks,
    getCompletedTasks,
  } = useTaskStore()

  // State for edit dialog
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // State for delete confirmation dialog
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // State for search
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filter tasks based on search query
  const filterTasksBySearch = useMemo(
    () => (taskList: Task[]) => {
      if (!debouncedSearchQuery.trim()) {
        return taskList
      }
      const query = debouncedSearchQuery.toLowerCase()
      return taskList.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      )
    },
    [debouncedSearchQuery]
  )

  const todayTasks = useMemo(() => filterTasksBySearch(getTodayTasks()), [filterTasksBySearch, getTodayTasks])
  const thisWeekTasks = useMemo(() => filterTasksBySearch(getThisWeekTasks()), [filterTasksBySearch, getThisWeekTasks])
  const anytimeTasks = useMemo(() => filterTasksBySearch(getAnytimeTasks()), [filterTasksBySearch, getAnytimeTasks])
  const uncompletedTasks = useMemo(() => filterTasksBySearch(getUncompletedTasks()), [filterTasksBySearch, getUncompletedTasks])
  const completedTasks = useMemo(() => filterTasksBySearch(getCompletedTasks()), [filterTasksBySearch, getCompletedTasks])

  // Handle task completion toggle
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    await toggleTaskCompletion(taskId, completed)
  }

  // Handle task deletion - open confirmation dialog
  const handleDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setDeletingTask(task)
      setDeleteDialogOpen(true)
    }
  }

  // Confirm task deletion
  const handleConfirmDelete = async () => {
    if (deletingTask) {
      await removeTask(deletingTask.id)
      setDeleteDialogOpen(false)
      setDeletingTask(null)
    }
  }

  // Handle task edit
  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setEditDialogOpen(true)
  }

  // Handle task reorder (for drag-and-drop)
  const handleReorder = async (taskId: string, newIndex: number) => {
    await reorderTasks(taskId, newIndex)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" role="status" aria-label="Loading tasks" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">所有任务</h1>
          <p className="text-muted-foreground">查看和管理您的所有任务</p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Edit Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        task={deletingTask}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索任务标题或描述..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="搜索任务"
        />
      </div>

      {/* Tabs for filtering tasks */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            全部 ({uncompletedTasks.length + completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            今天 ({todayTasks.length})
          </TabsTrigger>
          <TabsTrigger value="this_week">
            本周 ({thisWeekTasks.length})
          </TabsTrigger>
          <TabsTrigger value="anytime">
            任何时候 ({anytimeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            已完成 ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <SortableTaskList
            tasks={uncompletedTasks}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
                已完成 ({completedTasks.length})
              </h2>
              <TaskList
                tasks={completedTasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="mt-6">
          <SortableTaskList
            tasks={todayTasks.filter(t => !t.is_completed)}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="this_week" className="mt-6">
          <SortableTaskList
            tasks={thisWeekTasks.filter(t => !t.is_completed)}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="anytime" className="mt-6">
          <SortableTaskList
            tasks={anytimeTasks.filter(t => !t.is_completed)}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <TaskList
            tasks={completedTasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
