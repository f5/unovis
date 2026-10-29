import React from 'react'
import { Chart, CategoryScale, Legend, Tooltip } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
import { Chart as ReactChart } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, formatHour, formatCell, getBuckets } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

Chart.register(MatrixController, MatrixElement, CategoryScale, Legend, Tooltip)

type Cell = { x: string; y: string; v: number; record: DataRecord }

export default function ChartJsHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const colors = preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS
  const buckets = getBuckets(colors.length)
  const isTransposed = preset === 'transposed'
  const hourLabels = hours.map(formatHour)
  const [xLabels, yLabels] = isTransposed ? [days, hourLabels] : [hourLabels, days]
  // The matrix plugin takes the cell size in pixels, as in its docs: the chart area split into columns and rows, minus the gap
  const gap = preset === 'rounded' ? 5 : 1
  const cells: Cell[] = data
    .filter(d => d.errorRate !== null)
    .map(d => isTransposed
      ? { x: d.day, y: formatHour(d.hour), v: d.errorRate, record: d }
      : { x: formatHour(d.hour), y: d.day, v: d.errorRate, record: d })

  return (
    <ReactChart
      type="matrix"
      data={{
        datasets: [{
          data: cells,
          // The plugin has no color scale: each cell's color comes from a function
          backgroundColor: ctx => colors[buckets.findIndex(b => (ctx.raw as Cell).v < b.max)] ?? colors[colors.length - 1],
          borderRadius: preset === 'rounded' ? 6 : 0,
          width: ({ chart }) => (chart.chartArea?.width ?? 0) / xLabels.length - gap,
          height: ({ chart }) => (chart.chartArea?.height ?? 0) / yLabels.length - gap,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          // The legend lists datasets, so the color buckets are legend items of their own
          legend: {
            labels: {
              color: textColor,
              generateLabels: () => buckets.map((b, i) => ({ text: b.label, fillStyle: colors[i], strokeStyle: colors[i], fontColor: textColor })),
            },
            onClick: () => undefined,
          },
          tooltip: {
            callbacks: {
              title: () => '',
              label: ctx => formatCell((ctx.raw as Cell).record),
            },
          },
        },
        scales: {
          x: { type: 'category', labels: xLabels, offset: true, grid: { display: false }, ticks: { color: textColor } },
          // The matrix plugin reverses the y scale, which would put the first label at the bottom
          y: { type: 'category', labels: yLabels, offset: true, reverse: false, grid: { display: false }, ticks: { color: textColor } },
        },
      }}
    />
  )
}
