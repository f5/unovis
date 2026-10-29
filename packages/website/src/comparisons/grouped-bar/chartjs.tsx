import React from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

Chart.register(CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip)

export default function ChartJsGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  // `indexAxis: 'y'` puts the categories on the y axis; the scales and the tooltip's value then come from the other axis
  const indexAxis = preset === 'horizontal' ? 'y' : 'x'
  const valueAxis = indexAxis === 'x' ? 'y' : 'x'
  return (
    <Bar
      data={{
        labels: data.map(d => d.region),
        datasets: series.map(s => ({ label: s.label, data: data.map(d => d[s.key]) })),
      }}
      options={{
        indexAxis,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false, axis: indexAxis },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(ctx.parsed[valueAxis])}` } },
        },
        scales: {
          [indexAxis]: { ticks: { color: textColor }, grid: { color: gridColor } },
          [valueAxis]: { ticks: { color: textColor, callback: (value: number | string) => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
