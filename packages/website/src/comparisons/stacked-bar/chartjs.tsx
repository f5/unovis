import React from 'react'
import { Chart, CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-annotation'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

// The annotation plugin adds its annotation types to Chart.js only when it's registered, so it can't be passed to one chart.
// It draws nothing on a chart that sets no annotations
Chart.register(CategoryScale, LinearScale, BarElement, Colors, Legend, Tooltip, annotationPlugin)

const CAPACITY = 400

export default function ChartJsStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  // `indexAxis: 'y'` turns the bars horizontal: the months move to the y scale and the values to the x scale
  const isHorizontal = preset === 'horizontal'
  const monthScale = { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } }
  const valueScale = { stacked: true, ticks: { color: textColor, callback: (value: string | number) => formatValue(+value) }, grid: { color: gridColor } }

  return (
    <Bar
      data={{
        labels: data.map(d => d.month),
        datasets: series.map(s => ({ label: s.label, data: data.map(d => d[s.key]) })),
      }}
      options={{
        maintainAspectRatio: false,
        indexAxis: isHorizontal ? 'y' : 'x',
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(isHorizontal ? ctx.parsed.x : ctx.parsed.y)}` } },
          annotation: {
            annotations: preset === 'capacity'
              ? [{
                type: 'line',
                scaleID: 'y',
                value: CAPACITY,
                borderColor: textColor,
                borderWidth: 1,
                borderDash: [6, 4],
                label: { display: true, content: `Capacity ${formatValue(CAPACITY)}`, position: 'end', backgroundColor: 'transparent', color: textColor, yAdjust: -10 },
              }]
              : [],
          },
        },
        scales: {
          x: isHorizontal ? valueScale : monthScale,
          y: isHorizontal ? monthScale : valueScale,
        },
      }}
    />
  )
}
