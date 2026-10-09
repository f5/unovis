import React from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'

import { DataRecord, series, formatValue } from './data'

Chart.register(CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip)

export default function ChartJsGroupedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  return (
    <Bar
      data={{
        labels: data.map(d => d.region),
        datasets: series.map(s => ({ label: s.label, data: data.map(d => d[s.key]) })),
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
