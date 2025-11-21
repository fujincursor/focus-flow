# Story 2.1: Time Sensitivity Badge Component - Brownfield Enhancement

**Story ID:** Story 2.1
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement
**Priority:** P2
**Estimated Effort:** 2-3 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 用户，
**我想要** 通过颜色编码的徽章快速识别任务的时间敏感度，
**以便** 我可以一眼看出哪些任务最紧急，优先处理重要事项。

---

## Story Context

### Existing System Integration

- **Integrates with:** TaskList.tsx, FocusTaskCard.tsx, CreateTaskDialog.tsx, EditTaskDialog.tsx
- **Technology:** React + TypeScript + Tailwind CSS + shadcn/ui Badge component
- **Follows pattern:** 现有的 UI 组件模式 (Button, Card, Dialog 等)
- **Touch points:**
  - `apps/web/src/components/tasks/TaskList.tsx` - 显示任务徽章
  - `apps/web/src/components/current-view/FocusTaskCard.tsx` - 显示专注任务徽章
  - `apps/web/src/components/tasks/CreateTaskDialog.tsx` - 预览选中的时间敏感度
  - `apps/web/src/components/tasks/EditTaskDialog.tsx` - 预览选中的时间敏感度

### Current State

当前任务的时间敏感度 (time_sensitivity) 字段已存在于数据库中：
- `today` - 今天必须完成
- `this_week` - 本周内完成
- `anytime` - 随时可做

但是在 UI 中仅以文本形式显示，缺少视觉区分度。

---

## Acceptance Criteria

### Functional Requirements

1. **创建 TimeSensitivityBadge 组件**
   - 文件路径: `apps/web/src/components/tasks/TimeSensitivityBadge.tsx`
   - 接收 props: `value: 'today' | 'this_week' | 'anytime'`, `variant?: 'default' | 'compact'`
   - 基于 shadcn/ui Badge 组件实现

2. **颜色编码规范**
   - `today` (今天必须): 红色系 `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
   - `this_week` (本周内): 黄色系 `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
   - `anytime` (随时可做): 蓝色系 `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`

3. **显示文本国际化**
   - 使用 react-i18next 进行文本翻译
   - 中文: "今天必须" / "本周内" / "随时可做"
   - 英文: "Today" / "This Week" / "Anytime"

4. **Compact 模式**
   - `variant="compact"` 时仅显示颜色圆点 + 简短文本
   - 适用于空间有限的场景 (如移动端)

### Integration Requirements

5. **集成到 TaskList 组件**
   - 替换现有的文本显示为 TimeSensitivityBadge
   - 保持现有布局不变

6. **集成到 FocusTaskCard 组件**
   - 在卡片顶部显示徽章
   - 使用 default variant

7. **集成到 CreateTaskDialog 和 EditTaskDialog**
   - 在时间敏感度选择器旁边显示预览徽章
   - 当用户选择不同选项时，实时更新徽章预览

### Quality Requirements

8. **无障碍性 (WCAG AA)**
   - 颜色对比度达到 4.5:1
   - 添加 aria-label 描述时间敏感度
   - 支持屏幕阅读器

9. **响应式设计**
   - 在移动端、平板、桌面端都正确显示
   - 徽章大小自适应父容器

10. **测试覆盖**
    - 组件单元测试: 测试所有三种时间敏感度的渲染
    - 国际化测试: 测试中英文切换
    - 可访问性测试: 验证 aria-label 和颜色对比度

---

## Technical Implementation Details

### Component Structure

```typescript
// apps/web/src/components/tasks/TimeSensitivityBadge.tsx
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type TimeSensitivity = 'today' | 'this_week' | 'anytime'

interface TimeSensitivityBadgeProps {
  value: TimeSensitivity
  variant?: 'default' | 'compact'
  className?: string
}

const colorMap: Record<TimeSensitivity, string> = {
  today: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
  this_week: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
  anytime: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
}

export function TimeSensitivityBadge({
  value,
  variant = 'default',
  className,
}: TimeSensitivityBadgeProps) {
  const { t } = useTranslation('tasks')

  const label = t(`timeSensitivity.${value}`)
  const ariaLabel = t(`timeSensitivity.${value}Aria`)

  return (
    <Badge
      variant="outline"
      className={cn(colorMap[value], className)}
      aria-label={ariaLabel}
    >
      {variant === 'compact' ? (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-current" />
          {label}
        </span>
      ) : (
        label
      )}
    </Badge>
  )
}
```

