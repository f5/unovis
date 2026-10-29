import React from 'react'
import { Chart, CategoryScale, LinearScale, Colors, Tooltip } from 'chart.js'
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot'
import { Chart as ReactChart } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, formatMs } from './data'

// Chart.js has no box plot type: it comes from the most popular plugin, @sgratzl/chartjs-chart-boxplot
Chart.register(BoxPlotController, BoxAndWiskers, CategoryScale, LinearScale, Colors, Tooltip)

// The Colors plugin colors datasets, not the items in one, so the "Colors" preset takes its palette
const palette = ['#36a2eb', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#9966ff']
const transparent = (hex: string): string => `${hex}80`

type Stats = { min: number; q1: number; median: number; q3: number; max: number; whiskerMin: number; whiskerMax: number }

export default function ChartJsBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const colors = preset === 'colors' ? { borderColor: palette, backgroundColor: palette.map(transparent), outlierBackgroundColor: palette } : {}
  const minMax = preset === 'min-max'

  return (
    <ReactChart
      type="boxplot"
      data={{
        labels: data.map(d => d.endpoint),
        // The plugin computes the quartiles from the raw samples; `coef: 0` puts the whiskers at the min and max
        datasets: [{ label: 'Response time', data: data.map(d => d.samples), coef: minMax ? 0 : 1.5, ...colors }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const s = ctx.parsed as unknown as Stats
                return [
                  `${minMax ? 'Max' : 'Upper whisker'}: ${formatMs(s.whiskerMax)}`,
                  `Q3: ${formatMs(s.q3)}`,
                  `Median: ${formatMs(s.median)}`,
                  `Q1: ${formatMs(s.q1)}`,
                  `${minMax ? 'Min' : 'Lower whisker'}: ${formatMs(s.whiskerMin)}`,
                ]
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, callback: (value: number | string) => formatMs(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
