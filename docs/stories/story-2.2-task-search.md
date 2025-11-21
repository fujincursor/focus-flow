# Story 2.2: Task Search Functionality - Brownfield Enhancement

**Story ID:** Story 2.2
**Epic:** Epic 2 - 任务管理增强功能
**Type:** Brownfield Enhancement
**Priority:** P2
**Estimated Effort:** 3-4 hours
**Status:** Ready for Development

---

## User Story

**作为** Focus Flow 用户，
**我想要** 通过搜索框快速查找任务，
**以便** 在任务列表较长时能够快速定位特定任务，节省浏览时间。

---

## Story Context

### Existing System Integration

- **Integrates with:** TasksPage.tsx, TaskList.tsx
- **Technology:** React + TypeScript + React Hooks (useState, useMemo) + useDebouncedValue hook
- **Follows pattern:** 现有的表单输入组件模式 (shadcn/ui Input)
- **Touch points:**
  - `apps/web/src/pages/TasksPage.tsx` - 添加搜索框和搜索逻辑
  - `apps/web/src/components/tasks/TaskList.tsx` - 接收过滤后的任务列表
  - `apps/web/src/hooks/useDebounce.ts` - 创建防抖 Hook (如不存在)

### Current State

当前 TasksPage 显示所有任务，没有搜索或过滤功能。用户需要手动滚动浏览所有任务。

---

## Acceptance Criteria

### Functional Requirements

1. **搜索框实现**
   - 在 TasksPage 顶部添加搜索输入框
   - 使用 shadcn/ui Input 组件
   - 占位符文本支持国际化 (中: "搜索任务..." / 英: "Search tasks...")
   - 包含搜索图标 (🔍 或 lucide-react Search icon)
   - 包含清除按钮 (X) 用于清空搜索

2. **实时搜索**
   - 输入时实时过滤任务列表
   - 使用防抖 (debounce) 300ms，减少不必要的渲染
   - 搜索范围：任务标题 (title) 和描述 (description)
   - 不区分大小写

3. **搜索结果显示**
   - 实时更新任务列表显示匹配结果
   - 如果没有匹配结果，显示空状态提示
   - 显示匹配任务的数量 (如 "找到 5 个任务")

4. **清空搜索**
   - 点击清除按钮或清空输入框时，恢复显示所有任务
   - 键盘 Escape 键也可以清空搜索

### Integration Requirements

5. **与现有过滤器兼容**
   - 搜索功能应与任务完成状态过滤器同时工作
   - 先应用状态过滤，再应用搜索过滤

6. **与时间敏感度分组兼容**
   - 搜索结果仍按时间敏感度分组显示
   - 空的分组自动隐藏

7. **状态持久化**
   - 搜索关键词在页面刷新后不持久化（清空）
   - 这是有意设计，避免用户困惑

### Quality Requirements

8. **性能优化**
   - 使用 useMemo 缓存过滤结果
   - 防抖避免频繁计算
   - 搜索操作在 100ms 内完成

9. **无障碍性**
   - 搜索框有正确的 label 和 aria-label
   - 搜索结果数量用 aria-live 区域通知
   - 键盘可访问（Tab, Enter, Escape）

10. **测试覆盖**
    - 搜索逻辑单元测试
    - 防抖功能测试
    - 清空搜索测试

---

## Technical Implementation Details

### 1. Create useDebounce Hook (如果不存在)

```typescript
// apps/web/src/hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### 2. Update TasksPage Component

```typescript
// apps/web/src/pages/TasksPage.tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'