### Translation Keys

Add to `apps/web/src/locales/zh/tasks.json`:
```json
{
  "timeSensitivity": {
    "today": "今天必须",
    "this_week": "本周内",
    "anytime": "随时可做",
    "todayAria": "时间敏感度：今天必须完成",
    "this_weekAria": "时间敏感度：本周内完成",
    "anytimeAria": "时间敏感度：随时可做"
  }
}
```

Add to `apps/web/src/locales/en/tasks.json`:
```json
{
  "timeSensitivity": {
    "today": "Today",
    "this_week": "This Week",
    "anytime": "Anytime",
    "todayAria": "Time sensitivity: must be done today",
    "this_weekAria": "Time sensitivity: this week",
    "anytimeAria": "Time sensitivity: anytime"
  }
}
```

### Integration Example (TaskList.tsx)

```typescript
// Before:
<span className="text-sm text-muted-foreground">
  {task.time_sensitivity}
</span>

// After:
import { TimeSensitivityBadge } from './TimeSensitivityBadge'

<TimeSensitivityBadge value={task.time_sensitivity} />
```

---

## Testing Strategy

### Unit Tests

Create `apps/web/src/components/tasks/__tests__/TimeSensitivityBadge.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimeSensitivityBadge } from '../TimeSensitivityBadge'

describe('TimeSensitivityBadge', () => {
  it('renders today badge with correct color', () => {
    render(<TimeSensitivityBadge value="today" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('renders this_week badge with correct color', () => {
    render(<TimeSensitivityBadge value="this_week" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('renders anytime badge with correct color', () => {
    render(<TimeSensitivityBadge value="anytime" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-blue-100')
  })

  it('renders compact variant correctly', () => {
    render(<TimeSensitivityBadge value="today" variant="compact" />)
    const dot = screen.getByRole('status').querySelector('.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<TimeSensitivityBadge value="today" />)
    expect(screen.getByLabelText(/时间敏感度/)).toBeInTheDocument()
  })
})
```

### Visual Regression Test

- Take screenshots of all three badge variants in both light and dark mode
- Verify color contrast meets WCAG AA standards

---

## Definition of Done

- [x] TimeSensitivityBadge component created
- [x] All three time sensitivity values render correctly with proper colors
- [x] Compact variant implemented
- [x] Internationalization (中/英) implemented
- [x] Integrated into TaskList, FocusTaskCard, CreateTaskDialog, EditTaskDialog
- [x] Existing task display functionality unchanged
- [x] Unit tests written and passing
- [x] Accessibility requirements met (WCAG AA)
- [x] Responsive design works on all screen sizes
- [x] No visual regression in existing components

---

## Risk Mitigation

### Primary Risk
**Breaking existing task display layouts**

**Mitigation:**
- Test in all integration points before merging
- Use CSS classes that don't conflict with existing styles
- Maintain same HTML structure where possible

**Rollback:**
- Revert to text-based display
- Component is isolated, easy to remove

### Secondary Risk
**Color accessibility issues in dark mode**

**Mitigation:**
- Test with accessibility tools (axe, Lighthouse)
- Verify contrast ratios programmatically
- Get user feedback on color choices

---

## Related Stories

- **Story 2.2:** Task Search Functionality (may use badge for filtering)
- **Epic 3:** Current View (already uses time sensitivity logic)

---

## References

- [shadcn/ui Badge Component](https://ui.shadcn.com/docs/components/badge)
- [WCAG AA Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [react-i18next Documentation](https://react.i18next.com/)
- [Existing TaskList Component](apps/web/src/components/tasks/TaskList.tsx)
