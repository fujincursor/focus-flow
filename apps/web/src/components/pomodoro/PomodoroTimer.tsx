import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, X, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePomodoroStore } from '@/stores/pomodoroStore'

interface PomodoroTimerProps {
  workDuration?: number // 工作时长（分钟），默认 25
  restDuration?: number // 休息时长（分钟），默认 5
  taskId?: string // 关联的任务 ID（可选）
  onWorkComplete?: () => void // 工作期结束回调
  onRestComplete?: () => void // 休息期结束回调
  onCancel?: () => void // 取消番茄钟回调
  autoStartRest?: boolean // 工作期结束后自动开始休息，默认 false
  soundEnabled?: boolean // 启用声音提示，默认 false
}

type TimerStatus = 'idle' | 'working' | 'paused' | 'resting'

export function PomodoroTimer({
  workDuration = 25,
  restDuration = 5,
  taskId,
  onWorkComplete,
  onRestComplete,
  onCancel,
  autoStartRest = false,
  soundEnabled = false,
}: PomodoroTimerProps) {
  const { t } = useTranslation('pomodoro')
  const { startSession, completeSession, cancelSession } = usePomodoroStore()
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(workDuration * 60) // 秒
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState(0) // 暂停时已经过的时间

  const playSound = useCallback(() => {
    // 使用 Web Audio API 播放简单的提示音
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // Hz
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3

    oscillator.start()
    setTimeout(() => oscillator.stop(), 200)
  }, [])

  const handleWorkComplete = useCallback(async () => {
    if (soundEnabled) playSound()

    // 完成番茄钟会话并保存到数据库
    try {
      await completeSession()
    } catch (error) {
      console.error('Failed to complete pomodoro session:', error)
    }

    onWorkComplete?.()
    if (autoStartRest) {
      setStatus('resting')
      setStartTime(Date.now())
      setTimeLeft(restDuration * 60)
      setPausedTime(0)
    } else {
      setStatus('idle')
      setTimeLeft(workDuration * 60)
    }
  }, [soundEnabled, onWorkComplete, autoStartRest, restDuration, workDuration, playSound, completeSession])

  const handleRestComplete = useCallback(() => {
    if (soundEnabled) playSound()
    onRestComplete?.()
    setStatus('idle')
    setTimeLeft(workDuration * 60)
    setStartTime(null)
    setPausedTime(0)
  }, [soundEnabled, onRestComplete, workDuration, playSound])

  // 使用 Date.now() 计算时间差，避免 setInterval 不准确
  useEffect(() => {
    if (status !== 'working' && status !== 'resting') return

    const interval = setInterval(() => {
      if (!startTime) return

      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const duration = status === 'working' ? workDuration * 60 : restDuration * 60
      const remaining = duration - elapsed

      if (remaining <= 0) {
        if (status === 'working') {
          handleWorkComplete()
        } else {
          handleRestComplete()
        }
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status, startTime, workDuration, restDuration, handleWorkComplete, handleRestComplete])

  const handleStart = async () => {
    setStatus('working')
    setStartTime(Date.now())
    setTimeLeft(workDuration * 60)
    setPausedTime(0)

    // 开始新的番茄钟会话并保存到数据库
    try {
      await startSession(taskId, 'work', workDuration * 60)
    } catch (error) {
      console.error('Failed to start pomodoro session:', error)
    }
  }

  const handlePause = () => {
    if (!startTime) return
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    setPausedTime(elapsed)
    setStatus('paused')
  }

  const handleResume = () => {
    setStatus(status === 'paused' ? 'working' : 'resting')
    setStartTime(Date.now() - pausedTime * 1000)
  }

  const handleStop = async () => {
    // 取消番茄钟会话
    try {
      await cancelSession()
    } catch (error) {
      console.error('Failed to cancel pomodoro session:', error)
    }

    setStatus('idle')
    setTimeLeft(workDuration * 60)
    setStartTime(null)
    setPausedTime(0)
    onCancel?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress =
    status === 'working' || status === 'paused'
      ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
      : status === 'resting'
        ? ((restDuration * 60 - timeLeft) / (restDuration * 60)) * 100
        : 0

  return (
    <Card className="p-6 space-y-4">
      {/* 状态标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h3 className="font-semibold">
            {status === 'working' && t('timer.working')}
            {status === 'paused' && t('timer.paused')}
            {status === 'resting' && t('timer.resting')}
            {status === 'idle' && t('timer.idle')}
          </h3>
        </div>
        {status !== 'idle' && (
          <Badge variant={status === 'working' || status === 'paused' ? 'default' : 'secondary'}>
            {status === 'working' || status === 'paused' ? t('timer.workBadge') : t('timer.restBadge')}
          </Badge>
        )}
      </div>

      {/* 倒计时显示 */}
      <div
        className="text-5xl font-mono font-bold text-center tabular-nums"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(timeLeft)}
      </div>

      {/* 进度条 */}
      {status !== 'idle' && (
        <Progress
          value={progress}
          className={cn(
            'h-2',
            status === 'resting' && '[&>div]:bg-green-500'
          )}
        />
      )}

      {/* 控制按钮 */}
      <div className="flex gap-2 justify-center">
        {status === 'idle' && (
          <Button onClick={handleStart} size="lg" aria-label={t('timer.startAriaLabel')}>
            <Play className="mr-2 h-5 w-5" />
            {t('timer.startWork')}
          </Button>
        )}
        {(status === 'working' || status === 'resting') && (
          <>
            <Button onClick={handlePause} variant="outline" size="lg" aria-label={t('timer.pauseAriaLabel')}>
              <Pause className="mr-2 h-5 w-5" />
              {t('timer.pause')}
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg" aria-label={t('timer.stopAriaLabel')}>
              <X className="mr-2 h-5 w-5" />
              {t('timer.stop')}
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button onClick={handleResume} size="lg" aria-label={t('timer.resumeAriaLabel')}>
              <Play className="mr-2 h-5 w-5" />
              {t('timer.resume')}
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg" aria-label={t('timer.stopAriaLabel')}>
              <X className="mr-2 h-5 w-5" />
              {t('timer.stop')}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
