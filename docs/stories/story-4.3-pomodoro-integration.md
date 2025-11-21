# Story 4.3: 番茄工作法集成到专注当下视图

**Epic:** Epic 4 - 番茄工作法集成 (Pomodoro Integration)
**Story ID:** 4.3
**优先级:** P0 (V1.1 核心功能)
**预估工作量:** 6小时
**状态:** Ready for Development
**依赖:** Story 4.1, Story 4.2

---

## 用户故事

**作为** Focus Flow 用户，
**我想要** 在"专注当下"视图中无缝使用番茄工作法，并可以在设置中控制是否启用，
**以便** 我可以根据个人偏好选择是否使用番茄计时器来提升专注力。

---

## 故事上下文

### Existing System Integration

- **Integrates with:**
  - `CurrentViewPage.tsx` - 主焦点任务视图
  - `SettingsPage.tsx` - 用户设置页面
  - `PomodoroTimer` 组件（Story 4.1）
  - `usePomodoroStore` Zustand store（Story 4.2）
  - `DailySummaryPage.tsx` - 每日总结视图
- **Technology:**
  - React 18 + TypeScript
  - Zustand for settings state
  - shadcn/ui Dialog component
  - localStorage for settings persistence
- **Follows pattern:**
  - 现有设置模式（参考 `SettingsPage.tsx` 的 Switch 组件）
  - 渐进式功能推出（默认禁用，用户主动启用）
  - 响应式布局（移动端优先）
- **Touch points:**
  - `CurrentViewPage.tsx` 布局调整
  - 新增设置项：`enablePomodoro`
  - 新增 Dialog：工作期结束提示、休息期结束提示

---

## 验收标准

### Functional Requirements

1. **[必需] 设置页面集成**
   - 在 `SettingsPage.tsx` 添加"启用番茄工作法"开关
   - 使用 shadcn/ui `Switch` 组件
   - 默认值：`false`（禁用）
   - 设置保存到 `localStorage`（key: `settings.enablePomodoro`）
   - 切换后立即生效（无需刷新页面）

2. **[必需] CurrentViewPage 布局调整**
   - **启用番茄工作法时：**
     - 在 `FocusTaskCard` 上方显示 `PomodoroTimer` 组件
     - 计时器占据独立的 Card 区域（不干扰任务卡片）
     - 移动端：计时器在任务卡片上方，垂直堆叠
     - 桌面端：可选择并排显示或堆叠（根据屏幕宽度）
   - **禁用番茄工作法时：**
     - 不显示 `PomodoroTimer` 组件
     - 保持现有布局（FocusTaskCard 居中显示）

3. **[必需] 工作期结束提示**
   - 工作期（25 分钟）结束时，显示 Dialog 提示：
     - 标题："工作期结束 🎉"
     - 内容："你已完成一个番茄钟！建议休息 5 分钟。"
     - 按钮：
       - "开始休息"（主按钮）- 启动 5 分钟休息计时
       - "继续工作"（次要按钮）- 开始新的 25 分钟工作期
       - "稍后决定"（关闭按钮）- 关闭对话框，计时器进入空闲状态
   - 自动播放提示音（如果设置中启用）

4. **[必需] 休息期结束提示**
   - 休息期（5 分钟）结束时，显示 Dialog 提示：
     - 标题："休息结束 ⏰"
     - 内容："准备好继续专注工作了吗？"
     - 按钮：
       - "开始工作"（主按钮）- 启动新的 25 分钟工作期
       - "再休息一会"（次要按钮）- 延长休息 5 分钟
       - "暂停计时"（关闭按钮）- 停止计时器
   - 自动播放提示音

5. **[必需] 任务关联**
   - 启动番茄钟时，自动关联到当前焦点任务（`currentTask.id`）
   - 在 `DailySummaryPage` 显示今日完成的任务及其番茄钟数量
   - 示例："任务 A - 完成 3 个番茄钟"

### Integration Requirements

6. **[必需] 设置状态管理**
   - 使用现有的 settings 管理模式（localStorage + React state）
   - 或创建 `useSettingsStore` Zustand store（如果不存在）
   - 设置项：
     ```typescript
     interface Settings {
       enablePomodoro: boolean
       pomodoroWorkDuration: number // 默认 25 分钟
       pomodoroRestDuration: number // 默认 5 分钟
       pomodoroSoundEnabled: boolean // 默认 false
       autoStartRest: boolean // 工作期结束后自动开始休息，默认 false
     }
     ```

