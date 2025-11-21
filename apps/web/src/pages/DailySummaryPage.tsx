import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle2, Clock, Target, Calendar, Timer } from 'lucide-react'
import { getRecentSummaries, getSummaryWithTasks, getWeekSummary } from '@/services/summaryService'
import { getTodayPomodoroStats } from '@/services/pomodoroService'
import type { DailySummary, DailySummaryView } from '@/types/models'

interface WeekSummary {
  totalCompleted: number
  totalCreated: number
  totalWorkDuration: number
  completionRate: number
  dailySummaries: DailySummary[]
}

export function DailySummaryPage() {
  const { t } = useTranslation('summary')
  const [todaySummary, setTodaySummary] = useState<DailySummaryView | null>(null)
  const [weekSummary, setWeekSummary] = useState<WeekSummary | null>(null)
  const [recentSummaries, setRecentSummaries] = useState<DailySummary[]>([])
  const [pomodoroStats, setPomodoroStats] = useState<{ completedCount: number; totalWorkDuration: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const [todayData, weekData, recentData, pomodoroData] = await Promise.all([
          getSummaryWithTasks(today),
          getWeekSummary(),
          getRecentSummaries(7),
          getTodayPomodoroStats(),
        ])
        setTodaySummary(todayData)
        setWeekSummary(weekData)
        setRecentSummaries(recentData)
        setPomodoroStats(pomodoroData)
      } catch (error) {
        console.error('Error fetching summary data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.title')}</h1>
        <p className="text-muted-foreground">{t('page.subtitle')}</p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('tabs.today')}</TabsTrigger>
          <TabsTrigger value="week">{t('tabs.week')}</TabsTrigger>
          <TabsTrigger value="recent">{t('tabs.recent')}</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {!todaySummary ? (
            <Card>
              <CardContent className="flex h-[300px] items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">{t('today.noData')}</p>
                  <p className="text-sm text-muted-foreground">{t('today.noDataHint')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Today's Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('today.completedTasks')}</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaySummary.completed_tasks_count}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('today.createdTasks', { count: todaySummary.created_tasks_count })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('today.completedPomodoros')}</CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pomodoroStats?.completedCount || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('today.focusDuration')} {pomodoroStats?.totalWorkDuration ? `${Math.floor(pomodoroStats.totalWorkDuration / 60)}${t('common.minutes')}` : `0${t('common.minutes')}`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('today.completionRate')}</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaySummary.completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {todaySummary.completion_rate >= 80 ? t('today.excellentPerformance') : t('today.keepGoing')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('today.workDuration')}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaySummary.total_work_duration > 0
                        ? `${Math.floor(todaySummary.total_work_duration / 60)}h ${todaySummary.total_work_duration % 60}m`
                        : '0h 0m'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('today.estimatedDuration')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Completed Tasks List */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('today.completedTasksList')}</CardTitle>
                  <CardDescription>{t('today.completedTasksDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {todaySummary.completed_tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t('today.noCompletedTasks')}</p>
                  ) : (
                    <div className="space-y-2">
                      {todaySummary.completed_tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <p className="font-medium leading-none">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {task.estimated_duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.estimated_duration}{t('common.minutes')}
                                </span>
                              )}
                              <span>
                                {t('today.completedAt')} {new Date(task.completed_at!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {!weekSummary || weekSummary.dailySummaries.length === 0 ? (
            <Card>
              <CardContent className="flex h-[300px] items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">{t('week.noData')}</p>
                  <p className="text-sm text-muted-foreground">{t('week.noDataHint')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Week Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('week.completed')}</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weekSummary.totalCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('week.created', { count: weekSummary.totalCreated })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('week.completionRate')}</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weekSummary.completionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {weekSummary.completionRate >= 70 ? t('week.excellentWeek') : t('week.keepTrying')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('week.workDuration')}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {weekSummary.totalWorkDuration > 0
                        ? `${Math.floor(weekSummary.totalWorkDuration / 60)}h ${weekSummary.totalWorkDuration % 60}m`
                        : '0h 0m'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('week.estimatedTotal')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('week.dailyAverage')}</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {weekSummary.dailySummaries.length > 0
                        ? Math.round(weekSummary.totalCompleted / weekSummary.dailySummaries.length * 10) / 10
                        : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('week.tasksPerDay')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('week.dailyBreakdown')}</CardTitle>
                  <CardDescription>{t('week.dailyBreakdownDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weekSummary.dailySummaries.map((summary) => (
                      <div
                        key={summary.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {new Date(summary.date).toLocaleDateString('zh-CN', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('week.taskCount', { count: summary.completed_tasks_count })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {summary.total_work_duration > 0
                                ? `${Math.floor(summary.total_work_duration / 60)}h ${summary.total_work_duration % 60}m`
                                : '0h 0m'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{summary.completion_rate}%</p>
                          <p className="text-xs text-muted-foreground">{t('week.completionRateLabel')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentSummaries.length === 0 ? (
            <Card>
              <CardContent className="flex h-[300px] items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">{t('recent.noData')}</p>
                  <p className="text-sm text-muted-foreground">{t('recent.noDataHint')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('recent.title')}</CardTitle>
                <CardDescription>{t('recent.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSummaries.map((summary) => (
                    <div
                      key={summary.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {new Date(summary.date).toLocaleDateString('zh-CN', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('recent.taskCount', { count: summary.completed_tasks_count })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {summary.total_work_duration > 0
                              ? `${Math.floor(summary.total_work_duration / 60)}h ${summary.total_work_duration % 60}m`
                              : '0h 0m'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{summary.completion_rate}%</p>
                        <p className="text-xs text-muted-foreground">{t('recent.completionRate')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
