import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('tasks')
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
        title: t('edit.success'),
      })
      onOpenChange(false)
    } else {
      toast({
        variant: 'destructive',
        title: t('edit.error'),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('edit.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('create.titlePlaceholder')}
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
                  <FormLabel>{t('create.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('create.titlePlaceholder')} {...field} />
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
                  <FormLabel>{t('create.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('create.descriptionPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('create.descriptionPlaceholder')}</FormDescription>
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
                  <FormLabel>{t('create.timeSensitivityLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('create.timeSensitivityLabel')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="today">{t('timeSensitivity.today')}</SelectItem>
                      <SelectItem value="this_week">{t('timeSensitivity.this_week')}</SelectItem>
                      <SelectItem value="anytime">{t('timeSensitivity.anytime')}</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>{t('create.durationLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('create.durationPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => {
                        const value = e.target.value
                        field.onChange(value === '' ? null : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t('create.durationUnit')}</FormDescription>
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
                {t('create.cancelButton')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {t('edit.submitButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
