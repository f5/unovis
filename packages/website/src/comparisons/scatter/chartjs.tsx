import React from 'react'
import { Chart, LinearScale, PointElement, Colors, Legend, Tooltip } from 'chart.js'
import { Bubble } from 'react-chartjs-2'

import { DataRecord, species, formatMass } from './data'

Chart.register(LinearScale, PointElement, Colors, Legend, Tooltip)

// Chart.js expects the bubble radius in pixels, so we scale the body mass ourselves
const radius = (bodyMass: number): number => 2 + (bodyMass - 2700) / 450
const pointStyles = ['circle', 'triangle', 'rect']

export default function ChartJsScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const groups = species.map(name => data.filter(d => d.species === name))

  return (
    <Bubble
      data={{
        datasets: groups.map((group, i) => ({
          label: species[i],
          pointStyle: pointStyles[i],
          data: group.map(d => ({ x: d.flipperLength, y: d.billLength, r: radius(d.bodyMass) })),
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
