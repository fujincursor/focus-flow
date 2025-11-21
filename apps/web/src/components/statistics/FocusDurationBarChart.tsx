import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation('common')

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

  // 转换数据：秒 → 分钟
  const chartData = data.map(day => ({
    ...day,
    durationMinutes: Math.round(day.totalDuration / 60),
  }))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  }

  const formatTooltipLabel = (value: string) => {
    const date = new Date(value)
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'
    return date.toLocaleDateString(locale)
  }

  const formatTooltipValue = (value: number) => {
    return i18n.language === 'zh'
      ? [`${value} 分钟`, '专注时长']
      : [`${value} min`, 'Focus Duration']
  }

  const legendLabel = i18n.language === 'zh' ? '专注时长（分钟）' : 'Focus Duration (min)'

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
          labelFormatter={formatTooltipLabel}
          formatter={formatTooltipValue}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={() => legendLabel}
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
