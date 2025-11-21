# Story 6.2: Chart Components - Brownfield Enhancement

**Story ID:** Story 6.2
**Epic:** Epic 6 - 番茄钟统计与可视化
**Type:** Brownfield Enhancement
**Priority:** P1
**Estimated Effort:** 5-7 hours
**Status:** Ready for Development
**Dependencies:** Story 6.1 (Pomodoro Statistics Service)

---

## User Story

As a **Focus Flow user**,
I want **visual charts to display my pomodoro statistics (trends, duration, completion rate)**,
So that **I can quickly understand my focus patterns and progress at a glance**.

---

## Story Context

###Existing System Integration

- **Integrates with:** recharts library (已安装), shadcn/ui Card components
- **Technology:** recharts v2.10.3 + React + TypeScript
- **Follows pattern:** Reusable component pattern (similar to existing UI components)
- **Touch points:**
  - New directory: `apps/web/src/components/statistics/`
  - Three new chart components
  - Uses data from Story 6.1 (`DailyBreakdown`, `WeeklyStats`)

### Current State

- recharts already installed ([package.json:46](apps/web/package.json#L46))
- DailySummaryPage shows simple stats in Cards (no charts)
- StatisticsPage is empty placeholder
- Statistics service functions ready (Story 6.1)

---

## Acceptance Criteria

### Functional Requirements

1. **CompletionTrendChart component created**
   - Type: LineChart (折线图)
   - Shows: Daily completed pomodoros over time
   - X-axis: Dates
   - Y-axis: Count of completed pomodoros
   - Tooltip: Shows date and count on hover

2. **FocusDurationBarChart component created**
   - Type: BarChart (柱状图)
   - Shows: Daily focus duration in minutes
   - X-axis: Dates
   - Y-axis: Duration in minutes
   - Tooltip: Shows date and duration on hover

3. **CompletionRatePieChart component created**
   - Type: PieChart (饼图)
   - Shows: Completed vs interrupted pomodoros ratio
   - Two segments: "Completed" (green), "Interrupted" (red)
   - Tooltip: Shows percentage and count

4. **Charts are responsive**
   - Use `ResponsiveContainer` from recharts
   - Work on desktop (1200px+) and mobile (375px+)
   - Height: 300px for line/bar charts, 250px for pie chart

5. **Empty state handling**
   - When data array is empty, show friendly message
   - Display: "No data available" centered in chart area
   - No recharts error or crash

### Integration Requirements

6. **Chart styling matches design system**
   - Use Tailwind CSS color variables (`hsl(var(--primary))`)
   - Tooltip background: Card background color
   - Grid lines: Subtle, not distracting
   - Fonts: Same as app (inherit from body)

7. **Components are reusable**
   - Accept data as props (type-safe)
   - Can be used in any page (not tied to StatisticsPage)
   - Optional customization props (height, colors)

8. **Performance optimized**
   - Charts render in < 200ms
   - No lag when switching between charts
   - Use React.memo() if needed

### Quality Requirements

9. **Type safety**
   - All props properly typed
   - Chart data interfaces from Story 6.1
   - No `any` types

10. **Accessibility**
    - Tooltip readable with keyboard navigation
    - Chart has aria-label
    - Color contrast meets WCAG AA standards

11. **Code quality**
    - Components follow existing structure
    - Clean, readable code
    - No console warnings

---

## Technical Implementation Details

### 1. Create Statistics Components Directory

```bash
mkdir -p apps/web/src/components/statistics
```

### 2. CompletionTrendChart Component

**File:** `apps/web/src/components/statistics/CompletionTrendChart.tsx`

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DailyBreakdown } from '@/types/pomodoro'

interface CompletionTrendChartProps {
  data: DailyBreakdown[]
  height?: number
}

/**
 * 完成趋势折线图
 * 显示每日完成的番茄钟数量趋势
 */
export function CompletionTrendChart({ data, height = 300 }: CompletionTrendChartProps) {
  // 空数据处理
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>暂无数据</p>
      </div>
    )
  }

  // 格式化日期显示 (MM-DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString('zh-CN')
          }}
          formatter={(value: number) => [`${value} 个`, '完成番茄钟']}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={() => '完成番茄钟'}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 3. FocusDurationBarChart Component

