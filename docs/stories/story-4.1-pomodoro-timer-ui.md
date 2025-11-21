# Story 4.1: 创建番茄计时器 UI 组件

**Epic:** Epic 4 - 番茄工作法集成 (Pomodoro Integration)
**Story ID:** 4.1
**优先级:** P0 (V1.1 核心功能)
**预估工作量:** 8小时
**状态:** Ready for Development

---

## 用户故事

**作为** Focus Flow 用户，
**我想要** 在"专注当下"视图中使用番茄计时器，
**以便** 我可以通过结构化时间块（25分钟工作 + 5分钟休息）保持深度专注。

---

## 故事上下文

### Existing System Integration

- **Integrates with:** `CurrentViewPage.tsx` - 主焦点任务视图
- **Technology:** React 18 + TypeScript + shadcn/ui (Radix UI)
- **Follows pattern:** 现有组件模式 (FocusTaskCard, TaskForm)
- **Touch points:**
  - 使用 shadcn/ui 的 `Button`, `Progress`, `Card` 组件
  - 集成到 `CurrentViewPage.tsx` 布局中
  - 使用 `lucide-react` 图标库

---

## 验收标准

### Functional Requirements

1. **[必需] 倒计时显示**
   - 显示 `MM:SS` 格式的倒计时（例如：`25:00`, `04:32`）
   - 工作期默认 25 分钟，休息期默认 5 分钟
   - 每秒更新一次显示

2. **[必需] 状态管理**
   - 支持三种状态：`idle`（空闲）、`working`（工作中）、`resting`（休息中）
   - 工作期和休息期使用不同的视觉样式区分
   - 状态转换清晰（工作 → 休息 → 工作）

3. **[必需] 控制按钮**
   - **开始按钮**（Play 图标）：启动番茄钟
   - **暂停按钮**（Pause 图标）：暂停计时器
   - **停止按钮**（X 图标）：取消当前番茄钟并重置
   - 按钮根据当前状态动态显示/禁用

4. **[必需] 进度可视化**
   - 使用 shadcn/ui `Progress` 组件显示时间进度
   - 进度条百分比 = `(已用时间 / 总时长) × 100%`
   - 工作期和休息期使用不同的颜色（工作：primary，休息：green）

5. **[可选] 声音提示**
   - 工作期结束时播放提示音（可在设置中禁用）
   - 休息期结束时播放提示音
   - 使用 Web Audio API 或 HTML5 `<audio>` 元素

### Integration Requirements

6. **[必需] 组件可配置性**
   - 通过 props 支持自定义工作时长和休息时长
   - 默认值：`workDuration={25}` `restDuration={5}`（单位：分钟）
   - 支持回调函数：`onWorkComplete`, `onRestComplete`, `onCancel`

7. **[必需] 遵循现有设计系统**
   - 使用 shadcn/ui 组件库（Button, Progress, Card）
   - 使用 Tailwind CSS 类名（符合现有配置）
   - 使用 `lucide-react` 图标（Play, Pause, X, Timer）
   - 响应式设计：移动端（375px+）、桌面端（1280px+）

8. **[必需] 无障碍支持**
   - 按钮包含 `aria-label` 描述
   - 计时器显示带 `role="timer"` 和 `aria-live="polite"`
   - 键盘可访问（空格键 = 开始/暂停，Escape = 停止）

### Quality Requirements

9. **[必需] 单元测试覆盖**
   - 测试计时器状态转换（idle → working → resting → idle）
   - 测试倒计时逻辑（使用 `vi.useFakeTimers()`）
   - 测试按钮交互（开始、暂停、停止）
   - 测试进度计算准确性

10. **[必需] 性能要求**
    - 使用 `Date.now()` 计算时间差（而非 `setInterval` 计数）
    - 避免不必要的重渲染（使用 `React.memo` 或 `useMemo`）
    - 计时器更新频率 = 1 秒（不阻塞 UI 主线程）

11. **[必需] 现有功能无回归**
    - `CurrentViewPage.tsx` 的任务切换功能正常
    - `FocusTaskCard` 的完成/延后按钮不受影响
    - 页面布局无错位（特别是移动端）

