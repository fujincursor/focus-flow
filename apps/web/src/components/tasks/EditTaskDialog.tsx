import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, UpdateTaskInput } from '@/types/task'

// Form validation schema
const editTaskFormSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不能超过200字符'),
  description: z.string().max(1000, '任务描述不能超过1000字符').optional(),
  time_sensitivity: z.enum(['today', 'this_week', 'anytime'], {
    required_error: '请选择时间敏感度',
  }),
  estimated_duration: z.coerce
    .number()
    .int('预估时长必须为整数')
    .positive('预估时长必须为正数')
    .max(480, '预估时长不能超过8小时')
    .optional()
    .nullable(),
})

type EditTaskFormData = z.infer<typeof editTaskFormSchema>

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const updateTask = useTaskStore(state => state.updateTask)

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      time_sensitivity: task.time_sensitivity,
      estimated_duration: task.estimated_duration,
    },
  })

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description || '',
      time_sensitivity: task.time_sensitivity,
      estimated_duration: task.estimated_duration,
    })
  }, [task, form])

  async function onSubmit(values: EditTaskFormData) {
    setIsSubmitting(true)

    // Prepare input data
    const input: UpdateTaskInput = {
      title: values.title,
      description: values.description || null,
      time_sensitivity: values.time_sensitivity,
      estimated_duration: values.estimated_duration || null,
    }

    // Update task
    const updatedTask = await updateTask(task.id, input)

    setIsSubmitting(false)

    if (updatedTask) {
      toast({
        title: '任务更新成功',
        description: `任务"${updatedTask.title}"已更新`,
      })
      onOpenChange(false)
    } else {
      toast({
        variant: 'destructive',
        title: '更新任务失败',
        description: '请稍后重试',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
          <DialogDescription>
            修改任务信息。更新标题、描述、时间敏感度和预估时长。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>任务标题 *</FormLabel>
                  <FormControl>
                    <Input placeholder="输入任务标题..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>任务描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入任务详细描述（可选）..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>任务的详细说明或备注</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time sensitivity field */}
            <FormField
              control={form.control}
              name="time_sensitivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>时间敏感度 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择时间敏感度" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="today">今天必须完成</SelectItem>
                      <SelectItem value="this_week">本周内完成</SelectItem>
                      <SelectItem value="anytime">任何时候</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>任务的紧急程度</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated duration field */}
            <FormField
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预估时长（分钟）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="例如：60"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => {
                        const value = e.target.value
                        field.onChange(value === '' ? null : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormDescription>完成此任务预计需要的时间（分钟）</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '更新中...' : '更新任务'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
