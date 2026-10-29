import React from 'react'
import { mean } from 'd3-array'
import { Chart, LinearScale, PointElement, Colors, Legend, Tooltip } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import dataLabelsPlugin from 'chartjs-plugin-datalabels'
import { Bubble } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

// The annotation plugin adds its line type to Chart.js only when it's registered, so it can't be passed to one chart.
// It draws nothing on a chart that sets no annotations
Chart.register(LinearScale, PointElement, Colors, Legend, Tooltip, annotationPlugin)

// Chart.js expects the bubble radius in pixels, so we scale the body mass ourselves
const radius = (bodyMass: number): number => 2 + (bodyMass - 2700) / 450
const pointStyles = ['circle', 'triangle', 'rect']
// Passed to this chart only: registered with `Chart.register()`, the data labels plugin would label every Chart.js chart
const plugins = [dataLabelsPlugin]

export default function ChartJsScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const isRings = preset === 'rings'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const groups = species.map(name => data.filter(d => d.species === name))
  const averageFlipper = mean(data, d => d.flipperLength)
  const averageBill = mean(data, d => d.billLength)
  const averageLine = { type: 'line' as const, borderColor: textColor, borderWidth: 1, borderDash: [6, 4] }

  return (
    <Bubble
      plugins={plugins}
      data={{
        datasets: groups.map((group, i) => ({
          label: species[i],
          pointStyle: pointStyles[i],
          data: group.map(d => ({ x: d.flipperLength, y: d.billLength, r: radius(d.bodyMass) })),
          // The Colors plugin colors nothing once a dataset sets `backgroundColor` or `borderColor`, but points read `pointBackgroundColor` first.
          // react-chartjs-2 merges each update into the previous dataset, so the default chart sets the ring options back to `undefined`
          pointBackgroundColor: isRings ? 'transparent' : undefined,
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
          // `display: 'auto'` hides the labels that overlap another label. A point's `start` anchor is its bottom edge
          datalabels: {
            display: preset === 'labels' ? 'auto' : false,
            anchor: 'start',
            align: 'bottom',
            color: textColor,
            formatter: (_, ctx) => formatMass(groups[ctx.datasetIndex][ctx.dataIndex].bodyMass),
          },
          annotation: {
            annotations: preset === 'averages'
              ? {
                flipper: { ...averageLine, scaleID: 'x', value: averageFlipper, label: { display: true, content: `Average ${averageFlipper.toFixed(0)} mm`, position: 'start' } },
                bill: { ...averageLine, scaleID: 'y', value: averageBill, label: { display: true, content: `Average ${averageBill.toFixed(1)} mm`, position: 'start' } },
              }
              : {},
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
