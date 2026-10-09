import React from 'react'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Filler, Colors, Legend, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

import { DataRecord, series, formatMonth, formatValue } from './data'

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Colors, Legend, Tooltip)

export default function ChartJsAreaChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  return (
    <Line
      data={{
        labels: data.map(d => formatMonth(d.date)),
        datasets: series.map((s, i) => ({
          label: s.label,
          data: data.map(d => d[s.key]),
          fill: i === 0 ? 'origin' : '-1', // Fill to the previous dataset to get a stacked area
          pointRadius: 0,
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
          y: { stacked: true, ticks: { color: textColor, callback: value => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
