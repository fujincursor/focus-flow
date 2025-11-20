import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { Trash2, Clock, Pencil } from 'lucide-react'
import type { Task } from '@/types/task'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit?: (task: Task) => void
}

const TIME_SENSITIVITY_LABELS = {
  today: '今天',
  this_week: '本周',
  anytime: '任何时候',
} as const

const TIME_SENSITIVITY_COLORS = {
  today: 'text-red-600 bg-red-50',
  this_week: 'text-orange-600 bg-orange-50',
  anytime: 'text-blue-600 bg-blue-50',
} as const

export function TaskList({ tasks, onToggleComplete, onDelete, onEdit }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">暂无任务</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            点击"创建任务"开始添加您的第一个任务
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
            task.is_completed ? 'opacity-60' : ''
          }`}
        >
          {/* Checkbox */}
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={checked => onToggleComplete(task.id, Boolean(checked))}
            className="mt-1"
          />

          {/* Task content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium ${
                  task.is_completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </h3>

              {/* Action buttons */}
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Edit button */}
                {onEdit && !task.is_completed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(task)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">编辑任务</span>
                  </Button>
                )}

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">删除任务</span>
                </Button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-sm ${
                  task.is_completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Time sensitivity badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${
                  TIME_SENSITIVITY_COLORS[task.time_sensitivity]
                }`}
              >
                {TIME_SENSITIVITY_LABELS[task.time_sensitivity]}
              </span>

              {/* Estimated duration */}
              {task.estimated_duration && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.estimated_duration)}
                </span>
              )}

              {/* Completed timestamp */}
              {task.is_completed && task.completed_at && (
                <span className="text-muted-foreground">
                  完成于 {new Date(task.completed_at).toLocaleString('zh-CN')}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
