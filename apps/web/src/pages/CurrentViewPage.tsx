import { useEffect, useState, useCallback } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getCurrentTasks } from '@/lib/currentTaskFilter'
import { FocusTaskCard } from '@/components/current-view'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2, Plus, WifiOff } from 'lucide-react'
import { CreateTaskDialog } from '@/components/tasks'
import { useTaskRealtime, useOnlineStatus } from '@/hooks'
import type { Task } from '@/types/task'

export function CurrentViewPage() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    toggleTaskCompletion,
    updateTask,
  } = useTaskStore()

  const { currentView: settings, loadSettings } = useSettingsStore()

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  // Enable realtime synchronization
  useTaskRealtime()

  // Monitor online/offline status
  const isOnline = useOnlineStatus()

  // Get current recommended tasks (with settings)
  const currentTasks = getCurrentTasks(tasks, {
    maxAnytimeTasks: settings.maxAnytimeTasks,
    prioritizeShortTasks: settings.prioritizeShortTasks,
  })
  const currentTask = currentTasks[currentTaskIndex] || null
  const hasMoreTasks = currentTaskIndex < currentTasks.length - 1

  // Load settings and fetch tasks on mount
  useEffect(() => {
    loadSettings()
    fetchTasks()
  }, [loadSettings, fetchTasks])

  // Handle task completion
  const handleComplete = useCallback(async () => {
    if (!currentTask) return

    // Show celebration animation (if enabled)
    if (settings.celebrationAnimation) {
      setShowCelebration(true)
    }

    // Complete the task
    await toggleTaskCompletion(currentTask.id, true)

    // Auto-switch to next task (if enabled)
    if (settings.autoSwitchAfterComplete) {
      const delay = settings.celebrationAnimation ? 1500 : 0
      setTimeout(() => {
        setShowCelebration(false)
        if (hasMoreTasks) {
          setCurrentTaskIndex(prev => prev + 1)
        }
      }, delay)
    } else {
      // Just hide celebration
      if (settings.celebrationAnimation) {
        setTimeout(() => {
          setShowCelebration(false)
        }, 1500)
      }
    }
  }, [currentTask, toggleTaskCompletion, hasMoreTasks, settings.autoSwitchAfterComplete, settings.celebrationAnimation])

  // Handle defer (降低时间敏感度)
  const handleDefer = useCallback(async () => {
    if (!currentTask) return

    let newSensitivity: Task['time_sensitivity']
    if (currentTask.time_sensitivity === 'today') {
      newSensitivity = 'this_week'
    } else if (currentTask.time_sensitivity === 'this_week') {
      newSensitivity = 'anytime'
    } else {
      // Already at lowest priority, just move to next
      if (hasMoreTasks) {
        setCurrentTaskIndex(prev => prev + 1)
      }
      return
    }

    await updateTask(currentTask.id, {
      time_sensitivity: newSensitivity,
    })

    // Move to next task
    if (hasMoreTasks) {
      setCurrentTaskIndex(prev => prev + 1)
    }
  }, [currentTask, updateTask, hasMoreTasks])

  // Handle next task navigation
  const handleNext = useCallback(() => {
    if (hasMoreTasks) {
      setCurrentTaskIndex(prev => prev + 1)
    }
  }, [hasMoreTasks])

  // Handle previous task navigation
  const handlePrevious = useCallback(() => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1)
    }
  }, [currentTaskIndex])

  // Handle edit (placeholder - will integrate with EditTaskDialog)
  const handleEdit = useCallback(() => {
    // TODO: Implement edit functionality
    console.log('Edit task:', currentTask?.id)
  }, [currentTask])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

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
          handlePrevious()
          break
        case ' ':
          e.preventDefault()
          handleComplete()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious, handleComplete])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" role="status" aria-label="加载任务中" />
      </div>
    )
  }

  // Empty state - no current tasks
  if (!currentTask) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center space-y-6 text-center">
        <CheckCircle2 className="h-24 w-24 text-green-500 animate-in zoom-in-50" />
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">太棒了！</h2>
          <p className="text-xl text-muted-foreground max-w-md">
            {tasks.length === 0
              ? '还没有任务。创建您的第一个任务开始专注吧！'
              : '所有当前任务已处理完毕。享受您的空闲时光！'}
          </p>
        </div>
        <CreateTaskDialog
          trigger={
            <Button size="lg" className="mt-4">
              <Plus className="mr-2 h-5 w-5" />
              创建新任务
            </Button>
          }
        />
        <div className="mt-8 text-sm text-muted-foreground">
          <p>提示：使用键盘快捷键提高效率</p>
          <ul className="mt-2 space-y-1">
            <li><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> 完成任务</li>
            <li><kbd className="px-2 py-1 bg-muted rounded">→</kbd> or <kbd className="px-2 py-1 bg-muted rounded">N</kbd> 下一个</li>
            <li><kbd className="px-2 py-1 bg-muted rounded">←</kbd> or <kbd className="px-2 py-1 bg-muted rounded">P</kbd> 上一个</li>
          </ul>
        </div>
      </div>
    )
  }

  // Main view with current task
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">当下专注</h1>
        <p className="text-lg text-muted-foreground">
          专注于此刻，一次只做一件事
        </p>
        {/* Offline indicator */}
        {!isOnline && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium animate-in fade-in">
            <WifiOff className="h-4 w-4" />
            离线模式
          </div>
        )}
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <div className="text-center space-y-4 animate-in zoom-in-50">
            <CheckCircle2 className="h-32 w-32 text-green-500 mx-auto" />
            <p className="text-3xl font-bold text-white">太棒了！</p>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            任务进度
          </span>
          <span className="font-medium">
            {currentTaskIndex + 1} / {currentTasks.length}
          </span>
        </div>
        <Progress
          value={((currentTaskIndex + 1) / currentTasks.length) * 100}
          className="h-2"
        />
        <div className="text-xs text-muted-foreground text-center">
          {currentTasks.length - currentTaskIndex - 1 === 0
            ? '这是最后一个任务了！'
            : `还有 ${currentTasks.length - currentTaskIndex - 1} 个任务待处理`}
        </div>
      </div>

      {/* Focus task card */}
      <div className="flex justify-center">
        <FocusTaskCard
          task={currentTask}
          onComplete={handleComplete}
          onDefer={handleDefer}
          onEdit={handleEdit}
          onNext={hasMoreTasks ? handleNext : undefined}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentTaskIndex === 0}
        >
          ← 上一个
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasMoreTasks}
        >
          下一个 →
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>快捷键：<kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> 完成 | <kbd className="px-2 py-1 bg-muted rounded text-xs">→/N</kbd> 下一个 | <kbd className="px-2 py-1 bg-muted rounded text-xs">←/P</kbd> 上一个</p>
      </div>
    </div>
  )
}
