import React from 'react'
import { Chart, LinearScale, PointElement, Colors, Legend, Tooltip } from 'chart.js'
import { Bubble } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

Chart.register(LinearScale, PointElement, Colors, Legend, Tooltip)

// Chart.js expects the bubble radius in pixels, so we scale the body mass ourselves
const radius = (bodyMass: number): number => 2 + (bodyMass - 2700) / 450
const pointStyles = ['circle', 'triangle', 'rect']
// The Colors plugin only colors datasets that set no colors of their own, so the rings take its first colors by hand.
// react-chartjs-2 merges each update into the previous dataset, so the default chart sets the colors back to `undefined`
const ringColors = ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)']

export default function ChartJsScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const isRings = preset === 'rings'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const groups = species.map(name => data.filter(d => d.species === name))

  return (
    <Bubble
      data={{
        datasets: groups.map((group, i) => ({
          label: species[i],
          pointStyle: pointStyles[i],
          data: group.map(d => ({ x: d.flipperLength, y: d.billLength, r: radius(d.bodyMass) })),
          backgroundColor: isRings ? 'transparent' : undefined,
          borderColor: isRings ? ringColors[i] : undefined,
          borderWidth: isRings ? 1.5 : undefined,
        })),
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const d = groups[ctx.datasetIndex][ctx.dataIndex]
                return `${d.species}: flipper ${d.flipperLength} mm, bill ${d.billLength} mm, ${formatMass(d.bodyMass)}`
              },
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Flipper length (mm)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
          y: { title: { display: true, text: 'Bill length (mm)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