7. **[必需] 响应式设计**
   - 移动端（375px - 767px）：
     - 计时器和任务卡片垂直堆叠
     - Dialog 全屏显示（使用 `DialogOverlay` 覆盖）
   - 平板端（768px - 1279px）：
     - 计时器在任务卡片上方，间距适中
   - 桌面端（1280px+）：
     - 可选择并排显示（计时器在左，任务卡片在右）

8. **[必需] 遵循现有设计系统**
   - 使用 shadcn/ui Dialog, Switch, Label 组件
   - 使用现有的 Tailwind CSS 配置
   - 保持与 `FocusTaskCard` 一致的视觉风格

### Quality Requirements

9. **[必需] 用户体验优化**
   - 计时器不阻塞任务操作（完成/延后/编辑按钮仍可用）
   - 完成任务时，询问是否取消当前番茄钟或继续计时下一个任务
   - 切换任务时，保留当前番茄钟进度（或询问用户）

10. **[必需] 测试覆盖**
    - 单元测试：设置切换逻辑
    - 集成测试：CurrentViewPage 布局在不同设置下的渲染
    - E2E 测试：完整的番茄工作法流程（启动 → 工作 → 休息 → 完成）

11. **[必需] 现有功能无回归**
    - 禁用番茄工作法时，`CurrentViewPage` 完全保持原有行为
    - 任务切换逻辑不受影响
    - 每日总结的其他统计（完成任务数、创建任务数）正常

---

## 技术细节

### Settings Store

**文件：** `apps/web/src/stores/settingsStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  enablePomodoro: boolean
  pomodoroWorkDuration: number // 分钟
  pomodoroRestDuration: number // 分钟
  pomodoroSoundEnabled: boolean
  autoStartRest: boolean
}

interface SettingsStore {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: Settings = {
  enablePomodoro: false,
  pomodoroWorkDuration: 25,
  pomodoroRestDuration: 5,
  pomodoroSoundEnabled: false,
  autoStartRest: false,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'focus-flow-settings',
    }
  )
)
```

### CurrentViewPage 集成

**文件：** `apps/web/src/pages/CurrentViewPage.tsx` (更新)

```typescript
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { WorkCompleteDialog } from '@/components/pomodoro/WorkCompleteDialog'
import { RestCompleteDialog } from '@/components/pomodoro/RestCompleteDialog'

export function CurrentViewPage() {
  const { settings } = useSettingsStore()
  const { startSession, completeSession } = usePomodoroStore()
  const [showWorkCompleteDialog, setShowWorkCompleteDialog] = useState(false)
  const [showRestCompleteDialog, setShowRestCompleteDialog] = useState(false)

  const currentTask = currentTasks[currentTaskIndex]

  const handleWorkComplete = () => {
    setShowWorkCompleteDialog(true)
  }

  const handleRestComplete = () => {
    setShowRestCompleteDialog(true)
  }

  const handleStartRest = async () => {
    setShowWorkCompleteDialog(false)
    await startSession(undefined, 'rest', settings.pomodoroRestDuration * 60)
  }

  const handleContinueWork = async () => {
    setShowWorkCompleteDialog(false)
    await startSession(currentTask?.id, 'work', settings.pomodoroWorkDuration * 60)
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">专注当下</h1>

      {/* 进度指示器 */}
      {/* ... 现有代码 ... */}

      {/* 番茄计时器（条件渲染） */}
      {settings.enablePomodoro && (
        <div className="max-w-2xl mx-auto mb-6">
          <PomodoroTimer
            workDuration={settings.pomodoroWorkDuration}
            restDuration={settings.pomodoroRestDuration}
            soundEnabled={settings.pomodoroSoundEnabled}
            autoStartRest={settings.autoStartRest}
            onWorkComplete={handleWorkComplete}
            onRestComplete={handleRestComplete}
          />
        </div>
      )}

      {/* 焦点任务卡片 */}
      <div className="max-w-2xl mx-auto">
        {currentTask ? (
          <FocusTaskCard
            task={currentTask}
            onComplete={handleCompleteTask}
            onDefer={handleDeferTask}
            onEdit={handleEditTask}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* 工作期结束对话框 */}
      <WorkCompleteDialog
        open={showWorkCompleteDialog}
        onOpenChange={setShowWorkCompleteDialog}
        onStartRest={handleStartRest}
        onContinueWork={handleContinueWork}
      />

      {/* 休息期结束对话框 */}
      <RestCompleteDialog
        open={showRestCompleteDialog}
        onOpenChange={setShowRestCompleteDialog}
        onStartWork={handleContinueWork}
      />
    </div>
  )
}
```