---

## 技术细节

### 组件设计

**PomodoroTimer 组件接口：**

```typescript
// src/components/pomodoro/PomodoroTimer.tsx

interface PomodoroTimerProps {
  workDuration?: number // 工作时长（分钟），默认 25
  restDuration?: number // 休息时长（分钟），默认 5
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
  onWorkComplete,
  onRestComplete,
  onCancel,
  autoStartRest = false,
  soundEnabled = false,
}: PomodoroTimerProps) {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(workDuration * 60) // 秒
  const [startTime, setStartTime] = useState<number | null>(null)

  // 使用 Date.now() 计算时间差，避免 setInterval 不准确
  useEffect(() => {
    if (status !== 'working' && status !== 'resting') return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime!) / 1000)
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
  }, [status, startTime, workDuration, restDuration])

  const handleStart = () => {
    setStatus('working')
    setStartTime(Date.now())
    setTimeLeft(workDuration * 60)
  }

  const handlePause = () => {
    setStatus('paused')
  }

  const handleResume = () => {
    setStatus('working')
    setStartTime(Date.now() - (workDuration * 60 - timeLeft) * 1000)
  }

  const handleStop = () => {
    setStatus('idle')
    setTimeLeft(workDuration * 60)
    setStartTime(null)
    onCancel?.()
  }

  const handleWorkComplete = () => {
    if (soundEnabled) playSound()
    onWorkComplete?.()
    if (autoStartRest) {
      setStatus('resting')
      setStartTime(Date.now())
      setTimeLeft(restDuration * 60)
    } else {
      setStatus('idle')
    }
  }

  const handleRestComplete = () => {
    if (soundEnabled) playSound()
    onRestComplete?.()
    setStatus('idle')
    setTimeLeft(workDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = status === 'working'
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((restDuration * 60 - timeLeft) / (restDuration * 60)) * 100

  return (
    <Card className="p-6 space-y-4">
      {/* 状态标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h3 className="font-semibold">
            {status === 'working' && '专注工作中'}
            {status === 'resting' && '休息时间'}
            {status === 'idle' && '番茄工作法'}
          </h3>
        </div>
        {status !== 'idle' && (
          <Badge variant={status === 'working' ? 'default' : 'secondary'}>
            {status === 'working' ? '工作' : '休息'}
          </Badge>
        )}
      </div>

      {/* 倒计时显示 */}
      <div
        className="text-5xl font-mono font-bold text-center"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(timeLeft)}
      </div>

      {/* 进度条 */}
      <Progress
        value={progress}
        className={cn(
          'h-2',
          status === 'working' && 'bg-primary',
          status === 'resting' && 'bg-green-500'
        )}
      />

      {/* 控制按钮 */}
      <div className="flex gap-2 justify-center">
        {status === 'idle' && (
          <Button onClick={handleStart} size="lg" aria-label="开始番茄钟">
            <Play className="mr-2 h-5 w-5" />
            开始
          </Button>
        )}
        {(status === 'working' || status === 'resting') && (
          <>
            <Button onClick={handlePause} variant="outline" size="lg" aria-label="暂停">
              <Pause className="mr-2 h-5 w-5" />
              暂停
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg" aria-label="停止">
              <X className="mr-2 h-5 w-5" />
              停止
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button onClick={handleResume} size="lg" aria-label="继续">
              <Play className="mr-2 h-5 w-5" />
              继续
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg" aria-label="停止">
              <X className="mr-2 h-5 w-5" />
              停止
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
```

### 文件结构

```
apps/web/src/components/pomodoro/
├── PomodoroTimer.tsx          # 主组件
├── PomodoroTimer.test.tsx     # 单元测试
└── index.ts                   # 导出
```

### 依赖项

- ✅ 已有依赖：`lucide-react`, `@radix-ui/react-progress`, `class-variance-authority`
- ❌ 无需新增依赖

---

## 风险与兼容性

### Minimal Risk Assessment

**Primary Risk:** 计时器在浏览器标签页失焦时不准确（浏览器节流 `setInterval`）

