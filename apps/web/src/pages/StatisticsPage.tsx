export function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据统计</h1>
        <p className="text-muted-foreground">查看您的长期进度趋势</p>
      </div>

      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">暂无统计数据</h3>
          <p className="mt-2 text-sm text-muted-foreground">完成更多任务后，这里会展示您的趋势图表</p>
        </div>
      </div>
    </div>
  )
}
