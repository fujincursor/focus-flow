import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation('common')

  // 空数据处理
  if (data.length === 0) {
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

  // 格式化日期显示 (MM-DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  // Tooltip 格式化器
  const formatTooltipLabel = (value: string) => {
    const date = new Date(value)
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'
    return date.toLocaleDateString(locale)
  }

  const formatTooltipValue = (value: number) => {
    return i18n.language === 'zh'
      ? [`${value} 个`, '完成番茄钟']
      : [`${value}`, 'Completed']
  }

  const legendLabel = i18n.language === 'zh' ? '完成番茄钟' : 'Completed Pomodoros'

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
          labelFormatter={formatTooltipLabel}
          formatter={formatTooltipValue}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={() => legendLabel}
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
