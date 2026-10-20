import React from 'react'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Colors, Legend, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Colors, Legend, Tooltip)

export default function ChartJsLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  return (
    <Line
      data={{
        labels: data.map(d => formatMonth(d.date)),
        // `spanGaps` bridges the missing months and the segment style makes those bridges dashed
        datasets: series.map(s => ({
          label: s.label,
          data: data.map(d => d[s.key] ?? null),
          pointRadius: 0,
          spanGaps: true,
          stepped: preset === 'step' ? 'middle' : false,
          borderDash: preset === 'dashed' && s.key === 'ios' ? [6, 4] : [],
          segment: { borderDash: ctx => ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined },
        })),
      }}
      options={{
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y)}` } },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, callback: value => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
