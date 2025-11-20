# Story 3.3: 创建专注任务卡片组件

**Epic:** Epic 3 - "当下能做什么"视图（核心差异化功能）
**Story ID:** 3.3
**优先级:** 高
**预估工作量:** 6小时
**状态:** Ready for Review

---

## 用户故事

**作为** 用户，
**我想要** 看到放大的、信息丰富的任务卡片，
**以便** 我可以完全专注于当前任务。

---

## 验收标准

1. [x] 创建`src/components/features/current-view/FocusTaskCard.tsx`
2. [x] 卡片样式：大号标题、完整描述、醒目徽章、预估时长、创建时间
3. [x] 卡片交互按钮："完成任务"（主按钮）、"延后"、"编辑"
4. [x] 卡片视觉：白色背景，大圆角，明显阴影
5. [x] 完成任务时播放庆祝动画（在 CurrentViewPage 实现）
6. [x] "延后"功能：降低时间敏感度并切换下一个
7. [x] 符合WCAG AA标准（aria-label, 键盘可访问）
8. [ ] 为FocusTaskCard编写组件测试（未实现）

---

## 技术细节

### 组件设计

**FocusTaskCard 组件接口：**
```typescript
interface FocusTaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onDefer: (taskId: string) => void
  onEdit: (task: Task) => void
}

export function FocusTaskCard({
  task,
  onComplete,
  onDefer,
  onEdit,
}: FocusTaskCardProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  const handleComplete = async () => {
    setShowCelebration(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onComplete(task.id)
  }

  return (
    <Card className="focus-task-card">
      {showCelebration && <ConfettiAnimation />}
      <TimeSensitivityBadge sensitivity={task.time_sensitivity} />
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <div className="metadata">
        <EstimatedTime minutes={task.estimated_minutes} />
        <CreatedAt date={task.created_at} />
      </div>
      <div className="actions">
        <Button onClick={handleComplete}>完成任务</Button>
        <Button variant="outline" onClick={() => onDefer(task.id)}>
          延后
        </Button>
        <Button variant="ghost" onClick={() => onEdit(task)}>
          编辑
        </Button>
      </div>
    </Card>
  )
}
```

### 卡片样式设计

**Tailwind CSS 类：**
```tsx
<Card className="
  w-full max-w-2xl mx-auto
  p-8 sm:p-12
  bg-white
  rounded-3xl
  shadow-2xl
  transition-all duration-300
  hover:shadow-3xl
">
```

**视觉层次：**
1. 时间敏感度徽章（右上角）
2. 标题（2xl或3xl，粗体）
3. 描述（base，灰色）
4. 元数据（小字，浅灰）
5. 操作按钮（底部）

### 庆祝动画

**使用 react-confetti 或自定义动画：**
```typescript
import Confetti from 'react-confetti'

function ConfettiAnimation() {
  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
    />
  )
}
```

**动画时序：**
1. 用户点击"完成任务"
2. 触发五彩纸屑动画
3. 延迟 1.5 秒
4. 调用 onComplete 回调
5. 父组件切换到下一个任务

### "延后"功能逻辑

**降低时间敏感度规则：**
```typescript
function deferTask(task: Task): Partial<Task> {
  const deferMap = {
    today: 'this_week',
    this_week: 'anytime',
    anytime: 'anytime', // 已经是最低优先级
  }

  return {
    time_sensitivity: deferMap[task.time_sensitivity],
  }
}
```

### 测试覆盖

**组件测试（Vitest + Testing Library）：**

1. **渲染测试**
   - 验证任务标题显示
   - 验证描述显示
   - 验证徽章渲染
   - 验证按钮显示

2. **交互测试**
   - 点击"完成任务"触发回调
   - 点击"延后"触发回调
   - 点击"编辑"触发回调

3. **庆祝动画测试**
   - 完成任务时显示动画
   - 动画播放 1.5 秒

4. **无障碍测试**
   - 键盘可访问性
   - ARIA 标签正确
   - 对比度符合 WCAG AA

---

## 依赖关系

**前置条件：**
- TimeSensitivityBadge 组件已存在（Epic 2）
- Task 类型定义
- shadcn/ui Card 组件

**后续使用：**
- Story 3.2 CurrentViewPage 将使用此组件

---

## 开发笔记

### 实现步骤

1. **创建基础组件**
   - FocusTaskCard.tsx
   - Props 接口定义

2. **实现卡片布局**
   - 标题、描述、元数据
   - 响应式设计

3. **添加操作按钮**
   - 完成、延后、编辑

4. **实现庆祝动画**
   - 集成 react-confetti
   - 动画时序控制

5. **实现延后逻辑**
   - 时间敏感度降级

6. **无障碍优化**
   - ARIA 标签
   - 键盘导航

7. **编写组件测试**

### 技术栈
- **框架:** React 18 + TypeScript
- **UI:** shadcn/ui + Tailwind CSS
- **动画:** react-confetti
- **测试:** Vitest + Testing Library

---

## Dev Agent Record

### Tasks
- [ ] 创建 FocusTaskCard 组件
  - [ ] 组件基础结构
  - [ ] Props 接口定义
  - [ ] 卡片布局实现
  - [ ] 样式设计
- [ ] 实现交互功能
  - [ ] 完成按钮逻辑
  - [ ] 延后按钮逻辑
  - [ ] 编辑按钮逻辑
- [ ] 实现庆祝动画
  - [ ] 集成 react-confetti
  - [ ] 动画触发逻辑
- [ ] 无障碍优化
  - [ ] ARIA 标签
  - [ ] 键盘导航
- [ ] 编写组件测试
  - [ ] 渲染测试
  - [ ] 交互测试
  - [ ] 动画测试
  - [ ] 无障碍测试

### Agent Model Used
<!-- Dev agent will fill this -->

### Debug Log References
<!-- Dev agent will add links to debug log entries if needed -->

### Completion Notes
<!-- Dev agent will summarize what was implemented -->

### File List
<!-- Dev agent will list all modified/created files -->

### Change Log
<!-- Dev agent will document key implementation decisions -->

---

## 定义完成 (Definition of Done)

- [ ] FocusTaskCard 组件实现并正确渲染
- [ ] 所有交互按钮正常工作
- [ ] 庆祝动画流畅播放
- [ ] 延后功能正确降低时间敏感度
- [ ] 组件测试全部通过
- [ ] 符合 WCAG AA 无障碍标准
- [ ] 代码通过 ESLint 和 TypeScript 检查
- [ ] 响应式设计在所有设备上正常
- [ ] 代码已提交到版本控制