### Work Complete Dialog

**文件：** `apps/web/src/components/pomodoro/WorkCompleteDialog.tsx`

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WorkCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartRest: () => void
  onContinueWork: () => void
}

export function WorkCompleteDialog({
  open,
  onOpenChange,
  onStartRest,
  onContinueWork,
}: WorkCompleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">工作期结束 🎉</DialogTitle>
          <DialogDescription className="text-base">
            你已完成一个番茄钟！建议休息 5 分钟，让大脑放松一下。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onStartRest} size="lg" className="flex-1">
            开始休息（5 分钟）
          </Button>
          <Button onClick={onContinueWork} variant="outline" size="lg" className="flex-1">
            继续工作
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="lg"
            className="flex-1"
          >
            稍后决定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### SettingsPage 集成

**文件：** `apps/web/src/pages/SettingsPage.tsx` (更新)

```typescript
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">设置</h1>

      <div className="space-y-6">
        {/* 现有设置 */}
        {/* ... */}

        {/* 番茄工作法设置 */}
        <Card>
          <CardHeader>
            <CardTitle>番茄工作法</CardTitle>
            <CardDescription>
              使用番茄工作法（25分钟工作 + 5分钟休息）提升专注力
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-pomodoro" className="flex-1">
                启用番茄工作法
              </Label>
              <Switch
                id="enable-pomodoro"
                checked={settings.enablePomodoro}
                onCheckedChange={(checked) =>
                  updateSettings({ enablePomodoro: checked })
                }
              />
            </div>

            {settings.enablePomodoro && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pomodoro-sound" className="flex-1">
                    启用提示音
                  </Label>
                  <Switch
                    id="pomodoro-sound"
                    checked={settings.pomodoroSoundEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings({ pomodoroSoundEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-start-rest" className="flex-1">
                    工作期结束后自动开始休息
                  </Label>
                  <Switch
                    id="auto-start-rest"
                    checked={settings.autoStartRest}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoStartRest: checked })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 风险与兼容性

### Minimal Risk Assessment

**Primary Risk:** 番茄计时器干扰现有任务切换流程

**Mitigation:**
- 默认禁用番茄工作法（渐进式推出）
- 完成任务时，提供"取消番茄钟"或"继续计时下一个任务"选项
- 切换任务时，保留番茄钟进度（存储到 `currentSession` 状态）

**Rollback:**
- 在设置中关闭"启用番茄工作法"即可恢复原有体验
- 代码使用条件渲染（`{settings.enablePomodoro && ...}`），易于隔离

### Compatibility Verification

- [x] **No breaking changes to existing APIs** - 纯新增功能，不修改现有组件 props
- [x] **Database changes** - 无新增数据库变更（Story 4.2 已完成）
- [x] **UI changes follow existing design patterns** - 使用 shadcn/ui Dialog + Switch
- [x] **Performance impact is minimal** - 条件渲染，禁用时无额外渲染

---

## Definition of Done

- [ ] `useSettingsStore` 创建并支持番茄工作法设置
- [ ] `SettingsPage` 添加番茄工作法设置区域（Switch 组件）
- [ ] `CurrentViewPage` 集成 `PomodoroTimer` 组件（条件渲染）
- [ ] `WorkCompleteDialog` 和 `RestCompleteDialog` 组件创建
- [ ] 工作期结束后显示对话框并提供 3 个选项
- [ ] 休息期结束后显示对话框并提供 3 个选项
- [ ] 番茄钟自动关联到当前焦点任务
- [ ] 响应式布局正常（移动端 + 平板 + 桌面）
- [ ] 禁用番茄工作法时，页面完全保持原有行为
- [ ] 单元测试和 E2E 测试通过
- [ ] 现有功能无回归
- [ ] 代码符合 ESLint 规则

---

## 测试策略

### E2E 测试用例（Playwright）

```typescript
// pomodoro-full-flow.spec.ts

