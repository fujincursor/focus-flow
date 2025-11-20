import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, CheckCircle2, Clock, Target } from 'lucide-react'
import { getRecentSummaries, getSummaryWithTasks } from '@/services/summaryService'
import type { DailySummary, DailySummaryView } from '@/types/models'

export function DailySummaryPage() {
  const [todaySummary, setTodaySummary] = useState<DailySummaryView | null>(null)
  const [recentSummaries, setRecentSummaries] = useState<DailySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const [todayData, recentData] = await Promise.all([
          getSummaryWithTasks(today),
          getRecentSummaries(7),
        ])
        setTodaySummary(todayData)
        setRecentSummaries(recentData)
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
        <h1 className="text-3xl font-bold tracking-tight">每日总结</h1>
        <p className="text-muted-foreground">回顾您的每日完成情况</p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">今日总结</TabsTrigger>
          <TabsTrigger value="recent">最近7天</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {!todaySummary ? (
            <Card>
              <CardContent className="flex h-[300px] items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">今日暂无数据</p>
                  <p className="text-sm text-muted-foreground">完成任务后，这里会显示您的今日统计</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Today's Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">已完成任务</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaySummary.completed_tasks_count}</div>
                    <p className="text-xs text-muted-foreground">
                      共创建 {todaySummary.created_tasks_count} 个任务
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">完成率</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaySummary.completion_rate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {todaySummary.completion_rate >= 80 ? '表现优秀！' : '继续加油！'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">工作时长</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaySummary.total_work_duration > 0
                        ? `${Math.floor(todaySummary.total_work_duration / 60)}h ${todaySummary.total_work_duration % 60}m`
                        : '0h 0m'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      预计时长
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">平均时长</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todaySummary.completed_tasks_count > 0 && todaySummary.total_work_duration > 0
                        ? Math.round(todaySummary.total_work_duration / todaySummary.completed_tasks_count)
                        : 0}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      每任务
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Completed Tasks List */}
              <Card>
                <CardHeader>
                  <CardTitle>已完成的任务</CardTitle>
                  <CardDescription>今天完成的所有任务</CardDescription>
                </CardHeader>
                <CardContent>
                  {todaySummary.completed_tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">暂无完成的任务</p>
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
                                  {task.estimated_duration}分钟
                                </span>
                              )}
                              <span>
                                完成于 {new Date(task.completed_at!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
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

        <TabsContent value="recent" className="space-y-4">
          {recentSummaries.length === 0 ? (
            <Card>
              <CardContent className="flex h-[300px] items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">暂无历史数据</p>
                  <p className="text-sm text-muted-foreground">完成任务后，这里会显示您的历史统计</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>最近7天统计</CardTitle>
                <CardDescription>您的每日完成情况一览</CardDescription>
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
                            {summary.completed_tasks_count} 个任务
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
                        <p className="text-xs text-muted-foreground">完成率</p>
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