**File:** `apps/web/src/components/statistics/FocusDurationBarChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DailyBreakdown } from '@/types/pomodoro'

interface FocusDurationBarChartProps {
  data: DailyBreakdown[]
  height?: number
}

/**
 * 专注时长柱状图
 * 显示每日专注时长（分钟）
 */
export function FocusDurationBarChart({ data, height = 300 }: FocusDurationBarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>暂无数据</p>
      </div>
    )
  }

  // 转换数据：秒 → 分钟
  const chartData = data.map(day => ({
    ...day,
    durationMinutes: Math.round(day.totalDuration / 60),
  }))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString('zh-CN')
          }}
          formatter={(value: number) => [`${value} 分钟`, '专注时长']}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={() => '专注时长（分钟）'}
        />
        <Bar
          dataKey="durationMinutes"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### 4. CompletionRatePieChart Component

**File:** `apps/web/src/components/statistics/CompletionRatePieChart.tsx`

```typescript
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { WeeklyStats } from '@/types/pomodoro'

interface CompletionRatePieChartProps {
  data: WeeklyStats
  height?: number
}

/**
 * 完成率饼图
 * 显示完成 vs 中断的番茄钟比例
 */
export function CompletionRatePieChart({ data, height = 250 }: CompletionRatePieChartProps) {
  // 空数据处理
  if (data.totalCompleted === 0 && data.totalInterrupted === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>暂无数据</p>
      </div>
    )
  }

  const chartData = [
    { name: '已完成', value: data.totalCompleted, color: 'hsl(142, 76%, 36%)' }, // green-600
    { name: '已中断', value: data.totalInterrupted, color: 'hsl(0, 84%, 60%)' }, // red-500
  ]

  // 过滤掉值为 0 的项
  const filteredData = chartData.filter(item => item.value > 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number) => [`${value} 个`, '']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

### 5. Create Index File for Easy Imports

**File:** `apps/web/src/components/statistics/index.ts`

```typescript
export { CompletionTrendChart } from './CompletionTrendChart'
export { FocusDurationBarChart } from './FocusDurationBarChart'
export { CompletionRatePieChart } from './CompletionRatePieChart'
```

### 6. Example Usage

```typescript
// Example: Using charts in a page
import { useState, useEffect } from 'react'
import { getWeeklyStats } from '@/services/pomodoroService'
import { CompletionTrendChart, FocusDurationBarChart, CompletionRatePieChart } from '@/components/statistics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StatisticsExample() {
  const [weeklyStats, setWeeklyStats] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const data = await getWeeklyStats()
      setWeeklyStats(data)
    }
    fetchData()
  }, [])

  if (!weeklyStats) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>完成趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <CompletionTrendChart data={weeklyStats.dailyBreakdown} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>专注时长</CardTitle>
        </CardHeader>
        <CardContent>
          <FocusDurationBarChart data={weeklyStats.dailyBreakdown} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>完成率</CardTitle>
        </CardHeader>
        <CardContent>
          <CompletionRatePieChart data={weeklyStats} />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Testing Strategy

### Manual Testing

1. **Test with empty data:**
   ```typescript
   <CompletionTrendChart data={[]} />
   ```
   - Should display "暂无数据"
   - No console errors

2. **Test with sample data:**
   ```typescript
   const sampleData = [
     { date: '2024-01-01', completed: 5, interrupted: 1, totalDuration: 7500, completionRate: 83 },
     { date: '2024-01-02', completed: 3, interrupted: 0, totalDuration: 4500, completionRate: 100 },
     { date: '2024-01-03', completed: 7, interrupted: 2, totalDuration: 10500, completionRate: 78 },
   ]
   <CompletionTrendChart data={sampleData} />
   ```
   - Chart renders correctly
   - X-axis shows dates
   - Y-axis shows counts
   - Line connects all points

3. **Test responsiveness:**
   - Resize browser window from 1920px to 375px
   - Charts should scale proportionally
   - No layout breaks
   - Text remains readable

4. **Test tooltip interaction:**
   - Hover over chart points
   - Tooltip should appear with correct data
   - Move cursor, tooltip should follow
   - Tooltip should not flicker

5. **Test in both light and dark themes:**
   - Switch theme in browser (if theme toggle exists)
   - Charts should be readable in both themes
   - Colors should use CSS variables

### Component Tests

**File:** `apps/web/src/components/statistics/CompletionTrendChart.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletionTrendChart } from './CompletionTrendChart'