**Mitigation:**
- 使用 `Date.now()` 计算时间差，而非依赖 `setInterval` 计数
- 检测页面可见性变化（`document.visibilitychange`），恢复时重新计算剩余时间

**Rollback:**
- 组件独立，可直接从 `CurrentViewPage.tsx` 移除
- 不影响现有任务管理功能

### Compatibility Verification

- [x] **No breaking changes to existing APIs** - 新增独立组件，不修改现有代码
- [x] **Database changes** - 无数据库变更（纯前端组件）
- [x] **UI changes follow existing design patterns** - 使用 shadcn/ui 和 Tailwind CSS
- [x] **Performance impact is negligible** - 1 秒更新一次，使用 `Date.now()` 计算

---

## Definition of Done

- [ ] `PomodoroTimer.tsx` 组件创建并通过 TypeScript 类型检查
- [ ] 倒计时逻辑正确（MM:SS 格式，每秒更新）
- [ ] 状态转换正确（idle → working → resting → idle）
- [ ] 进度条准确反映时间进度
- [ ] 按钮交互流畅（开始/暂停/停止）
- [ ] 响应式布局正常（移动端 + 桌面端）
- [ ] 无障碍支持（aria-label, 键盘导航）
- [ ] 单元测试覆盖率 ≥ 80%（使用 Vitest）
- [ ] 现有页面布局无错位（手动测试 `CurrentViewPage.tsx`）
- [ ] 代码符合 ESLint 规则

---

## 测试策略

### 单元测试用例（Vitest）

```typescript
// PomodoroTimer.test.tsx

describe('PomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should display initial time in MM:SS format', () => {
    render(<PomodoroTimer workDuration={25} />)
    expect(screen.getByRole('timer')).toHaveTextContent('25:00')
  })

  it('should start timer when Start button clicked', async () => {
    const user = userEvent.setup({ delay: null })
    render(<PomodoroTimer workDuration={1} />)

    await user.click(screen.getByLabelText('开始番茄钟'))
    vi.advanceTimersByTime(1000)

    expect(screen.getByRole('timer')).toHaveTextContent('00:59')
  })

  it('should call onWorkComplete when work session ends', async () => {
    const onWorkComplete = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<PomodoroTimer workDuration={1} onWorkComplete={onWorkComplete} />)

    await user.click(screen.getByLabelText('开始番茄钟'))
    vi.advanceTimersByTime(60000) // 1分钟

    expect(onWorkComplete).toHaveBeenCalledTimes(1)
  })

  it('should pause and resume timer', async () => {
    const user = userEvent.setup({ delay: null })
    render(<PomodoroTimer workDuration={1} />)

    await user.click(screen.getByLabelText('开始番茄钟'))
    vi.advanceTimersByTime(30000) // 30秒
    await user.click(screen.getByLabelText('暂停'))

    expect(screen.getByRole('timer')).toHaveTextContent('00:30')

    vi.advanceTimersByTime(10000) // 暂停期间过去10秒
    expect(screen.getByRole('timer')).toHaveTextContent('00:30') // 时间不变
  })

  it('should reset timer when Stop button clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<PomodoroTimer workDuration={1} onCancel={onCancel} />)

    await user.click(screen.getByLabelText('开始番茄钟'))
    vi.advanceTimersByTime(30000)
    await user.click(screen.getByLabelText('停止'))

    expect(screen.getByRole('timer')).toHaveTextContent('01:00')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should calculate progress correctly', async () => {
    const user = userEvent.setup({ delay: null })
    render(<PomodoroTimer workDuration={1} />)

    await user.click(screen.getByLabelText('开始番茄钟'))
    vi.advanceTimersByTime(30000) // 30秒 = 50%

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  })
})
```

---

## 参考资料

- **shadcn/ui Progress**: https://ui.shadcn.com/docs/components/progress
- **Radix UI Accessible Timer**: https://www.radix-ui.com/primitives/docs/overview/accessibility
- **Pomodoro Technique**: https://en.wikipedia.org/wiki/Pomodoro_Technique
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## 下一步

完成此 Story 后，继续 **Story 4.2: 番茄钟数据追踪与持久化**，实现后端数据存储和每日总结集成。
