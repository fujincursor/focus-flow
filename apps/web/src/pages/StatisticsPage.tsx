import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CompletionTrendChart,
  FocusDurationBarChart,
  CompletionRatePieChart,
} from '@/components/statistics'
import {
  getWeeklyStats,
  getMonthlyStats,
  getCustomRangeStats,
} from '@/services/pomodoroService'
import type { WeeklyStats } from '@/types/pomodoro'

type TimeRange = 'week' | 'month' | 'custom'

export function StatisticsPage() {
  const { t } = useTranslation('statistics')
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 自定义日期范围
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 加载统计数据
  const loadStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let data: WeeklyStats

      if (timeRange === 'week') {
        data = await getWeeklyStats()
      } else if (timeRange === 'month') {
        data = await getMonthlyStats()
      } else {
        // custom
        if (!startDate || !endDate) {
          setError(t('errors.selectDateRange'))
          setIsLoading(false)
          return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (start > end) {
          setError(t('errors.invalidDateRange'))
          setIsLoading(false)
          return
        }

        data = await getCustomRangeStats(start, end)
      }

      setStats(data)
    } catch (err) {
      console.error('Failed to load statistics:', err)
      setError(t('errors.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 当时间范围切换时，自动加载数据
  useEffect(() => {
    if (timeRange !== 'custom') {
      loadStats()
    }
  }, [timeRange])

  // 格式化时长（秒 → 小时分钟）
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return t('metrics.durationFormat', { hours, minutes })
    }
    return t('metrics.durationFormatMinutes', { minutes })
  }

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium text-destructive">{t('errors.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadStats} variant="outline" className="mt-4">
              {t('actions.retry')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* 时间范围选择 */}
      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
        <TabsList>
          <TabsTrigger value="week">{t('timeRange.week')}</TabsTrigger>
          <TabsTrigger value="month">{t('timeRange.month')}</TabsTrigger>
          <TabsTrigger value="custom">{t('timeRange.custom')}</TabsTrigger>
        </TabsList>

        {/* 自定义日期范围输入 */}
        {timeRange === 'custom' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">{t('customRange.title')}</CardTitle>
              <CardDescription>{t('customRange.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">{t('customRange.startDate')}</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">{t('customRange.endDate')}</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={loadStats} className="mt-4" disabled={!startDate || !endDate}>
                <Calendar className="mr-2 h-4 w-4" />
                {t('actions.loadData')}
              </Button>
            </CardContent>
          </Card>
        )}

        <TabsContent value={timeRange} className="space-y-6">
          {!stats ? (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-medium">{t('empty.title')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t('empty.description')}</p>
              </div>
            </div>
          ) : stats.dailyBreakdown.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-medium">{t('empty.noDataTitle')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t('empty.noDataHint')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* 关键指标卡片 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t('metrics.totalCompleted')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCompleted}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t('metrics.totalDuration')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t('metrics.averagePerDay')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averagePerDay}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t('metrics.completionRate')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalCompleted + stats.totalInterrupted > 0
                        ? Math.round(
                            (stats.totalCompleted /
                              (stats.totalCompleted + stats.totalInterrupted)) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 图表区域 */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('charts.completionTrend')}</CardTitle>
                    <CardDescription>{t('charts.completionTrendDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CompletionTrendChart data={stats.dailyBreakdown} height={300} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('charts.focusDuration')}</CardTitle>
                    <CardDescription>{t('charts.focusDurationDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FocusDurationBarChart data={stats.dailyBreakdown} height={300} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('charts.completionRate')}</CardTitle>
                  <CardDescription>{t('charts.completionRateDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CompletionRatePieChart data={stats} height={250} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
