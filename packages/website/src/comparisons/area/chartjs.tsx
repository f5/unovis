import React from 'react'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Filler, Colors, Legend, Tooltip } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

// The annotation plugin adds its annotation types (box, line, …) to Chart.js only when it's registered, so it can't be a
// per-chart inline plugin. It draws nothing on charts that don't configure annotations
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Colors, Legend, Tooltip, annotationPlugin)

const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function ChartJsAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
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
          stepped: preset === 'step' ? 'middle' : false,
        })),
      }}
      options={{
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y)}` } },
          // A box without `yMin` and `yMax` spans the plot's height
          annotation: {
            annotations: preset === 'annotations'
              ? {
                migration: {
                  type: 'box',
                  xMin: formatMonth(MIGRATION.from),
                  xMax: formatMonth(MIGRATION.to),
                  backgroundColor: 'rgba(128, 128, 128, 0.2)',
                  borderWidth: 0,
                  label: { display: true, content: 'Migration', position: 'start', color: textColor },
                },
                budget: {
                  type: 'line',
                  scaleID: 'y',
                  value: BUDGET,
                  borderColor: 'red',
                  borderDash: [6, 4],
                  label: { display: true, content: `Budget ${formatValue(BUDGET)}`, position: 'end' },
                },
              }
              : {},
          },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { stacked: true, ticks: { color: textColor, callback: value => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
