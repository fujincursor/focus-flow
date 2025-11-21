import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation('common')

  // 空数据处理
  if (data.totalCompleted === 0 && data.totalInterrupted === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
        role="img"
        aria-label={t('statistics.noData')}
      >
        <p>{t('statistics.noData')}</p>
      </div>
    )
  }

  const chartData = [
    {
      name: i18n.language === 'zh' ? '已完成' : 'Completed',
      value: data.totalCompleted,
      color: 'hsl(142, 76%, 36%)', // green-600
    },
    {
      name: i18n.language === 'zh' ? '已中断' : 'Interrupted',
      value: data.totalInterrupted,
      color: 'hsl(0, 84%, 60%)', // red-500
    },
  ]

  // 过滤掉值为 0 的项
  const filteredData = chartData.filter(item => item.value > 0)

  const formatTooltipValue = (value: number) => {
    return i18n.language === 'zh' ? [`${value} 个`, ''] : [`${value}`, '']
  }

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
          formatter={formatTooltipValue}
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
