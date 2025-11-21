# Epic 6: 番茄钟统计与可视化 - Brownfield Enhancement

**Epic ID:** Epic 6
**Type:** Brownfield Enhancement
**Priority:** P1 (V1.2 Feature)
**Estimated Effort:** 2-3 Stories
**Status:** Ready for Planning

---

## Epic Goal

为 Focus Flow 添加番茄钟统计和可视化功能,在统计页面展示历史趋势图表,帮助用户直观了解长期进度和专注习惯,提升用户体验和产品价值。

---

## Existing System Context

### Current Relevant Functionality

- **DailySummaryPage 已有番茄钟统计**
  - 显示今日完成番茄钟数量 ([DailySummaryPage.tsx:100-109](apps/web/src/pages/DailySummaryPage.tsx#L100-L109))
  - 显示今日专注时长(分钟) ([DailySummaryPage.tsx:106](apps/web/src/pages/DailySummaryPage.tsx#L106))
  - 使用 `getTodayPomodoroStats()` 获取今日数据

- **pomodoroService 提供数据查询能力**
  - `getTodaySessions()` - 获取今日所有会话 ([pomodoroService.ts:89-106](apps/web/src/services/pomodoroService.ts#L89-L106))
  - `getSessionsByDateRange()` - 按日期范围查询 ([pomodoroService.ts:111-128](apps/web/src/services/pomodoroService.ts#L111-L128))
  - `getTodayPomodoroStats()` - 计算今日统计 ([pomodoroService.ts:133-152](apps/web/src/services/pomodoroService.ts#L133-L152))

- **StatisticsPage 当前为空白页面**
  - 仅显示 "暂无统计数据" 占位符 ([StatisticsPage.tsx:1-24](apps/web/src/pages/StatisticsPage.tsx))
  - 已有基础布局框架(标题、描述、占位区域)
  - **完美的空白画布** - 无需重构现有功能

### Technology Stack

- **Frontend:** React 18 + TypeScript
- **Chart Library:** recharts (已安装,版本 ^2.10.3) ([package.json:46](apps/web/package.json#L46))
- **UI Components:** shadcn/ui (Card, Tabs, Select 等)
- **Data Service:** pomodoroService (已完善)
- **Database:** Supabase (pomodoro_sessions 表已存在)

### Database Schema

```typescript
// pomodoro_sessions 表结构 (database.types.ts:86-97)
{
  id: string
  user_id: string
  task_id: string | null
  session_type: 'work' | 'rest'
  start_time: string
  end_time: string | null
  duration: number        // 秒数
  completed: boolean      // 是否完成
  created_at: string
}
```

### Integration Points

1. **StatisticsPage** - 主要开发区域(当前为空页面)
2. **pomodoroService** - 新增统计数据聚合函数
3. **recharts** - 使用现有依赖创建图表组件

---

## Enhancement Details

### What's Being Added/Changed

**核心功能:**

1. **数据聚合服务**
   - 扩展 `pomodoroService.ts`,新增统计聚合函数
   - `getWeeklyStats()` - 获取周统计数据
   - `getMonthlyStats()` - 获取月统计数据
   - `getDailyTrend()` - 获取每日趋势数据

2. **可视化图表组件**
   - **完成趋势图** (LineChart) - 显示每日完成番茄钟数量趋势
   - **专注时长统计** (BarChart) - 显示每日专注时长(分钟)
   - **完成率饼图** (PieChart) - 显示完成 vs 中断的番茄钟比例
   - **时间分布热力图** (可选) - 显示一天中的专注时段分布

3. **统计页面重构**
   - 使用 Tabs 组件切换时间维度(周 / 月 / 自定义范围)
   - 顶部显示关键指标 Cards (总番茄钟数、总专注时长、平均每日完成)
   - 图表区域展示可视化数据
   - 日期范围选择器(使用现有 date-fns 依赖)

4. **数据过滤与交互**
   - 按时间范围筛选(本周、本月、最近30天、自定义)
   - 图表交互(hover 显示详细数据)
   - 支持只看"工作番茄钟"或包含"休息时间"

### How It Integrates

```typescript
// 新增: pomodoroService 统计函数
// apps/web/src/services/pomodoroService.ts

export interface WeeklyStats {
  totalCompleted: number
  totalDuration: number
  dailyBreakdown: Array<{
    date: string
    completed: number
    duration: number
    completionRate: number
  }>
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const sessions = await getSessionsByDateRange(startOfWeek, new Date())

  // 聚合逻辑...
  return aggregatedStats
}
```

```typescript
// 使用示例: StatisticsPage
import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { getWeeklyStats, getMonthlyStats } from '@/services/pomodoroService'

export function StatisticsPage() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  useEffect(() => {
    async function fetchStats() {
      if (timeRange === 'week') {
        const data = await getWeeklyStats()
        setWeeklyStats(data)
      } else {
        const data = await getMonthlyStats()
        setMonthlyStats(data)
      }
    }
    fetchStats()
  }, [timeRange])

  return (
    <div className="space-y-6">
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="week">本周</TabsTrigger>
          <TabsTrigger value="month">本月</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 关键指标 Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>总完成番茄钟</CardHeader>
          <CardContent>{weeklyStats?.totalCompleted}</CardContent>
        </Card>
        {/* More cards... */}
      </div>

      {/* 趋势图表 */}
      <Card>
        <CardHeader>完成趋势</CardHeader>
        <CardContent>
          <LineChart data={weeklyStats?.dailyBreakdown}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="completed" stroke="#8884d8" />
          </LineChart>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Success Criteria

1. ✅ 用户可查看周/月番茄钟统计和趋势
2. ✅ 图表清晰展示数据(完成趋势、专注时长、完成率)
3. ✅ 支持时间范围切换(本周、本月、自定义)
4. ✅ 图表交互流畅(hover 显示详细数据)
5. ✅ 数据聚合性能良好(< 1s 响应时间)
6. ✅ 现有 DailySummaryPage 功能不受影响
7. ✅ 使用现有 recharts 依赖(无需安装新库)

---

## Stories

### Story 6.1: 番茄钟统计数据服务

**Goal:** 扩展 pomodoroService,添加数据聚合函数,支持周/月统计查询

**Tasks:**
- 在 `pomodoroService.ts` 新增 `getWeeklyStats()` 函数
- 新增 `getMonthlyStats()` 函数
- 新增 `getCustomRangeStats(startDate, endDate)` 函数
- 定义 TypeScript 接口: `WeeklyStats`, `MonthlyStats`, `DailyBreakdown`
- 实现数据聚合逻辑(按日分组、计算完成率)
- 处理空数据情况(无番茄钟会话时返回默认值)

**Acceptance Criteria:**
- [x] `getWeeklyStats()` 返回最近7天的统计数据
- [x] `getMonthlyStats()` 返回最近30天的统计数据
- [x] 每日数据包含: 日期、完成数、时长、完成率
- [x] 性能优化: 查询时间 < 500ms
- [x] 单元测试覆盖所有聚合函数

---

### Story 6.2: 图表组件和可视化

**Goal:** 使用 recharts 创建可复用的番茄钟图表组件

**Scope:**
- CompletionTrendChart (完成趋势折线图)
- FocusDurationBarChart (专注时长柱状图)
- CompletionRatePieChart (完成率饼图)

**Tasks:**
- 创建 `apps/web/src/components/statistics/` 目录
- 实现 `CompletionTrendChart.tsx` (LineChart)
- 实现 `FocusDurationBarChart.tsx` (BarChart)
- 实现 `CompletionRatePieChart.tsx` (PieChart)
- 配置 recharts 主题(使用 Tailwind CSS 配色)
- 添加 Tooltip 交互(显示详细数据)
- 处理空数据状态(显示友好提示)

**Acceptance Criteria:**
- [x] 三个图表组件正常渲染
- [x] 图表样式符合 Focus Flow 设计系统
- [x] Tooltip 显示准确的日期和数值
- [x] 响应式设计(移动端友好)
- [x] 空数据时显示 "暂无数据" 提示

---

### Story 6.3: StatisticsPage 集成与交互

**Goal:** 重构 StatisticsPage,集成图表组件和数据服务,添加时间范围筛选功能

**Scope:**
- StatisticsPage 完整实现
- 时间范围切换(本周、本月、自定义)
- 关键指标 Cards
- 图表布局和交互

**Tasks:**
- 重构 `StatisticsPage.tsx`,移除占位符
- 使用 Tabs 组件实现时间范围切换
- 添加关键指标 Cards (总番茄钟、总时长、日均完成)
- 集成三个图表组件
- 添加日期范围选择器(使用 date-fns)
- 添加加载状态(Loader2)和错误处理
- 添加"只看工作番茄钟"过滤开关(使用 Switch 组件)

**Acceptance Criteria:**
- [x] StatisticsPage 显示完整的统计数据和图表
- [x] 时间范围切换正常工作(周/月/自定义)
- [x] 关键指标 Cards 显示准确数据
- [x] 图表加载流畅(有 loading 状态)
- [x] 过滤开关可切换"只看工作番茄钟"
- [x] 空数据时显示友好提示
- [x] 测试覆盖所有交互功能

---

## Compatibility Requirements

### No Breaking Changes

- ✅ **Existing APIs remain unchanged** - 只新增函数,不修改现有 `pomodoroService` 函数签名
- ✅ **Database schema unchanged** - 使用现有 `pomodoro_sessions` 表,无需迁移
- ✅ **DailySummaryPage unchanged** - 不修改现有每日总结功能
- ✅ **UI patterns consistent** - 使用现有 shadcn/ui 组件(Card, Tabs, Select)
- ✅ **Performance impact minimal** - recharts 懒加载,首屏加载无影响

### Backward Compatibility

- 用户已有的番茄钟会话数据可正常查询和展示
- 如果用户没有历史数据,显示空状态提示(而非错误)
- 现有页面(CurrentViewPage, DailySummaryPage)不受影响

---

## Risk Mitigation

### Primary Risk

**大量历史数据导致查询性能下降**

**Mitigation:**
1. 默认只查询最近 30 天数据(可通过自定义范围扩展)
2. 数据聚合在客户端完成(减少数据库查询复杂度)
3. 使用 `useMemo` 缓存聚合结果(避免重复计算)
4. 添加数据量限制(超过 1000 条会话时分页查询)

### Secondary Risk

**图表库(recharts)学习曲线导致开发延期**

**Mitigation:**
1. recharts 已是项目依赖,团队成员有使用经验
2. 使用简单的图表类型(Line, Bar, Pie),避免复杂配置
3. 参考 recharts 官方示例快速实现
4. 如遇问题,可降级为简单的表格展示(不影响核心功能)

### Rollback Plan

如果出现严重问题:
1. StatisticsPage 可快速回退到占位符状态(无数据展示)
2. 新增的 service 函数不影响现有功能,可直接删除
3. 最坏情况: 在 StatisticsPage 添加 "功能维护中" 提示

---

## Definition of Done

### Feature Complete

- [x] pomodoroService 新增周/月统计函数
- [x] 三个图表组件(Trend, Duration, Rate)实现完成
- [x] StatisticsPage 显示完整的统计和图表
- [x] 时间范围切换和过滤功能正常工作
- [x] 空数据和加载状态处理完善

### Quality Checks

- [x] 所有图表显示准确数据
- [x] 图表样式符合设计系统
- [x] 单元测试覆盖数据聚合逻辑
- [x] E2E 测试验证页面交互
- [x] 性能测试: 查询 + 渲染 < 1.5s

### No Regression

- [x] DailySummaryPage 功能正常(番茄钟统计显示正确)
- [x] CurrentViewPage 功能正常(番茄钟计时器工作正常)
- [x] 现有 pomodoroService 函数不受影响
- [x] 所有现有测试通过

---

## Technical Notes

### Recommended Chart Configuration

```typescript
// apps/web/src/components/statistics/CompletionTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CompletionTrendChartProps {
  data: Array<{ date: string; completed: number }>
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
          formatter={(value: number) => [`${value} 个`, '完成番茄钟']}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Data Aggregation Example

```typescript
// apps/web/src/services/pomodoroService.ts

export interface DailyBreakdown {
  date: string
  completed: number
  interrupted: number
  totalDuration: number
  completionRate: number
}

export interface WeeklyStats {
  totalCompleted: number
  totalInterrupted: number
  totalDuration: number
  averagePerDay: number
  dailyBreakdown: DailyBreakdown[]
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const sessions = await getSessionsByDateRange(startDate, new Date())

  // 按日期分组
  const dailyMap = new Map<string, PomodoroSession[]>()
  sessions.forEach(session => {
    const date = session.created_at.split('T')[0]
    if (!dailyMap.has(date)) {
      dailyMap.set(date, [])
    }
    dailyMap.get(date)!.push(session)
  })

  // 聚合每日数据
  const dailyBreakdown: DailyBreakdown[] = Array.from(dailyMap.entries()).map(([date, daySessions]) => {
    const workSessions = daySessions.filter(s => s.session_type === 'work')
    const completed = workSessions.filter(s => s.completed).length
    const interrupted = workSessions.filter(s => !s.completed).length
    const totalDuration = workSessions
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.duration, 0)

    return {
      date,
      completed,
      interrupted,
      totalDuration,
      completionRate: workSessions.length > 0
        ? Math.round((completed / workSessions.length) * 100)
        : 0
    }
  })

  // 计算总计
  const totalCompleted = dailyBreakdown.reduce((sum, day) => sum + day.completed, 0)
  const totalInterrupted = dailyBreakdown.reduce((sum, day) => sum + day.interrupted, 0)
  const totalDuration = dailyBreakdown.reduce((sum, day) => sum + day.totalDuration, 0)

  return {
    totalCompleted,
    totalInterrupted,
    totalDuration,
    averagePerDay: dailyBreakdown.length > 0
      ? Math.round((totalCompleted / dailyBreakdown.length) * 10) / 10
      : 0,
    dailyBreakdown: dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date))
  }
}
```

### Empty State Handling

```typescript
// StatisticsPage 空数据处理
{weeklyStats?.dailyBreakdown.length === 0 ? (
  <Card>
    <CardContent className="flex h-[300px] items-center justify-center">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">暂无统计数据</h3>
        <p className="text-sm text-muted-foreground">
          完成至少一个番茄钟后,这里会展示您的趋势图表
        </p>
      </div>
    </CardContent>
  </Card>
) : (
  <CompletionTrendChart data={weeklyStats.dailyBreakdown} />
)}
```

---

## Dependencies

**已有依赖(无需安装):**
- **recharts**: ^2.10.3 (图表库)
- **date-fns**: ^3.6.0 (日期处理)
- **@radix-ui/react-tabs**: ^1.1.13 (时间范围切换)
- **@radix-ui/react-select**: ^2.2.6 (过滤选择器)

**新增依赖:** 无

---

## Success Metrics

### User Experience

- **图表加载时间**: < 1s (包含数据查询 + 渲染)
- **数据准确性**: 100% (与 DailySummaryPage 数据一致)
- **图表交互响应**: < 100ms (hover 显示 tooltip)

### Technical Quality

- **测试覆盖率**: ≥ 85% (数据服务和组件)
- **代码复用**: 图表组件可在其他页面使用
- **性能基准**: 查询 1000 条会话 < 500ms

---

## Future Enhancements (Out of Scope)

**Not included in this epic:**

- 导出统计数据为 PDF/CSV
- 番茄钟专注时段热力图(一天24小时分布)
- 任务维度统计(不同任务的番茄钟完成情况)
- 跨月、跨年的长期趋势分析
- 与其他用户的对比(排行榜功能)

这些功能可在 V1.3+ 考虑。

---

## Story Manager Handoff

**请开发详细的用户故事,关键考虑:**

- 这是对现有 React + TypeScript 应用的增强
- 集成点: StatisticsPage (主要开发区域,当前为空), pomodoroService (扩展函数)
- 现有模式: 使用 recharts 图表库(已安装), shadcn/ui 组件, Supabase 数据查询
- 关键兼容性要求:
  - 不破坏 DailySummaryPage 现有功能
  - 使用现有 `pomodoro_sessions` 表(无需数据库迁移)
  - 图表组件可复用(其他页面可能需要)
  - 性能优化(处理大量历史数据)
- 每个 story 必须包含测试用例(数据聚合逻辑和图表渲染)

史诗目标: 提供直观的番茄钟统计和趋势可视化,帮助用户了解长期进度和专注习惯。