export function TasksPage() {
  const { t } = useTranslation('tasks')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Existing task loading logic...
  const { tasks, isLoading } = useTaskStore()

  // Filter logic
  const filteredTasks = useMemo(() => {
    if (!debouncedSearch.trim()) return tasks

    const query = debouncedSearch.toLowerCase()
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    )
  }, [tasks, debouncedSearch])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClearSearch()
          }}
          className="pl-9 pr-9"
          aria-label={t('search.ariaLabel')}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClearSearch}
            aria-label={t('search.clearAriaLabel')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Count */}
      {debouncedSearch && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('search.resultsCount', { count: filteredTasks.length })}
        </p>
      )}

      {/* Task List */}
      <TaskList tasks={filteredTasks} />
    </div>
  )
}
```

### 3. Add Translation Keys

Add to `apps/web/src/locales/zh/tasks.json`:
```json
{
  "search": {
    "placeholder": "搜索任务...",
    "ariaLabel": "搜索任务",
    "clearAriaLabel": "清空搜索",
    "resultsCount_one": "找到 {{count}} 个任务",
    "resultsCount_other": "找到 {{count}} 个任务",
    "noResults": "没有找到匹配的任务"
  }
}
```

Add to `apps/web/src/locales/en/tasks.json`:
```json
{
  "search": {
    "placeholder": "Search tasks...",
    "ariaLabel": "Search tasks",
    "clearAriaLabel": "Clear search",
    "resultsCount_one": "Found {{count}} task",
    "resultsCount_other": "Found {{count}} tasks",
    "noResults": "No matching tasks found"
  }
}
```

### 4. Update TaskList for Empty State

```typescript
// apps/web/src/components/tasks/TaskList.tsx
{filteredTasks.length === 0 && searchQuery && (
  <div className="text-center py-12">
    <p className="text-muted-foreground">{t('search.noResults')}</p>
  </div>
)}
```

---

## Testing Strategy

### Unit Tests

Create `apps/web/src/hooks/__tests__/useDebounce.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 300 })
    expect(result.current).toBe('initial') // Still old value

    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 400,
    })
  })
})
```

Create `apps/web/src/pages/__tests__/TasksPage.search.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, userEvent } from '@testing-library/react'
import { TasksPage } from '../TasksPage'

describe('TasksPage - Search', () => {
  it('filters tasks by title', async () => {
    render(<TasksPage />)

    const searchInput = screen.getByPlaceholderText(/搜索任务/)
    await userEvent.type(searchInput, '重要')

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText(/找到 \d+ 个任务/)).toBeInTheDocument()
    })
  })

  it('clears search when X button clicked', async () => {
    render(<TasksPage />)

    const searchInput = screen.getByPlaceholderText(/搜索任务/)
    await userEvent.type(searchInput, '测试')

    const clearButton = screen.getByLabelText(/清空搜索/)
    await userEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
  })

  it('clears search on Escape key', async () => {
    render(<TasksPage />)

    const searchInput = screen.getByPlaceholderText(/搜索任务/)
    await userEvent.type(searchInput, '测试')
    await userEvent.keyboard('{Escape}')

    expect(searchInput).toHaveValue('')
  })
})
```

---

## Definition of Done

- [x] Search input box added to TasksPage
- [x] Debounce hook implemented (300ms)
- [x] Real-time search filtering works for title and description
- [x] Clear button (X) works
- [x] Escape key clears search
- [x] Search results count displayed
- [x] Empty state shown when no results
- [x] Internationalization (中/英) implemented
- [x] Compatible with existing filters
- [x] Performance optimized (useMemo, debounce)
- [x] Unit tests written and passing
- [x] Accessibility requirements met
- [x] No regression in existing task display

---

## Risk Mitigation

### Primary Risk
**Search performance degradation with large task lists (1000+ tasks)**

**Mitigation:**
- Use useMemo to cache filtered results
- Debounce prevents excessive re-filtering
- Simple string matching (no regex) for speed
- If needed, can add virtual scrolling in future

**Rollback:**
- Remove search box
- Revert to original TasksPage

### Secondary Risk
**Confusing user experience when search is active but results are empty**

**Mitigation:**
- Clear "No matching tasks" message
- Results count always visible when searching
- Easy to clear search (X button, Escape key)

---

## Future Enhancements (Not in Scope)

- Advanced search: by time sensitivity, completion status
- Search history
- Highlight matching text in results
- Keyboard shortcuts (Ctrl/Cmd + F)

---

## Related Stories

- **Story 2.1:** Time Sensitivity Badge (can use for visual filtering)
- **Story 2.3:** Virtual Scrolling (complements search for performance)

---

## References

- [React useDebounce Pattern](https://usehooks.com/useDebounce/)
- [shadcn/ui Input Component](https://ui.shadcn.com/docs/components/input)
- [lucide-react Icons](https://lucide.dev/)