test('should complete full pomodoro workflow with task', async ({ page }) => {
  // 登录
  await page.goto('/login')
  await loginAsTestUser(page)

  // 前往设置页面，启用番茄工作法
  await page.goto('/settings')
  await page.click('[id="enable-pomodoro"]')
  await expect(page.locator('[id="enable-pomodoro"]')).toBeChecked()

  // 创建一个任务
  await page.goto('/tasks')
  await page.click('button:has-text("新建任务")')
  await page.fill('[name="title"]', '完成项目报告')
  await page.click('button:has-text("创建")')

  // 前往"专注当下"页面
  await page.goto('/current-view')

  // 验证番茄计时器显示
  await expect(page.locator('text=番茄工作法')).toBeVisible()
  await expect(page.locator('text=25:00')).toBeVisible()

  // 启动番茄钟
  await page.click('button:has-text("开始")')

  // 快进 25 分钟
  await page.clock.fastForward(25 * 60 * 1000)

  // 验证工作期结束对话框
  await expect(page.locator('text=工作期结束 🎉')).toBeVisible()
  await expect(page.locator('text=你已完成一个番茄钟')).toBeVisible()

  // 选择"开始休息"
  await page.click('button:has-text("开始休息（5 分钟）")')

  // 验证休息计时器启动
  await expect(page.locator('text=05:00')).toBeVisible()
  await expect(page.locator('text=休息时间')).toBeVisible()

  // 快进 5 分钟
  await page.clock.fastForward(5 * 60 * 1000)

  // 验证休息期结束对话框
  await expect(page.locator('text=休息结束 ⏰')).toBeVisible()

  // 选择"开始工作"
  await page.click('button:has-text("开始工作")')

  // 验证新的工作期开始
  await expect(page.locator('text=25:00')).toBeVisible()

  // 前往每日总结页面
  await page.goto('/daily-summary')

  // 验证番茄钟统计
  await expect(page.locator('text=完成 1 个番茄钟')).toBeVisible()
})

test('should hide pomodoro timer when disabled in settings', async ({ page }) => {
  await page.goto('/login')
  await loginAsTestUser(page)

  // 确保番茄工作法禁用
  await page.goto('/settings')
  const pomodoroSwitch = page.locator('[id="enable-pomodoro"]')
  if (await pomodoroSwitch.isChecked()) {
    await pomodoroSwitch.click()
  }

  // 前往"专注当下"页面
  await page.goto('/current-view')

  // 验证番茄计时器不显示
  await expect(page.locator('text=番茄工作法')).not.toBeVisible()
  await expect(page.locator('text=25:00')).not.toBeVisible()

  // 验证任务卡片正常显示
  await expect(page.locator('text=专注当下')).toBeVisible()
})
```

---

## 参考资料

- **shadcn/ui Dialog**: https://ui.shadcn.com/docs/components/dialog
- **shadcn/ui Switch**: https://ui.shadcn.com/docs/components/switch
- **Zustand Persist**: https://github.com/pmndrs/zustand#persist-middleware

---

## Epic 完成标准

完成此 Story 后，**Epic 4: 番茄工作法集成** 的所有 3 个 Story 均已完成：

- [x] Story 4.1 - 番茄计时器 UI 组件
- [x] Story 4.2 - 数据追踪与持久化
- [x] Story 4.3 - 专注当下视图集成

**Epic Definition of Done:**
- [ ] 用户可在设置中启用/禁用番茄工作法
- [ ] "专注当下"视图显示番茄计时器（启用时）
- [ ] 工作期/休息期结束后显示友好提示
- [ ] 番茄钟数据保存到数据库
- [ ] 每日总结显示番茄钟统计
- [ ] 移动端和桌面端体验流畅
- [ ] 无障碍支持完整
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无现有功能回归

**下一步：** 发布 V1.1，收集用户反馈，迭代优化！🚀