describe('CompletionTrendChart', () => {
  it('renders empty state when no data', () => {
    render(<CompletionTrendChart data={[]} />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('renders chart with data', () => {
    const data = [
      { date: '2024-01-01', completed: 5, interrupted: 1, totalDuration: 7500, completionRate: 83 },
    ]
    render(<CompletionTrendChart data={data} />)
    // recharts uses SVG, check for SVG element
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('respects custom height prop', () => {
    const { container } = render(<CompletionTrendChart data={[]} height={400} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.height).toBe('400px')
  })
})
```

Similar tests for `FocusDurationBarChart` and `CompletionRatePieChart`.

### Visual Regression Testing (Optional)

Take screenshots of charts for future comparison:
```bash
# Using Playwright (if E2E tests are set up)
await page.goto('/statistics')
await page.screenshot({ path: 'screenshots/completion-trend-chart.png' })
```

---

## Technical Notes

### Integration Approach

- **Standalone components:** Not tied to specific pages
- **Data-driven:** Components receive data via props
- **Styling:** Use Tailwind CSS variables for theming
- **Performance:** React.memo() not needed yet (charts render quickly)

### Existing Pattern Reference

- Follow component structure of existing UI components (Button, Card, etc.)
- Use TypeScript for prop types
- Export from index file for clean imports

### Key Constraints

- **No external API calls:** Components are pure, data comes from props
- **Responsive by default:** Use ResponsiveContainer
- **Theme-aware:** Use CSS variables (hsl(var(--primary)))
- **Type-safe:** All props properly typed

### recharts Configuration Tips

**Date Formatting:**
- X-axis: Use `tickFormatter` to format dates
- Tooltip: Use `labelFormatter` to format tooltip label

**Colors:**
- Primary line/bar: `hsl(var(--primary))`
- Success (completed): `hsl(142, 76%, 36%)` (green-600)
- Destructive (interrupted): `hsl(0, 84%, 60%)` (red-500)

**Tooltip Styling:**
- Background: `hsl(var(--card))`
- Border: `1px solid hsl(var(--border))`
- Border radius: `6px` (matches Card component)

---

## Risk Mitigation

### Primary Risk

**recharts version conflicts or breaking changes**

**Mitigation:**
1. Use existing version (^2.10.3) already in package.json
2. Follow recharts documentation for v2.x
3. Test charts after any future recharts upgrades
4. Lock version in package.json if needed

**Rollback:**
- Remove chart components
- No impact on existing functionality (charts are new)

### Secondary Risk

**Charts don't render on mobile devices**

**Mitigation:**
1. Use ResponsiveContainer (handles mobile scaling)
2. Test on actual mobile devices (Chrome DevTools mobile emulation)
3. Set minimum height (250px-300px)
4. Simplify tooltips for touch devices

**Rollback:**
- Hide charts on mobile (show table view instead)
- Desktop charts still work

---

## Definition of Done

### Functional Completeness
- [x] CompletionTrendChart component created
- [x] FocusDurationBarChart component created
- [x] CompletionRatePieChart component created
- [x] Index file created for exports
- [x] Empty state handling implemented for all charts

### Quality Assurance
- [x] Charts render correctly with sample data
- [x] Empty state displays correctly
- [x] Charts are responsive (desktop + mobile)
- [x] Tooltips work correctly
- [x] Styling matches design system
- [x] Component tests written and passing
- [x] TypeScript type-check passes
- [x] No console warnings

### Integration Verification
- [x] Charts can be imported from `@/components/statistics`
- [x] Charts accept correct prop types
- [x] Charts work with data from Story 6.1
- [x] Charts work in both light and dark themes (if applicable)

### Documentation
- [x] JSDoc comments added to all components
- [x] Props documented with TypeScript interfaces
- [x] Usage example provided

---

## Related Stories

- **Story 6.1:** Pomodoro Statistics Service (provides data for charts)
- **Story 6.3:** StatisticsPage Integration (uses these chart components)

---

## References

- [Epic 6: 番茄钟统计与可视化](../epics/epic-6-statistics-visualization.md)
- [recharts Documentation](https://recharts.org/en-US/)
- [recharts Examples](https://recharts.org/en-US/examples)
- [Story 6.1: Pomodoro Statistics Service](./story-6.1-pomodoro-statistics-service.md)
- [Tailwind CSS Theming](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
