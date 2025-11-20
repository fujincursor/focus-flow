import { Check, Clock, Edit, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/types/task'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface FocusTaskCardProps {
  task: Task
  onComplete: () => void
  onDefer: () => void
  onEdit: () => void
  onNext?: () => void
}

const TIME_SENSITIVITY_CONFIG = {
  today: {
    label: '今天必须',
    bgColor: 'bg-red-50 dark:bg-red-950',
    badgeVariant: 'destructive' as const,
  },
  this_week: {
    label: '本周内',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    badgeVariant: 'default' as const,
  },
  anytime: {
    label: '随时可做',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    badgeVariant: 'secondary' as const,
  },
}

export function FocusTaskCard({
  task,
  onComplete,
  onDefer,
  onEdit,
  onNext,
}: FocusTaskCardProps) {
  const config = TIME_SENSITIVITY_CONFIG[task.time_sensitivity]
  const createdAgo = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <Card className={`w-full max-w-2xl shadow-2xl ${config.bgColor} transition-all duration-300 animate-in fade-in zoom-in-95`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge variant={config.badgeVariant} className="mb-3">
              {config.label}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              {task.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="编辑任务"
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {task.estimated_duration
                ? `预计 ${task.estimated_duration} 分钟`
                : '无时间估计'}
            </span>
          </div>
          <span>•</span>
          <span>创建于 {createdAgo}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onComplete}
          size="lg"
          className="w-full sm:flex-1 text-base"
        >
          <Check className="mr-2 h-5 w-5" />
          完成任务
        </Button>
        <Button
          onClick={onDefer}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          延后
        </Button>
        {onNext && (
          <Button
            onClick={onNext}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <span>下一个</span>
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
